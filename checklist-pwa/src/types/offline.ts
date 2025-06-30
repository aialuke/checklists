// Offline-specific types

export interface OfflineAction {
  id: string
  type: string
  payload: unknown
  timestamp: Date
  retryCount: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying'
  error?: string
  lastAttempt?: Date
}

// Offline state interfaces (used by TanStack Query and Container components)
interface OfflineState {
  isOnline: boolean
  syncQueue: OfflineAction[]
  hasOfflineData: boolean
  connectionQuality: 'poor' | 'fair' | 'good' | 'excellent'
  isSyncing: boolean
  syncProgress: number
  syncErrors: string[]
  lastSyncTime: Date | null
  cacheSize: number
  lastCacheUpdate: Date | null

  // Actions
  queueAction: (action: OfflineAction) => void
  removeFromQueue: (actionId: string) => void
  syncNow: () => Promise<void>
  clearSyncErrors: () => void
  updateCache: (data: unknown) => void
  clearCache: () => void
  getCachedData: (key: string) => unknown

  // Computed getters
  getQueuedActionsCount: () => number
  hasFailedActions: () => boolean
  estimatedSyncTime: () => number
}