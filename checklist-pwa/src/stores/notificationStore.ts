import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import type { NotificationState, Notification, ToastNotification, AlertNotification } from './types'

// Push notification configuration
const VAPID_PUBLIC_KEY = 'your-vapid-public-key' // Replace with actual VAPID key

// Mock push service for development
const mockPushService = {
  subscribe: async (): Promise<PushSubscription> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return mock subscription
    return {
      endpoint: 'https://fcm.googleapis.com/fcm/send/mock-endpoint',
      keys: {
        p256dh: 'mock-p256dh-key',
        auth: 'mock-auth-key',
      },
      getKey: () => null,
      toJSON: () => ({}),
      unsubscribe: () => Promise.resolve(true),
    } as PushSubscription
  },

  unsubscribe: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
  },

  sendNotification: async (subscription: PushSubscription, payload: any): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    console.log('Mock push notification sent:', payload)
  },
}

// Notification templates
const notificationTemplates = {
  taskOverdue: (taskName: string) => ({
    type: 'warning' as const,
    title: 'Task Overdue',
    message: `The task "${taskName}" is past its deadline. Please complete it as soon as possible.`,
    priority: 'high' as const,
  }),

  checklistDue: (checklistName: string, minutes: number) => ({
    type: 'info' as const,
    title: 'Checklist Due Soon',
    message: `"${checklistName}" is due in ${minutes} minutes.`,
    priority: 'medium' as const,
  }),

  checklistCompleted: (checklistName: string) => ({
    type: 'success' as const,
    title: 'Checklist Completed',
    message: `Successfully completed "${checklistName}".`,
    priority: 'low' as const,
  }),

  syncFailure: (errorMessage: string) => ({
    type: 'error' as const,
    title: 'Sync Failed',
    message: `Failed to sync data: ${errorMessage}`,
    priority: 'medium' as const,
  }),

  teamUpdate: (memberName: string, action: string) => ({
    type: 'info' as const,
    title: 'Team Update',
    message: `${memberName} ${action}`,
    priority: 'low' as const,
  }),
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    subscribeWithSelector(
      immer(
        persist(
          (set, get) => ({
            // Initial state
            notifications: [],
            unreadCount: 0,
            pushEnabled: false,
            pushSubscription: null,
            notificationPermission: 'default',
            toasts: [],
            alertQueue: [],

            // Actions
            addNotification: (notificationData) => {
              set((state) => {
                const notification: Notification = {
                  ...notificationData,
                  id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  read: false,
                  created_at: new Date().toISOString(),
                }

                state.notifications.unshift(notification)
                state.unreadCount += 1

                // Limit total notifications to prevent memory issues
                if (state.notifications.length > 100) {
                  state.notifications = state.notifications.slice(0, 100)
                }

                // Auto-show as toast for high priority notifications
                if (notification.priority === 'high' || notification.priority === 'critical') {
                  get().showToast({
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    duration: notification.priority === 'critical' ? 10000 : 5000,
                  })
                }
              })
            },

            markAsRead: (notificationId: string) => {
              set((state) => {
                const notification = state.notifications.find((n) => n.id === notificationId)
                if (notification && !notification.read) {
                  notification.read = true
                  state.unreadCount = Math.max(0, state.unreadCount - 1)
                }
              })
            },

            markAllAsRead: () => {
              set((state) => {
                state.notifications.forEach((notification) => {
                  notification.read = true
                })
                state.unreadCount = 0
              })
            },

            removeNotification: (notificationId: string) => {
              set((state) => {
                const index = state.notifications.findIndex((n) => n.id === notificationId)
                if (index !== -1) {
                  const notification = state.notifications[index]
                  if (!notification.read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1)
                  }
                  state.notifications.splice(index, 1)
                }
              })
            },

            clearOldNotifications: () => {
              set((state) => {
                const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                const newNotifications = state.notifications.filter((notification) => {
                  const createdAt = new Date(notification.created_at)
                  const isRecent = createdAt > oneWeekAgo

                  // If removing unread notification, update count
                  if (!isRecent && !notification.read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1)
                  }

                  return isRecent
                })

                state.notifications = newNotifications
              })
            },

            // Push notification methods
            requestNotificationPermission: async () => {
              if (!('Notification' in window)) {
                console.warn('Browser does not support notifications')
                return false
              }

              if (Notification.permission === 'granted') {
                set((state) => {
                  state.notificationPermission = 'granted'
                })
                return true
              }

              try {
                const permission = await Notification.requestPermission()
                set((state) => {
                  state.notificationPermission = permission
                })

                return permission === 'granted'
              } catch (error) {
                console.error('Failed to request notification permission:', error)
                return false
              }
            },

            subscribeToPush: async () => {
              if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                console.warn('Push messaging is not supported')
                return false
              }

              try {
                // First ensure we have notification permission
                const hasPermission = await get().requestNotificationPermission()
                if (!hasPermission) {
                  return false
                }

                // Register service worker
                const registration = await navigator.serviceWorker.register('/sw.js')
                await navigator.serviceWorker.ready

                // Subscribe to push
                const subscription = await mockPushService.subscribe()

                set((state) => {
                  state.pushEnabled = true
                  state.pushSubscription = subscription
                })

                // Send subscription to server (mock)
                console.log('Push subscription created:', subscription)

                return true
              } catch (error) {
                console.error('Failed to subscribe to push notifications:', error)
                return false
              }
            },

            unsubscribeFromPush: async () => {
              const state = get()

              if (!state.pushSubscription) {
                return
              }

              try {
                await mockPushService.unsubscribe()

                set((state) => {
                  state.pushEnabled = false
                  state.pushSubscription = null
                })
              } catch (error) {
                console.error('Failed to unsubscribe from push notifications:', error)
              }
            },

            // Toast notification methods
            showToast: (toastData) => {
              set((state) => {
                const toast: ToastNotification = {
                  ...toastData,
                  id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  duration: toastData.duration || 4000,
                }

                state.toasts.push(toast)

                // Auto-hide toast after duration
                if (toast.duration && toast.duration > 0) {
                  setTimeout(() => {
                    get().hideToast(toast.id)
                  }, toast.duration)
                }
              })
            },

            hideToast: (toastId: string) => {
              set((state) => {
                state.toasts = state.toasts.filter((toast) => toast.id !== toastId)
              })
            },

            // Computed getters
            getNotificationsByType: (type: string) => {
              return get().notifications.filter((notification) => notification.type === type)
            },

            getRecentNotifications: (hours: number = 24) => {
              const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
              return get().notifications.filter((notification) => {
                const createdAt = new Date(notification.created_at)
                return createdAt > cutoff
              })
            },
          }),
          {
            name: 'notification-store',
            version: 1,
            // Persist notifications and push subscription
            partialize: (state) => ({
              notifications: state.notifications.slice(0, 50), // Only persist recent notifications
              unreadCount: state.unreadCount,
              pushEnabled: state.pushEnabled,
              notificationPermission: state.notificationPermission,
            }),
            // Don't persist temporary UI state
            blacklist: ['toasts', 'alertQueue', 'pushSubscription'],
          },
        ),
      ),
    ),
    {
      name: 'notification-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)

// Auto-cleanup old notifications every hour
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      useNotificationStore.getState().clearOldNotifications()
    },
    60 * 60 * 1000,
  ) // 1 hour
}

