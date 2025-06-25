import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import type { OfflineState, OfflineAction } from './types'

// Network detection utilities
const getNetworkInfo = (): {
  isOnline: boolean
  connectionQuality: 'poor' | 'good' | 'excellent'
} => {
  const isOnline = navigator.onLine

  // Use Network Information API if available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    const effectiveType = connection?.effectiveType || '4g'

    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return { isOnline, connectionQuality: 'poor' }
      case '3g':
        return { isOnline, connectionQuality: 'good' }
      case '4g':
      default:
        return { isOnline, connectionQuality: 'excellent' }
    }
  }

  return { isOnline, connectionQuality: 'good' }
}

// Mock sync API for development
const mockSyncAPI = {
  syncAction: async (action: OfflineAction): Promise<void> => {
    // Simulate network delay based on action type
    const delay = action.priority === 'critical' ? 500 : 1000
    await new Promise((resolve) => setTimeout(resolve, delay))

    // Simulate occasional failures
    if (action.retryCount > 0 && Math.random() < 0.2) {
      throw new Error(`Sync failed for action ${action.type}`)
    }

    console.log(`Synced action: ${action.type}`, action.payload)
  },

  batchSync: async (
    actions: OfflineAction[],
  ): Promise<{ success: OfflineAction[]; failed: OfflineAction[] }> => {
    const results = { success: [] as OfflineAction[], failed: [] as OfflineAction[] }

    for (const action of actions) {
      try {
        await mockSyncAPI.syncAction(action)
        results.success.push(action)
      } catch (error) {
        results.failed.push(action)
      }
    }

    return results
  },
}

// IndexedDB cache management
const cacheManager = {
  set: async (key: string, data: any): Promise<void> => {
    try {
      localStorage.setItem(
        `cache_${key}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      )
    } catch (error) {
      console.error('Cache set error:', error)
    }
  },

  get: async (key: string): Promise<any> => {
    try {
      const cached = localStorage.getItem(`cache_${key}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        return parsed.data
      }
    } catch (error) {
      console.error('Cache get error:', error)
    }
    return null
  },

  clear: async (): Promise<void> => {
    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith('cache_'))
      keys.forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  },

  getSize: (): number => {
    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith('cache_'))
      return keys.reduce((size, key) => {
        const item = localStorage.getItem(key)
        return size + (item ? item.length : 0)
      }, 0)
    } catch (error) {
      return 0
    }
  },
}

