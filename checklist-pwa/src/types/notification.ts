// Notification-specific types

export interface Notification {
  id: string
  type?: 'info' | 'warning' | 'error' | 'success'
  title?: string
  message?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  read: boolean
  user_id?: string
  action_url?: string
  created_at: string
}

// Server-side notification settings
export interface NotificationSettings {
  user_id: string
  push_enabled: boolean
  email_enabled: boolean
  task_completion_notifications: boolean
  checklist_assignment_notifications: boolean
  daily_summary_notifications: boolean
  manager_override_notifications: boolean
  offline_sync_notifications: boolean
  created_at: string
  updated_at: string
}

// Push subscription interface
export interface PushSubscription {
  id?: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  user_agent: string
  is_active: boolean
  created_at: string
}

export interface ToastNotification {
  id: string
  type?: 'info' | 'warning' | 'error' | 'success'
  title?: string
  message?: string
  duration?: number
}

// Notification state interfaces (used by TanStack Query and Container components)
interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  pushEnabled: boolean
  pushSubscription: PushSubscription | null
  notificationPermission: NotificationPermission
  toasts: ToastNotification[]
  alertQueue: unknown[]

  // Actions
  addNotification: (notificationData: Partial<Notification>) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  removeNotification: (notificationId: string) => void
  clearOldNotifications: () => void
  showToast: (toastData: Partial<ToastNotification>) => void
  hideToast: (toastId: string) => void
  requestNotificationPermission: () => Promise<boolean>
  subscribeToPush: () => Promise<boolean>
  unsubscribeFromPush: () => Promise<void>
  getNotificationsByType: (type: string) => Notification[]
  getRecentNotifications: (hours?: number) => Notification[]
}