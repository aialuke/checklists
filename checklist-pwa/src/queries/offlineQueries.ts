import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { onlineManager } from '@tanstack/react-query'

// Query key factory for offline-related queries
const offlineKeys = {
  all: ['offline'] as const,
  status: () => [...offlineKeys.all, 'status'] as const,
  queue: () => [...offlineKeys.all, 'queue'] as const,
  sync: () => [...offlineKeys.all, 'sync'] as const,
} as const

// Types for offline functionality
export interface NetworkStatus {
  isOnline: boolean
  lastConnected: number | null
  connectionType?: string
  isSlowConnection?: boolean
}

export interface QueuedAction {
  id: string
  type: 'task_completion' | 'checklist_update' | 'note_add'
  data: any
  timestamp: number
  retryCount: number
  maxRetries: number
}

export interface SyncStatus {
  isInProgress: boolean
  pendingCount: number
  lastSyncTime: number | null
  errors: string[]
}

// Network status query with PWA optimizations
export const useNetworkStatus = () => {
  return useQuery({
    queryKey: offlineKeys.status(),
    queryFn: (): NetworkStatus => {
      const connection = (navigator as any).connection
      return {
        isOnline: navigator.onLine,
        lastConnected: navigator.onLine ? Date.now() : getLastConnectedTime(),
        connectionType: connection?.effectiveType || 'unknown',
        isSlowConnection: connection?.effectiveType === 'slow-2g' || 
                         connection?.effectiveType === '2g',
      }
    },
    staleTime: 0, // Always fresh
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      // Poll more frequently when offline
      const networkData = query.state.data as NetworkStatus | undefined
      return networkData?.isOnline ? false : 5000
    },
    networkMode: 'always', // This query should work regardless of network
  })
}

// Sync queue management
export const useSyncQueue = () => {
  return useQuery({
    queryKey: offlineKeys.queue(),
    queryFn: (): QueuedAction[] => {
      const queue = localStorage.getItem('checklist-sync-queue')
      return queue ? JSON.parse(queue) : []
    },
    staleTime: 0,
    networkMode: 'always',
  })
}

// Sync status tracking
export const useSyncStatus = () => {
  return useQuery({
    queryKey: offlineKeys.sync(),
    queryFn: (): SyncStatus => {
      const status = localStorage.getItem('checklist-sync-status')
      const defaultStatus: SyncStatus = {
        isInProgress: false,
        pendingCount: 0,
        lastSyncTime: null,
        errors: []
      }
      return status ? { ...defaultStatus, ...JSON.parse(status) } : defaultStatus
    },
    staleTime: 1000, // Refresh every second during sync
    networkMode: 'always',
  })
}

