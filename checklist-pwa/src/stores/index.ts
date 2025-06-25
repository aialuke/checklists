// Store exports barrel file

// Types
export * from './types'

// Store implementations
export * from './authStore'
export * from './checklistStore'
export * from './offlineStore'
export * from './roleStore'
export * from './notificationStore'

// React 19 Suspense patterns
export * from './suspensePatterns'

// Store hooks (re-exported for convenience)
export {
  // Auth hooks
  useUser,
  useIsAuthenticated,
  useCurrentRole as useAuthRole,
  useCurrentDepartment,
  usePermissions,
  useAuthActions,

  // Checklist hooks
  useChecklists,
  useActiveChecklist,
  useChecklistTasks,
  useChecklistProgress,
  useChecklistActions,

  // Offline hooks
  useNetworkStatus,
  useSyncStatus,
  useOfflineData,
  useOfflineActions,

  // Role hooks
  useCurrentRole,
  useAvailableRoles,
  useRoleNavigation,
  useDashboardLayout,
  useRolePermissions,
  useRoleFeatures,
  useRoleActions,

  // Notification hooks
  useNotifications,
  useUnreadNotifications,
  useNotificationCount,
  useToasts,
  usePushNotifications,
  useNotificationActions,
} from './authStore'

export {
  useChecklists,
  useActiveChecklist,
  useChecklistTasks,
  useChecklistProgress,
  useChecklistActions,
  useChecklistsSuspense,
} from './checklistStore'

export {
  useNetworkStatus,
  useSyncStatus,
  useOfflineData,
  useOfflineActions,
  initializeNetworkMonitoring,
  createOfflineAction,
  queueTaskCompletion,
  queueChecklistSubmission,
} from './offlineStore'

export {
  useCurrentRole,
  useAvailableRoles,
  useRoleNavigation,
  useDashboardLayout,
  useRolePermissions,
  useRoleFeatures,
  useRoleActions,
  switchToRole,
  checkPermission,
  getCurrentNavigation,
  withRoleCheck,
  withPermissionCheck,
} from './roleStore'

export {
  useNotifications,
  useUnreadNotifications,
  useNotificationCount,
  useToasts,
  usePushNotifications,
  useNotificationActions,
  createNotification,
  showToast,
  notificationHandlers,
  sendBrowserNotification,
  createTestNotification,
} from './notificationStore'

// Suspense patterns
export {
  useAuthSuspense,
  useChecklistsSuspense,
  withAuthSuspense,
  withDataSuspense,
  AuthSuspenseBoundary,
  DataSuspenseBoundary,
  DashboardSuspenseBoundary,
  createSuspenseResource,
  preloadChecklists,
  preloadUserProfile,
  useDeferredValue,
  useTransition,
  useOptimisticState,
  StoreProvider,
  SuspenseErrorBoundary,
  SuspenseChecklistPage,
  SuspenseAuthCheck,
} from './suspensePatterns'

// Store selectors (for optimized subscriptions)
export {
  authSelectors,
  checklistSelectors,
  offlineSelectors,
  roleSelectors,
  notificationSelectors,
} from './authStore'

export { checklistSelectors } from './checklistStore'
export { offlineSelectors } from './offlineStore'
export { roleSelectors } from './roleStore'
export { notificationSelectors } from './notificationStore'

// Development and testing utilities
export {
  resetAuthStore,
  resetChecklistStore,
  resetOfflineStore,
  resetRoleStore,
  resetNotificationStore,
  getAuthState,
  getChecklistState,
  getOfflineState,
  getRoleState,
  getNotificationState,
  subscribeToAuth,
  logRoleContext,
} from './authStore'

export { resetChecklistStore, getChecklistState } from './checklistStore'
export { resetOfflineStore, getOfflineState } from './offlineStore'
export { resetRoleStore, getRoleState, logRoleContext } from './roleStore'
export { resetNotificationStore, getNotificationState } from './notificationStore'

