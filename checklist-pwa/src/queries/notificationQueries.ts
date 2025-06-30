import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { NotificationSettings, PushSubscription } from '../types/notification'

// Mock supabase for now - will be replaced with actual implementation
const mockSupabaseResponse = { data: null, error: null }
const mockSelectChain = {
  single: () => mockSupabaseResponse,
  eq: (..._args: any[]) => mockSelectChain,
  or: (..._args: any[]) => mockSelectChain,
  order: (..._args: any[]) => mockSelectChain,
  limit: (..._args: any[]) => ({ data: [], error: null }),
  error: null,
}

const supabase = {
  auth: {
    getUser: async () => ({ data: { user: { id: 'mock-user' } } }),
  },
  from: (_table: string) => ({
    select: (..._args: any[]) => mockSelectChain,
    upsert: (_data: any) => ({
      select: (..._args: any[]) => mockSelectChain,
    }),
    update: (..._args: any[]) => mockSelectChain,
    insert: (_data: any) => ({
      select: (..._args: any[]) => mockSelectChain,
    }),
  }),
  functions: {
    invoke: async (_functionName: string, _options: any) => ({ data: null, error: null }),
  },
}

// Query key factory for notifications
const notificationKeys = {
  all: ['notifications'] as const,
  settings: () => [...notificationKeys.all, 'settings'] as const,
  push: () => [...notificationKeys.all, 'push'] as const,
  subscription: () => [...notificationKeys.all, 'subscription'] as const,
  preferences: (userId?: string) => [...notificationKeys.all, 'preferences', userId] as const,
} as const

// User notification settings query
const useNotificationSettings = () => {
  return useQuery({
    queryKey: notificationKeys.settings(),
    queryFn: async (): Promise<NotificationSettings> => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (error) {
        throw error
      }
      
      // Return default settings if none exist
      return data || {
        user_id: user.id,
        push_enabled: true,
        email_enabled: true,
        task_completion_notifications: true,
        checklist_assignment_notifications: true,
        daily_summary_notifications: false,
        manager_override_notifications: true,
        offline_sync_notifications: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Update notification settings
const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (settings: Partial<NotificationSettings>) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      const { data, error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.settings() })
    },
  })
}

// Push subscription management
export const usePushSubscription = () => {
  return useQuery({
    queryKey: notificationKeys.subscription(),
    queryFn: async (): Promise<PushSubscription | null> => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()
      
      if (error) {
        throw error
      }
      
      return data || null
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Register push subscription
export const useRegisterPushSubscription = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (subscription: {
      endpoint: string
      p256dh: string
      auth: string
      user_agent: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      // Deactivate existing subscriptions
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id)
      
      // Register new subscription
      const { data, error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.p256dh,
          auth: subscription.auth,
          user_agent: subscription.user_agent,
          is_active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.subscription() })
    },
  })
}

// Unregister push subscription
export const useUnregisterPushSubscription = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.subscription() })
    },
  })
}

// Send notification (manager/admin only)
const useSendNotification = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (notification: {
      title: string
      message: string
      type: 'task_completion' | 'checklist_assignment' | 'reminder' | 'alert'
      target_users?: string[]
      target_departments?: string[]
      priority: 'low' | 'normal' | 'high' | 'urgent'
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      // Call the notification service function
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          ...notification,
          sender_id: user.id,
        }
      })
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Refresh notification-related queries if needed
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// Check notification permission status
export const useNotificationPermission = () => {
  return useQuery({
    queryKey: ['notification-permission'],
    queryFn: async (): Promise<{
      supported: boolean
      permission: NotificationPermission
      canRequestPermission: boolean
    }> => {
      const supported = 'Notification' in window && 'serviceWorker' in navigator
      
      if (!supported) {
        return {
          supported: false,
          permission: 'denied',
          canRequestPermission: false,
        }
      }
      
      const permission = Notification.permission
      
      return {
        supported,
        permission,
        canRequestPermission: permission === 'default',
      }
    },
    staleTime: 60 * 1000, // 1 minute
    networkMode: 'always', // Can check this offline
  })
}

// Request notification permission
export const useRequestNotificationPermission = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (): Promise<NotificationPermission> => {
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported')
      }
      
      const permission = await Notification.requestPermission()
      return permission
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-permission'] })
    },
  })
}

// Test notification functionality
const useTestNotification = () => {
  return useMutation({
    mutationFn: async (message?: string): Promise<{ success: boolean }> => {
      const messageText = message || 'Test notification from Checklist PWA'
      
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported')
      }
      
      if (Notification.permission !== 'granted') {
        throw new Error('Notification permission not granted')
      }
      
      const notification = new Notification('Test Notification', {
        body: messageText,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'test-notification',
        requireInteraction: false,
        silent: false,
      })
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)
      
      return { success: true }
    },
  })
}

// Background notification processor for service worker
const processBackgroundNotification = async (notificationData: {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}): Promise<{ processed: boolean }> => {
  // This function would typically be called from a service worker
  // Mock implementation for background notification processing
  
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'BACKGROUND_NOTIFICATION',
      payload: notificationData,
    })
  }
  
  return { processed: true }
}

// Manager notification queries (for dashboard)
export const useManagerNotifications = () => {
  return useQuery({
    queryKey: ['manager-notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      // Get pending notifications for manager dashboard
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles!notifications_sender_id_fkey(
            id,
            staff_number,
            full_name
          )
        `)
        .or(`target_users.cs.{${user.id}},target_departments.cs.{${user.id}}`)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      return data || []
    },
    staleTime: 30 * 1000, // 30 seconds for manager dashboard
  })
}

// Mark notification as read
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager-notifications'] })
    },
  })
}