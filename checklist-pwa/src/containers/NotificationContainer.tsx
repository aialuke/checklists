import React, { useCallback } from 'react'

import {
  usePushSubscription,
  useManagerNotifications,
  useMarkNotificationRead,
  useRegisterPushSubscription,
  useUnregisterPushSubscription,
  useNotificationPermission,
  useRequestNotificationPermission,
} from '../queries/notificationQueries'
import { useNotificationClientStore } from '../stores/notificationClientStore'

import type { Notification, ToastNotification } from '../types'

// Notification Container Props Interface
export interface NotificationContainerProps {
  children: (props: NotificationContainerState) => React.ReactNode
}

// State passed to presentational components
export interface NotificationContainerState {
  // State
  notifications: Notification[]
  unreadNotifications: Notification[]
  notificationCount: number
  pushEnabled: boolean
  isLoading: boolean
  error: string | null

  // Actions
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  deleteNotification: (notificationId: string) => void
  clearAll: () => void
  enablePushNotifications: () => Promise<boolean>
  disablePushNotifications: () => Promise<void>
  toasts: ToastNotification[]
  showToast: (toast: {
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    duration?: number
  }) => void
  hideToast: (toastId: string) => void
}

/**
 * NotificationContainer - Connects UI components to NotificationStore
 * Manages notification state and actions
 */
export const NotificationContainer: React.FC<NotificationContainerProps> = ({ children }) => {
  // Get state from TanStack Query and client store
  const { data: pushSubscription } = usePushSubscription()
  const { data: managerNotifications = [] } = useManagerNotifications()
  const { data: notificationPermission } = useNotificationPermission()
  const { toasts, addToast, removeToast, clearToasts } = useNotificationClientStore()
  
  // Get mutations
  const markAsReadMutation = useMarkNotificationRead()
  const registerPushMutation = useRegisterPushSubscription()
  const unregisterPushMutation = useUnregisterPushSubscription()
  const requestPermissionMutation = useRequestNotificationPermission()

  // Wrap async functions to handle promises properly
  const enablePushNotifications = useCallback(async () => {
    try {
      // First request permission if needed
      if (notificationPermission?.permission === 'default') {
        await requestPermissionMutation.mutateAsync()
      }
      
      // Then register subscription if not supported, return false
      if (!notificationPermission?.supported) {
        return false
      }
      
      // Register the push subscription with service worker
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BIpG0bFhQW7rJzL8Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', // Replace with your VAPID key
        })
        
        // Convert to our format and register
        const subscriptionData = {
          endpoint: subscription.endpoint,
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
          user_agent: navigator.userAgent,
        }
        
        await registerPushMutation.mutateAsync(subscriptionData)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to enable push notifications:', error)
      return false
    }
  }, [notificationPermission, requestPermissionMutation, registerPushMutation])

  const disablePushNotifications = useCallback(async () => {
    try {
      await unregisterPushMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to disable push notifications:', error)
    }
  }, [unregisterPushMutation])

  const clearAll = useCallback(() => {
    clearToasts()
  }, [clearToasts])
  
  const markAsRead = useCallback((notificationId: string) => {
    markAsReadMutation.mutate(notificationId)
  }, [markAsReadMutation])
  
  const markAllAsRead = useCallback(() => {
    managerNotifications.forEach((notification: any) => {
      if (!notification.read) {
        markAsReadMutation.mutate(notification.id)
      }
    })
  }, [managerNotifications, markAsReadMutation])
  
  const deleteNotification = useCallback((notificationId: string) => {
    // For now, just mark as read since we don't have a delete mutation
    markAsReadMutation.mutate(notificationId)
  }, [markAsReadMutation])
  
  const showToast = useCallback((toast: {
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    duration?: number
  }) => {
    addToast(toast)
  }, [addToast])
  
  const hideToast = useCallback((toastId: string) => {
    removeToast(toastId)
  }, [removeToast])

  // Compute derived state
  const notifications = managerNotifications || []
  const unreadNotifications = notifications.filter((n: any) => !n.read)
  const notificationCount = unreadNotifications.length
  const pushEnabled = !!pushSubscription && notificationPermission?.permission === 'granted'
  const isLoading = markAsReadMutation.isPending || registerPushMutation.isPending || unregisterPushMutation.isPending
  const error = markAsReadMutation.error?.message || registerPushMutation.error?.message || unregisterPushMutation.error?.message || null

  const containerState: NotificationContainerState = {
    // State
    notifications,
    unreadNotifications,
    notificationCount,
    pushEnabled,
    isLoading,
    error,

    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    enablePushNotifications,
    disablePushNotifications,
    toasts,
    showToast,
    hideToast,
  }

  return <>{children(containerState)}</>
}