// Reset all stores utility
export const resetAllStores = () => {
  const { resetAuthStore } = require('./authStore')
  const { resetChecklistStore } = require('./checklistStore')
  const { resetOfflineStore } = require('./offlineStore')
  const { resetRoleStore } = require('./roleStore')
  const { resetNotificationStore } = require('./notificationStore')

  resetAuthStore()
  resetChecklistStore()
  resetOfflineStore()
  resetRoleStore()
  resetNotificationStore()
}

// Store configuration and setup
export const configureStores = (
  config: {
    devtools?: boolean
    persistence?: boolean
    networkMonitoring?: boolean
  } = {},
) => {
  const {
    devtools = process.env.NODE_ENV === 'development',
    persistence = true,
    networkMonitoring = true,
  } = config

  // Configure devtools
  if (!devtools && typeof window !== 'undefined') {
    // Disable devtools in production
    ;(window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = undefined
  }

  // Initialize network monitoring
  if (networkMonitoring && typeof window !== 'undefined') {
    const { initializeNetworkMonitoring } = require('./offlineStore')
    initializeNetworkMonitoring()
  }

  return {
    devtools,
    persistence,
    networkMonitoring,
  }
}

// Store middleware and utilities
export const createStoreMiddleware = <T>(
  storeName: string,
  middleware: (set: any, get: any, api: any) => T,
) => {
  return (set: any, get: any, api: any) => {
    // Add store name to devtools
    if (process.env.NODE_ENV === 'development') {
      console.log(`Initializing store: ${storeName}`)
    }

    return middleware(set, get, api)
  }
}

// Store performance monitoring
export const enableStorePerformanceMonitoring = () => {
  if (process.env.NODE_ENV !== 'development') return

  const stores = [
    { name: 'auth', store: require('./authStore').useAuthStore },
    { name: 'checklist', store: require('./checklistStore').useChecklistStore },
    { name: 'offline', store: require('./offlineStore').useOfflineStore },
    { name: 'role', store: require('./roleStore').useRoleStore },
    { name: 'notification', store: require('./notificationStore').useNotificationStore },
  ]

  stores.forEach(({ name, store }) => {
    store.subscribe(
      (state: any) => state,
      (state: any) => {
        const size = JSON.stringify(state).length
        if (size > 100000) {
          // Warn if store gets large (>100KB)
          console.warn(`Store ${name} is getting large: ${(size / 1024).toFixed(2)}KB`)
        }
      },
    )
  })
}

// Store hydration for SSR
export const hydrateStores = (initialState: {
  auth?: any
  checklist?: any
  offline?: any
  role?: any
  notification?: any
}) => {
  const { useAuthStore } = require('./authStore')
  const { useChecklistStore } = require('./checklistStore')
  const { useOfflineStore } = require('./offlineStore')
  const { useRoleStore } = require('./roleStore')
  const { useNotificationStore } = require('./notificationStore')

  if (initialState.auth) {
    useAuthStore.setState(initialState.auth)
  }

  if (initialState.checklist) {
    useChecklistStore.setState(initialState.checklist)
  }

  if (initialState.offline) {
    useOfflineStore.setState(initialState.offline)
  }

  if (initialState.role) {
    useRoleStore.setState(initialState.role)
  }

  if (initialState.notification) {
    useNotificationStore.setState(initialState.notification)
  }
}

// Store debugging utilities
export const debugStores = () => {
  if (process.env.NODE_ENV !== 'development') return

  const { getAuthState } = require('./authStore')
  const { getChecklistState } = require('./checklistStore')
  const { getOfflineState } = require('./offlineStore')
  const { getRoleState } = require('./roleStore')
  const { getNotificationState } = require('./notificationStore')

  console.group('Store States')
  console.log('Auth:', getAuthState())
  console.log('Checklist:', getChecklistState())
  console.log('Offline:', getOfflineState())
  console.log('Role:', getRoleState())
  console.log('Notification:', getNotificationState())
  console.groupEnd()
}

// Make debug function available globally in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  ;(window as any).debugStores = debugStores
  ;(window as any).resetAllStores = resetAllStores
}