export const useOfflineStore = create<OfflineState>()(
  devtools(
    subscribeWithSelector(
      immer(
        persist(
          (set, get) => ({
            // Initial state
            isOnline: navigator.onLine,
            connectionQuality: getNetworkInfo().connectionQuality,
            lastSyncTime: null,
            syncQueue: [],
            isSyncing: false,
            syncProgress: 0,
            syncErrors: [],
            hasOfflineData: false,
            cacheSize: 0,
            lastCacheUpdate: null,

            // Actions
            queueAction: (action: OfflineAction) => {
              set((state) => {
                // Check for duplicate actions
                const existingIndex = state.syncQueue.findIndex(
                  (a) =>
                    a.type === action.type &&
                    JSON.stringify(a.payload) === JSON.stringify(action.payload),
                )

                if (existingIndex !== -1) {
                  // Update existing action
                  state.syncQueue[existingIndex] = {
                    ...action,
                    retryCount: state.syncQueue[existingIndex].retryCount,
                  }
                } else {
                  // Add new action
                  state.syncQueue.push({
                    ...action,
                    id: action.id || `${action.type}_${Date.now()}`,
                    timestamp: action.timestamp || new Date(),
                    retryCount: 0,
                    status: 'pending',
                  })
                }

                // Sort by priority and timestamp
                state.syncQueue.sort((a, b) => {
                  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
                  const aPriority = priorityOrder[a.priority]
                  const bPriority = priorityOrder[b.priority]

                  if (aPriority !== bPriority) {
                    return aPriority - bPriority
                  }

                  return a.timestamp.getTime() - b.timestamp.getTime()
                })
              })
            },

            removeFromQueue: (actionId: string) => {
              set((state) => {
                state.syncQueue = state.syncQueue.filter((action) => action.id !== actionId)
              })
            },

            syncNow: async () => {
              const state = get()

              if (state.isSyncing || state.syncQueue.length === 0 || !state.isOnline) {
                return
              }

              set((state) => {
                state.isSyncing = true
                state.syncProgress = 0
                state.syncErrors = []
              })

              try {
                const actionsToSync = state.syncQueue.filter((a) => a.status === 'pending')
                let processedCount = 0

                for (const action of actionsToSync) {
                  set((state) => {
                    const actionIndex = state.syncQueue.findIndex((a) => a.id === action.id)
                    if (actionIndex !== -1) {
                      state.syncQueue[actionIndex].status = 'retrying'
                    }
                  })

                  try {
                    await mockSyncAPI.syncAction(action)

                    set((state) => {
                      state.syncQueue = state.syncQueue.filter((a) => a.id !== action.id)
                    })
                  } catch (error) {
                    set((state) => {
                      const actionIndex = state.syncQueue.findIndex((a) => a.id === action.id)
                      if (actionIndex !== -1) {
                        state.syncQueue[actionIndex].retryCount += 1
                        state.syncQueue[actionIndex].status = 'failed'

                        // Remove action if too many retries
                        if (state.syncQueue[actionIndex].retryCount >= 3) {
                          state.syncErrors.push(
                            `Failed to sync ${action.type} after 3 attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
                          )
                          state.syncQueue = state.syncQueue.filter((a) => a.id !== action.id)
                        } else {
                          // Reset to pending for retry
                          state.syncQueue[actionIndex].status = 'pending'
                        }
                      }
                    })
                  }

                  processedCount++
                  set((state) => {
                    state.syncProgress = Math.round((processedCount / actionsToSync.length) * 100)
                  })
                }

                set((state) => {
                  state.lastSyncTime = new Date()
                  state.isSyncing = false
                  state.syncProgress = 100
                })

                // Auto-clear progress after delay
                setTimeout(() => {
                  set((state) => {
                    state.syncProgress = 0
                  })
                }, 3000)
              } catch (error) {
                set((state) => {
                  state.isSyncing = false
                  state.syncProgress = 0
                  state.syncErrors.push(
                    error instanceof Error ? error.message : 'Sync process failed',
                  )
                })
              }
            },

            clearSyncErrors: () => {
              set((state) => {
                state.syncErrors = []
              })
            },

            // Cache management
            updateCache: async (data: any) => {
              const cacheKey = `data_${Date.now()}`
              await cacheManager.set(cacheKey, data)

              set((state) => {
                state.hasOfflineData = true
                state.lastCacheUpdate = new Date()
                state.cacheSize = cacheManager.getSize()
              })
            },

            clearCache: async () => {
              await cacheManager.clear()

              set((state) => {
                state.hasOfflineData = false
                state.lastCacheUpdate = null
                state.cacheSize = 0
              })
            },

            getCachedData: (key: string) => {
              return cacheManager.get(key)
            },

            // Computed getters
            getQueuedActionsCount: () => {
              return get().syncQueue.length
            },

            hasFailedActions: () => {
              return get().syncQueue.some((action) => action.status === 'failed')
            },

            estimatedSyncTime: () => {
              const state = get()
              const pendingActions = state.syncQueue.filter((a) => a.status === 'pending')

              // Estimate based on connection quality and action count
              const baseTimePerAction =
                state.connectionQuality === 'poor'
                  ? 2000
                  : state.connectionQuality === 'good'
                    ? 1000
                    : 500

              return pendingActions.length * baseTimePerAction
            },
          }),
          {
            name: 'offline-store',
            version: 1,
            // Persist sync queue and offline data flags
            partialize: (state) => ({
              syncQueue: state.syncQueue,
              lastSyncTime: state.lastSyncTime,
              hasOfflineData: state.hasOfflineData,
              cacheSize: state.cacheSize,
              lastCacheUpdate: state.lastCacheUpdate,
            }),
          },
        ),
      ),
    ),
    {
      name: 'offline-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)

// Network status monitoring
let networkStatusInitialized = false

export const initializeNetworkMonitoring = () => {
  if (networkStatusInitialized) return

  const updateNetworkStatus = () => {
    const { isOnline, connectionQuality } = getNetworkInfo()

    useOfflineStore.setState((state) => {
      state.isOnline = isOnline
      state.connectionQuality = connectionQuality
    })

    // Auto-sync when coming back online
    if (isOnline && useOfflineStore.getState().syncQueue.length > 0) {
      setTimeout(() => {
        useOfflineStore.getState().syncNow()
      }, 1000) // Small delay to ensure stable connection
    }
  }

  // Listen for online/offline events
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)

  // Listen for connection changes
  if ('connection' in navigator) {
    ;(navigator as any).connection?.addEventListener('change', updateNetworkStatus)
  }

  // Initial check
  updateNetworkStatus()

  networkStatusInitialized = true
}

// Selectors for optimized subscriptions
export const offlineSelectors = {
  isOnline: (state: OfflineState) => state.isOnline,
  connectionQuality: (state: OfflineState) => state.connectionQuality,
  syncQueue: (state: OfflineState) => state.syncQueue,
  isSyncing: (state: OfflineState) => state.isSyncing,
  syncProgress: (state: OfflineState) => state.syncProgress,
  syncErrors: (state: OfflineState) => state.syncErrors,
  hasOfflineData: (state: OfflineState) => state.hasOfflineData,
  lastSyncTime: (state: OfflineState) => state.lastSyncTime,

  // Computed selectors
  queuedActionsCount: (state: OfflineState) => state.syncQueue.length,
  hasFailedActions: (state: OfflineState) => state.syncQueue.some((a) => a.status === 'failed'),
  pendingActionsCount: (state: OfflineState) =>
    state.syncQueue.filter((a) => a.status === 'pending').length,
  criticalActionsCount: (state: OfflineState) =>
    state.syncQueue.filter((a) => a.priority === 'critical').length,

  networkStatus: (state: OfflineState) => ({
    isOnline: state.isOnline,
    quality: state.connectionQuality,
    canSync: state.isOnline && !state.isSyncing,
  }),
}

// React hooks
export const useNetworkStatus = () => {
  return useOfflineStore(offlineSelectors.networkStatus)
}

export const useSyncStatus = () => {
  return useOfflineStore((state) => ({
    isSyncing: state.isSyncing,
    progress: state.syncProgress,
    queueCount: state.syncQueue.length,
    errors: state.syncErrors,
    lastSync: state.lastSyncTime,
  }))
}

export const useOfflineData = () => {
  return useOfflineStore((state) => ({
    hasData: state.hasOfflineData,
    cacheSize: state.cacheSize,
    lastUpdate: state.lastCacheUpdate,
  }))
}

export const useOfflineActions = () => {
  return {
    queueAction: useOfflineStore((state) => state.queueAction),
    syncNow: useOfflineStore((state) => state.syncNow),
    clearSyncErrors: useOfflineStore((state) => state.clearSyncErrors),
    updateCache: useOfflineStore((state) => state.updateCache),
    clearCache: useOfflineStore((state) => state.clearCache),
    getCachedData: useOfflineStore((state) => state.getCachedData),
  }
}

// Helper functions for creating offline actions
export const createOfflineAction = (
  type: OfflineAction['type'],
  payload: any,
  priority: OfflineAction['priority'] = 'medium',
): OfflineAction => ({
  id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type,
  payload,
  timestamp: new Date(),
  retryCount: 0,
  priority,
  status: 'pending',
})

// Queue specific actions
export const queueTaskCompletion = (taskId: string, notes?: string) => {
  const action = createOfflineAction('COMPLETE_TASK', { taskId, notes }, 'high')
  useOfflineStore.getState().queueAction(action)
}

export const queueChecklistSubmission = (checklistId: string) => {
  const action = createOfflineAction('SUBMIT_CHECKLIST', { checklistId }, 'critical')
  useOfflineStore.getState().queueAction(action)
}

// Development helpers
export const resetOfflineStore = () => {
  useOfflineStore.setState({
    isOnline: navigator.onLine,
    connectionQuality: getNetworkInfo().connectionQuality,
    lastSyncTime: null,
    syncQueue: [],
    isSyncing: false,
    syncProgress: 0,
    syncErrors: [],
    hasOfflineData: false,
    cacheSize: 0,
    lastCacheUpdate: null,
  })
}

export const getOfflineState = () => {
  return useOfflineStore.getState()
}

// Initialize network monitoring when module loads
if (typeof window !== 'undefined') {
  initializeNetworkMonitoring()
}