// Selectors for optimized subscriptions
export const notificationSelectors = {
  notifications: (state: NotificationState) => state.notifications,
  unreadCount: (state: NotificationState) => state.unreadCount,
  toasts: (state: NotificationState) => state.toasts,
  alertQueue: (state: NotificationState) => state.alertQueue,
  pushEnabled: (state: NotificationState) => state.pushEnabled,
  notificationPermission: (state: NotificationState) => state.notificationPermission,

  // Filtered selectors
  unreadNotifications: (state: NotificationState) => state.notifications.filter((n) => !n.read),

  criticalNotifications: (state: NotificationState) =>
    state.notifications.filter((n) => n.priority === 'critical'),

  recentNotifications: (state: NotificationState) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return state.notifications.filter((n) => new Date(n.created_at) > oneHourAgo)
  },

  // UI state
  hasUnreadNotifications: (state: NotificationState) => state.unreadCount > 0,
  hasActiveToasts: (state: NotificationState) => state.toasts.length > 0,
  canUsePushNotifications: (state: NotificationState) =>
    state.notificationPermission === 'granted' && 'serviceWorker' in navigator,
}

// React hooks for notifications
export const useNotifications = () => {
  return useNotificationStore(notificationSelectors.notifications)
}

export const useUnreadNotifications = () => {
  return useNotificationStore(notificationSelectors.unreadNotifications)
}

export const useNotificationCount = () => {
  return useNotificationStore(notificationSelectors.unreadCount)
}

export const useToasts = () => {
  return useNotificationStore(notificationSelectors.toasts)
}

export const usePushNotifications = () => {
  return {
    enabled: useNotificationStore(notificationSelectors.pushEnabled),
    permission: useNotificationStore(notificationSelectors.notificationPermission),
    canUse: useNotificationStore(notificationSelectors.canUsePushNotifications),
    subscribe: useNotificationStore((state) => state.subscribeToPush),
    unsubscribe: useNotificationStore((state) => state.unsubscribeFromPush),
    requestPermission: useNotificationStore((state) => state.requestNotificationPermission),
  }
}

