import React, { useCallback } from 'react'

import {
  useNetworkStatus,
  useSyncStatus,
  useSyncQueue,
  useBackgroundSync,
  useAddToSyncQueue,
  useClearSyncQueue,
} from '../queries/offlineQueries'

import type { OfflineAction } from '../types'

// Offline Status Container Props Interface
export interface OfflineStatusContainerProps {
  children: (props: OfflineStatusContainerState) => React.ReactNode
}

// State passed to presentational components
export interface OfflineStatusContainerState {
  // Network state
  isOnline: boolean
  quality: string
  connectionQuality: 'poor' | 'fair' | 'good' | 'excellent'

  // Sync state
  isSyncing: boolean
  lastSync: Date | null
  progress: number
  syncProgress: number
  errors: string[]

  // Queue visualization data
  queueCount: number
  syncQueue: OfflineAction[]
  hasFailedActions: boolean
  hasData: boolean
  cacheSize: number
  lastCacheUpdate: Date | null

  // Actions
  syncNow: () => Promise<void>
  clearCache: () => void
  clearSyncErrors: () => void
  queueAction: (action: OfflineAction) => void

  // Computed getters
  getQueuedActionsCount: () => number
  estimatedSyncTime: () => number
}

/**
 * OfflineStatusContainer - Connects UI components to OfflineStore
 * Manages offline/sync status and actions
 */
export const OfflineStatusContainer: React.FC<OfflineStatusContainerProps> = ({ children }) => {
  // Get state from TanStack Query hooks
  const { data: networkStatus } = useNetworkStatus()
  const { data: syncStatus } = useSyncStatus()
  const { data: syncQueue = [] } = useSyncQueue()
  
  // Get mutations
  const backgroundSyncMutation = useBackgroundSync()
  const addToQueueMutation = useAddToSyncQueue()
  const clearQueueMutation = useClearSyncQueue()

  // Action callbacks
  const syncNow = useCallback(async () => {
    try {
      await backgroundSyncMutation.mutateAsync()
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }, [backgroundSyncMutation])
  
  const clearCache = useCallback(() => {
    // Clear cache through QueryClient or implement cache clearing logic
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('checklist')) {
            caches.delete(name)
          }
        })
      })
    }
  }, [])
  
  const clearSyncErrors = useCallback(() => {
    // Clear sync errors by clearing queue (which clears errors)
    clearQueueMutation.mutate()
  }, [clearQueueMutation])
  
  const queueAction = useCallback((action: OfflineAction) => {
    addToQueueMutation.mutate({
      type: action.type as 'task_completion' | 'checklist_update' | 'note_add',
      data: action.payload,
      maxRetries: 3,
    })
  }, [addToQueueMutation])
  
  const getQueuedActionsCount = useCallback(() => {
    return syncQueue.length
  }, [syncQueue])
  
  const estimatedSyncTime = useCallback(() => {
    // Estimate 1 second per queued action
    return syncQueue.length * 1000
  }, [syncQueue])
  
  // Compute derived state
  const isOnline = networkStatus?.isOnline ?? navigator.onLine
  const quality = networkStatus?.connectionType ?? 'unknown'
  const connectionQuality: 'poor' | 'fair' | 'good' | 'excellent' = 
    networkStatus?.isSlowConnection ? 'poor' : 
    quality === '2g' || quality === 'slow-2g' ? 'poor' :
    quality === '3g' ? 'fair' :
    quality === '4g' ? 'good' : 'excellent'
  
  const isSyncing = syncStatus?.isInProgress ?? backgroundSyncMutation.isPending
  const lastSync = syncStatus?.lastSyncTime ? new Date(syncStatus.lastSyncTime) : null
  const progress = isSyncing ? 50 : 100 // Simple progress calculation
  const errors = syncStatus?.errors ?? []
  const queueCount = syncQueue.length
  const hasFailedActions = errors.length > 0
  const hasData = queueCount > 0
  const cacheSize = queueCount * 1024 // Rough estimate
  const lastCacheUpdate = syncStatus?.lastSyncTime ? new Date(syncStatus.lastSyncTime) : null

  const containerState: OfflineStatusContainerState = {
    // Network state
    isOnline,
    quality,
    connectionQuality,

    // Sync state
    isSyncing,
    lastSync,
    progress,
    syncProgress: progress,
    errors,

    // Queue visualization data
    queueCount,
    syncQueue: syncQueue as unknown as OfflineAction[],
    hasFailedActions,
    hasData,
    cacheSize,
    lastCacheUpdate,

    // Actions
    syncNow,
    clearCache,
    clearSyncErrors,
    queueAction,

    // Computed getters
    getQueuedActionsCount,
    estimatedSyncTime,
  }

  return <>{children(containerState)}</>
}

