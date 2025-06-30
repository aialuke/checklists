import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Types for client-side notifications (toasts)
export interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  timestamp: number
}

export interface NotificationClientState {
  toasts: ToastNotification[]
  maxToasts: number
  defaultDuration: number
  
  // Actions
  addToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  clearToastsByType: (type: ToastNotification['type']) => void
  updateToast: (id: string, updates: Partial<ToastNotification>) => void
  
  // Convenience methods
  showSuccess: (title: string, message?: string, options?: Partial<ToastNotification>) => string
  showError: (title: string, message?: string, options?: Partial<ToastNotification>) => string
  showWarning: (title: string, message?: string, options?: Partial<ToastNotification>) => string
  showInfo: (title: string, message?: string, options?: Partial<ToastNotification>) => string
}

export const useNotificationClientStore = create<NotificationClientState>()(
  devtools(
    (set, get) => ({
      toasts: [],
      maxToasts: 5,
      defaultDuration: 5000, // 5 seconds
      
      addToast: (toast) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const timestamp = Date.now()
        
        const newToast: ToastNotification = {
          id,
          timestamp,
          duration: get().defaultDuration,
          ...toast,
        }
        
        set((state) => {
          const newToasts = [newToast, ...state.toasts]
          
          // Limit the number of toasts
          if (newToasts.length > state.maxToasts) {
            // Remove oldest non-persistent toasts
            const keptToasts = newToasts
              .filter(t => t.persistent)
              .concat(
                newToasts
                  .filter(t => !t.persistent)
                  .slice(0, state.maxToasts - newToasts.filter(t => t.persistent).length)
              )
            
            return { toasts: keptToasts }
          }
          
          return { toasts: newToasts }
        })
        
        // Auto-remove toast after duration (unless persistent)
        if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, newToast.duration)
        }
        
        return id
      },
      
      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        }))
      },
      
      clearToasts: () => {
        set({ toasts: [] })
      },
      
      clearToastsByType: (type) => {
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.type !== type)
        }))
      },
      
      updateToast: (id, updates) => {
        set((state) => ({
          toasts: state.toasts.map(toast =>
            toast.id === id ? { ...toast, ...updates } : toast
          )
        }))
      },
      
      // Convenience methods
      showSuccess: (title, message, options = {}) => {
        return get().addToast({
          type: 'success',
          title,
          message,
          ...options,
        })
      },
      
      showError: (title, message, options = {}) => {
        return get().addToast({
          type: 'error',
          title,
          message,
          persistent: true, // Errors are persistent by default
          ...options,
        })
      },
      
      showWarning: (title, message, options = {}) => {
        return get().addToast({
          type: 'warning',
          title,
          message,
          duration: 8000, // Warnings stay longer
          ...options,
        })
      },
      
      showInfo: (title, message, options = {}) => {
        return get().addToast({
          type: 'info',
          title,
          message,
          ...options,
        })
      },
    }),
    { name: 'notification-client-store' }
  )
)

// Hook for common notification patterns
export const useNotifications = () => {
  const store = useNotificationClientStore()
  
  return {
    // Toast management
    toasts: store.toasts,
    addToast: store.addToast,
    removeToast: store.removeToast,
    clearToasts: store.clearToasts,
    
    // Convenience methods
    success: store.showSuccess,
    error: store.showError,
    warning: store.showWarning,
    info: store.showInfo,
    
    // Common patterns
    taskCompleted: (taskName: string) => {
      return store.showSuccess(
        'Task Completed',
        `"${taskName}" has been marked as complete.`,
        { duration: 3000 }
      )
    },
    
    taskFailed: (taskName: string, error?: string) => {
      return store.showError(
        'Task Update Failed',
        error || `Failed to update "${taskName}". Please try again.`,
        {
          action: {
            label: 'Retry',
            onClick: () => {
              // Retry logic would be passed in from the component
              console.log('Retry clicked for task:', taskName)
            }
          }
        }
      )
    },
    
    offlineMode: () => {
      return store.showWarning(
        'Working Offline',
        'You\'re currently offline. Changes will sync when you\'re back online.',
        { persistent: true, duration: 0 }
      )
    },
    
    backOnline: () => {
      // Clear offline warnings first
      store.clearToastsByType('warning')
      
      return store.showSuccess(
        'Back Online',
        'Connection restored. Syncing your changes...',
        { duration: 3000 }
      )
    },
    
    syncCompleted: (itemCount: number) => {
      return store.showSuccess(
        'Sync Complete',
        `${itemCount} ${itemCount === 1 ? 'item' : 'items'} synced successfully.`,
        { duration: 3000 }
      )
    },
    
    syncFailed: (itemCount: number) => {
      return store.showError(
        'Sync Failed',
        `Failed to sync ${itemCount} ${itemCount === 1 ? 'item' : 'items'}. Will retry automatically.`,
        {
          action: {
            label: 'Retry Now',
            onClick: () => {
              // Manual retry logic would be passed in
              console.log('Manual sync retry requested')
            }
          }
        }
      )
    },
    
    permissionDenied: (permissionType: string) => {
      return store.showWarning(
        'Permission Required',
        `${permissionType} permission is needed for full functionality.`,
        {
          persistent: true,
          action: {
            label: 'Grant Permission',
            onClick: () => {
              // Permission request logic would be handled by the component
              console.log('Permission grant requested for:', permissionType)
            }
          }
        }
      )
    },
    
    updateAvailable: () => {
      return store.showInfo(
        'Update Available',
        'A new version of the app is available.',
        {
          persistent: true,
          action: {
            label: 'Update Now',
            onClick: () => {
              // App update logic would be handled by PWA service worker
              window.location.reload()
            }
          }
        }
      )
    },
  }
}

// Utility function to create notification with automatic cleanup
const createTemporaryNotification = (
  type: ToastNotification['type'],
  title: string,
  message?: string,
  duration = 5000
): Promise<void> => {
  const { addToast } = useNotificationClientStore.getState()
  
  return new Promise((resolve) => {
    addToast({
      type,
      title,
      message,
      duration,
    })
    
    setTimeout(() => {
      resolve()
    }, duration)
  })
}

// Global notification manager for external integrations
const notificationManager = {
  show: (notification: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    return useNotificationClientStore.getState().addToast(notification)
  },
  
  remove: (id: string) => {
    useNotificationClientStore.getState().removeToast(id)
  },
  
  clear: () => {
    useNotificationClientStore.getState().clearToasts()
  },
  
  success: (title: string, message?: string) => {
    return useNotificationClientStore.getState().showSuccess(title, message)
  },
  
  error: (title: string, message?: string) => {
    return useNotificationClientStore.getState().showError(title, message)
  },
  
  warning: (title: string, message?: string) => {
    return useNotificationClientStore.getState().showWarning(title, message)
  },
  
  info: (title: string, message?: string) => {
    return useNotificationClientStore.getState().showInfo(title, message)
  },
}