export const useNotificationActions = () => {
  return {
    add: useNotificationStore((state) => state.addNotification),
    markAsRead: useNotificationStore((state) => state.markAsRead),
    markAllAsRead: useNotificationStore((state) => state.markAllAsRead),
    remove: useNotificationStore((state) => state.removeNotification),
    showToast: useNotificationStore((state) => state.showToast),
    hideToast: useNotificationStore((state) => state.hideToast),
  }
}

// Helper functions for creating notifications
export const createNotification = {
  taskOverdue: (taskName: string, userId: string) => {
    const template = notificationTemplates.taskOverdue(taskName)
    return {
      ...template,
      user_id: userId,
      action_url: '/checklists',
    }
  },

  checklistDue: (checklistName: string, minutes: number, userId: string) => {
    const template = notificationTemplates.checklistDue(checklistName, minutes)
    return {
      ...template,
      user_id: userId,
      action_url: '/checklists',
    }
  },

  checklistCompleted: (checklistName: string, userId: string) => {
    const template = notificationTemplates.checklistCompleted(checklistName)
    return {
      ...template,
      user_id: userId,
    }
  },

  syncFailure: (errorMessage: string, userId: string) => {
    const template = notificationTemplates.syncFailure(errorMessage)
    return {
      ...template,
      user_id: userId,
    }
  },

  teamUpdate: (memberName: string, action: string, userId: string) => {
    const template = notificationTemplates.teamUpdate(memberName, action)
    return {
      ...template,
      user_id: userId,
      action_url: '/team',
    }
  },

  custom: (
    type: 'info' | 'warning' | 'error' | 'success',
    title: string,
    message: string,
    userId: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    actionUrl?: string,
  ) => ({
    type,
    title,
    message,
    priority,
    user_id: userId,
    action_url: actionUrl,
  }),
}

// Toast helper functions
export const showToast = {
  success: (title: string, message: string, duration?: number) => {
    useNotificationStore.getState().showToast({
      type: 'success',
      title,
      message,
      duration,
    })
  },

  error: (title: string, message: string, duration?: number) => {
    useNotificationStore.getState().showToast({
      type: 'error',
      title,
      message,
      duration: duration || 6000, // Longer duration for errors
    })
  },

  warning: (title: string, message: string, duration?: number) => {
    useNotificationStore.getState().showToast({
      type: 'warning',
      title,
      message,
      duration,
    })
  },

  info: (title: string, message: string, duration?: number) => {
    useNotificationStore.getState().showToast({
      type: 'info',
      title,
      message,
      duration,
    })
  },
}

// Notification event handlers for integration with other stores
export const notificationHandlers = {
  onTaskCompleted: (taskName: string, userId: string) => {
    showToast.success('Task Completed', `Successfully completed "${taskName}"`)
  },

  onChecklistSubmitted: (checklistName: string, userId: string) => {
    const notification = createNotification.checklistCompleted(checklistName, userId)
    useNotificationStore.getState().addNotification(notification)
    showToast.success('Checklist Submitted', `"${checklistName}" has been submitted`)
  },

  onSyncError: (errorMessage: string, userId: string) => {
    const notification = createNotification.syncFailure(errorMessage, userId)
    useNotificationStore.getState().addNotification(notification)
    showToast.error('Sync Error', 'Changes will be saved locally and synced later')
  },

  onOfflineDetected: () => {
    showToast.warning('Offline Mode', 'Working offline - changes will sync when connection returns')
  },

  onOnlineDetected: () => {
    showToast.info('Back Online', 'Connection restored - syncing changes...')
  },
}

// Browser notification API integration
export const sendBrowserNotification = (
  title: string,
  message: string,
  options?: NotificationOptions,
) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: '/icon-192x192.png',
      badge: '/badge-icon.png',
      tag: 'checklist-app',
      requireInteraction: false,
      ...options,
    })
  }
}

// Development helpers
export const resetNotificationStore = () => {
  useNotificationStore.setState({
    notifications: [],
    unreadCount: 0,
    pushEnabled: false,
    pushSubscription: null,
    notificationPermission: 'default',
    toasts: [],
    alertQueue: [],
  })
}

export const getNotificationState = () => {
  return useNotificationStore.getState()
}

// Test notification helper
export const createTestNotification = () => {
  const notification = createNotification.custom(
    'info',
    'Test Notification',
    'This is a test notification to verify the system is working.',
    'test-user',
    'medium',
  )

  useNotificationStore.getState().addNotification(notification)
}