// Add action to sync queue
export const useAddToSyncQueue = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount'>) => {
      const queuedAction: QueuedAction = {
        id: `${action.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
        ...action,
      }
      
      const existingQueue = getStoredQueue()
      const newQueue = [...existingQueue, queuedAction]
      
      localStorage.setItem('checklist-sync-queue', JSON.stringify(newQueue))
      return queuedAction
    },
    onSuccess: () => {
      // Invalidate queue to trigger re-render
      queryClient.invalidateQueries({ queryKey: offlineKeys.queue() })
      
      // Try to sync immediately if online
      if (navigator.onLine) {
        queryClient.invalidateQueries({ queryKey: ['sync-trigger'] })
      }
    },
    networkMode: 'always',
  })
}

// Background sync mutation
export const useBackgroundSync = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (): Promise<{ processed: number; failed: number; errors: string[] }> => {
      if (!navigator.onLine) {
        throw new Error('Cannot sync while offline')
      }
      
      updateSyncStatus({ isInProgress: true, errors: [] })
      
      const queue = getStoredQueue()
      if (queue.length === 0) {
        updateSyncStatus({ isInProgress: false, pendingCount: 0 })
        return { processed: 0, failed: 0, errors: [] }
      }
      
      let processed = 0
      let failed = 0
      const errors: string[] = []
      const remainingQueue: QueuedAction[] = []
      
      for (const action of queue) {
        try {
          await processQueuedAction(action)
          processed++
        } catch (error) {
          failed++
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          errors.push(`${action.type}: ${errorMessage}`)
          
          // Retry logic
          if (action.retryCount < action.maxRetries) {
            remainingQueue.push({
              ...action,
              retryCount: action.retryCount + 1,
            })
          }
        }
      }
      
      // Update queue with remaining items
      localStorage.setItem('checklist-sync-queue', JSON.stringify(remainingQueue))
      
      // Update sync status
      updateSyncStatus({
        isInProgress: false,
        pendingCount: remainingQueue.length,
        lastSyncTime: Date.now(),
        errors,
      })
      
      return { processed, failed, errors }
    },
    onSuccess: () => {
      // Refresh all relevant queries after sync
      queryClient.invalidateQueries({ queryKey: offlineKeys.queue() })
      queryClient.invalidateQueries({ queryKey: offlineKeys.sync() })
      queryClient.invalidateQueries({ queryKey: ['checklists'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    networkMode: 'online',
  })
}

// Clear sync queue (for testing or manual reset)
export const useClearSyncQueue = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('checklist-sync-queue')
      updateSyncStatus({ pendingCount: 0, errors: [] })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: offlineKeys.queue() })
      queryClient.invalidateQueries({ queryKey: offlineKeys.sync() })
    },
    networkMode: 'always',
  })
}

// Helper functions
function getStoredQueue(): QueuedAction[] {
  const queue = localStorage.getItem('checklist-sync-queue')
  return queue ? JSON.parse(queue) : []
}

function getLastConnectedTime(): number | null {
  const timestamp = localStorage.getItem('last-connected-time')
  return timestamp ? parseInt(timestamp, 10) : null
}

function updateSyncStatus(updates: Partial<SyncStatus>) {
  const current = getCurrentSyncStatus()
  const newStatus = { ...current, ...updates }
  localStorage.setItem('checklist-sync-status', JSON.stringify(newStatus))
}

function getCurrentSyncStatus(): SyncStatus {
  const status = localStorage.getItem('checklist-sync-status')
  const defaultStatus: SyncStatus = {
    isInProgress: false,
    pendingCount: 0,
    lastSyncTime: null,
    errors: []
  }
  return status ? { ...defaultStatus, ...JSON.parse(status) } : defaultStatus
}

// Process individual queued actions (mock implementation - replace with actual API calls)
async function processQueuedAction(action: QueuedAction): Promise<void> {
  // This is a mock implementation - replace with actual API calls
  await new Promise(resolve => setTimeout(resolve, 100))
  
  switch (action.type) {
    case 'task_completion':
      // Mock API call to update task completion
      console.log('Syncing task completion:', action.data)
      break
    case 'checklist_update':
      // Mock API call to update checklist
      console.log('Syncing checklist update:', action.data)
      break
    case 'note_add':
      // Mock API call to add note
      console.log('Syncing note addition:', action.data)
      break
    default:
      throw new Error(`Unknown action type: ${(action as any).type}`)
  }
}

// Set up network event listeners
export const setupNetworkListeners = () => {
  const updateLastConnectedTime = () => {
    if (navigator.onLine) {
      localStorage.setItem('last-connected-time', Date.now().toString())
    }
  }
  
  // Update online status when network changes
  const handleOnline = () => {
    updateLastConnectedTime()
    onlineManager.setOnline(true)
  }
  
  const handleOffline = () => {
    onlineManager.setOnline(false)
  }
  
  // Set initial state
  updateLastConnectedTime()
  onlineManager.setOnline(navigator.onLine)
  
  // Add event listeners
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  // Cleanup function
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

// PWA-specific query defaults for offline-first behavior
const offlineQueryDefaults = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  networkMode: 'offlineFirst' as const,
  retry: (failureCount: number, error: Error & { status?: number }) => {
    // Don't retry on 4xx errors, but retry on network errors
    if (error?.status && error.status >= 400 && error.status < 500) {
      return false
    }
    return failureCount < 3
  },
}