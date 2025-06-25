import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { act } from '@testing-library/react'
import { vi } from 'vitest'
import {
  useAuthStore,
  resetAuthStore,
  useChecklistStore,
  resetChecklistStore,
  useOfflineStore,
  resetOfflineStore,
  useRoleStore,
  resetRoleStore,
  useNotificationStore,
  resetNotificationStore,
} from '../stores'
import type {
  User,
  Role,
  Department,
  ChecklistInstance,
  Task,
  OfflineAction,
  Notification,
} from '../stores/types'

// Mock data factories
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-1',
  staff_number: '123456',
  full_name: 'Test User',
  email: 'test@example.com',
  department_id: 'dept-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockRole = (overrides: Partial<Role> = {}): Role => ({
  id: 'role-1',
  name: 'user',
  description: 'Standard user access',
  ...overrides,
})

export const createMockDepartment = (overrides: Partial<Department> = {}): Department => ({
  id: 'dept-1',
  name: 'Kitchen',
  code: 'KITCHEN',
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockChecklist = (
  overrides: Partial<ChecklistInstance> = {},
): ChecklistInstance => ({
  id: 'checklist-1',
  template_id: 'template-1',
  department_id: 'dept-1',
  assigned_date: new Date().toISOString().split('T')[0],
  status: 'pending',
  assigned_to: 'user-1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  template: {
    id: 'template-1',
    name: 'Test Checklist',
    department_id: 'dept-1',
    type: 'opening',
    deadline_time: '14:00',
    notification_minutes: 30,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  progress: 0,
  completion_percentage: 0,
  ...overrides,
})

export const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  template_task_id: 'template-task-1',
  checklist_instance_id: 'checklist-1',
  title: 'Test Task',
  description: 'This is a test task',
  order: 1,
  required: true,
  completed: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockOfflineAction = (overrides: Partial<OfflineAction> = {}): OfflineAction => ({
  id: 'action-1',
  type: 'COMPLETE_TASK',
  payload: { taskId: 'task-1' },
  timestamp: new Date(),
  retryCount: 0,
  priority: 'medium',
  status: 'pending',
  ...overrides,
})

export const createMockNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'notification-1',
  type: 'info',
  title: 'Test Notification',
  message: 'This is a test notification',
  priority: 'medium',
  read: false,
  user_id: 'user-1',
  created_at: new Date().toISOString(),
  ...overrides,
})

// Store state setup utilities
export const setupAuthStore = (
  config: {
    user?: User
    roles?: Role[]
    departments?: Department[]
    isAuthenticated?: boolean
    selectedDepartment?: Department | null
    activeRole?: Role | null
  } = {},
) => {
  const {
    user = createMockUser(),
    roles = [createMockRole()],
    departments = [createMockDepartment()],
    isAuthenticated = true,
    selectedDepartment = departments[0],
    activeRole = roles[0],
  } = config

  act(() => {
    useAuthStore.setState({
      user,
      roles,
      availableDepartments: departments,
      isAuthenticated,
      selectedDepartment,
      activeRole,
      isLoading: false,
      error: null,
    })
  })

  return { user, roles, departments, selectedDepartment, activeRole }
}

export const setupChecklistStore = (
  config: {
    checklists?: ChecklistInstance[]
    tasks?: Task[]
    activeChecklist?: ChecklistInstance | null
  } = {},
) => {
  const {
    checklists = [createMockChecklist()],
    tasks = [createMockTask()],
    activeChecklist = checklists[0],
  } = config

  act(() => {
    useChecklistStore.setState({
      checklists,
      tasks,
      activeChecklist,
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
      viewMode: 'all',
      searchTerm: '',
    })
  })

  return { checklists, tasks, activeChecklist }
}

export const setupOfflineStore = (
  config: {
    isOnline?: boolean
    syncQueue?: OfflineAction[]
    hasOfflineData?: boolean
  } = {},
) => {
  const { isOnline = true, syncQueue = [], hasOfflineData = false } = config

  act(() => {
    useOfflineStore.setState({
      isOnline,
      syncQueue,
      hasOfflineData,
      connectionQuality: 'good',
      isSyncing: false,
      syncProgress: 0,
      syncErrors: [],
      lastSyncTime: null,
      cacheSize: 0,
      lastCacheUpdate: null,
    })
  })

  return { isOnline, syncQueue, hasOfflineData }
}

export const setupRoleStore = (
  config: {
    activeRole?: Role | null
    availableRoles?: Role[]
  } = {},
) => {
  const { activeRole = createMockRole(), availableRoles = [createMockRole()] } = config

  act(() => {
    useRoleStore.setState({
      activeRole,
      availableRoles,
      rolePermissions: { user: ['checklist:view', 'task:complete'] },
      navigationItems: [],
      dashboardLayout: 'user',
      availableFeatures: ['checklist-completion'],
    })
  })

  return { activeRole, availableRoles }
}

export const setupNotificationStore = (
  config: {
    notifications?: Notification[]
    unreadCount?: number
    pushEnabled?: boolean
  } = {},
) => {
  const { notifications = [], unreadCount = 0, pushEnabled = false } = config

  act(() => {
    useNotificationStore.setState({
      notifications,
      unreadCount,
      pushEnabled,
      pushSubscription: null,
      notificationPermission: 'default',
      toasts: [],
      alertQueue: [],
    })
  })

  return { notifications, unreadCount, pushEnabled }
}

// Complete store reset utility
export const resetAllStores = () => {
  act(() => {
    resetAuthStore()
    resetChecklistStore()
    resetOfflineStore()
    resetRoleStore()
    resetNotificationStore()
  })
}

// Store testing wrapper component
interface StoreTestWrapperProps {
  children: React.ReactNode
  authConfig?: Parameters<typeof setupAuthStore>[0]
  checklistConfig?: Parameters<typeof setupChecklistStore>[0]
  offlineConfig?: Parameters<typeof setupOfflineStore>[0]
  roleConfig?: Parameters<typeof setupRoleStore>[0]
  notificationConfig?: Parameters<typeof setupNotificationStore>[0]
}

export const StoreTestWrapper = ({
  children,
  authConfig,
  checklistConfig,
  offlineConfig,
  roleConfig,
  notificationConfig,
}: StoreTestWrapperProps) => {
  React.useEffect(() => {
    // Reset all stores first
    resetAllStores()

    // Setup stores with provided config
    if (authConfig) setupAuthStore(authConfig)
    if (checklistConfig) setupChecklistStore(checklistConfig)
    if (offlineConfig) setupOfflineStore(offlineConfig)
    if (roleConfig) setupRoleStore(roleConfig)
    if (notificationConfig) setupNotificationStore(notificationConfig)
  }, [])

  return <>{children}</>
}

// Custom render function with store setup
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  storeConfig?: StoreTestWrapperProps
}

export const renderWithStores = (ui: ReactElement, options: CustomRenderOptions = {}) => {
  const { storeConfig, ...renderOptions } = options

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <StoreTestWrapper {...(storeConfig || {})}>{children}</StoreTestWrapper>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Async testing utilities for stores
export const waitForStoreUpdate = async (
  getState: () => any,
  predicate: (state: any) => boolean,
  timeout = 5000,
) => {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    if (predicate(getState())) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 10))
  }

  throw new Error(`Store update timeout after ${timeout}ms`)
}

export const waitForAuthLoad = () =>
  waitForStoreUpdate(
    () => useAuthStore.getState(),
    (state) => !state.isLoading,
  )

export const waitForChecklistLoad = () =>
  waitForStoreUpdate(
    () => useChecklistStore.getState(),
    (state) => !state.isLoading,
  )

export const waitForSync = () =>
  waitForStoreUpdate(
    () => useOfflineStore.getState(),
    (state) => !state.isSyncing,
  )

// Store action testing utilities
export const mockStoreActions = () => {
  const originalMethods = {
    auth: {
      login: useAuthStore.getState().login,
      logout: useAuthStore.getState().logout,
    },
    checklist: {
      loadChecklists: useChecklistStore.getState().loadChecklists,
      completeTask: useChecklistStore.getState().completeTask,
    },
    offline: {
      syncNow: useOfflineStore.getState().syncNow,
      queueAction: useOfflineStore.getState().queueAction,
    },
  }

  const mocks = {
    auth: {
      login: vi.fn(),
      logout: vi.fn(),
    },
    checklist: {
      loadChecklists: vi.fn(),
      completeTask: vi.fn(),
    },
    offline: {
      syncNow: vi.fn(),
      queueAction: vi.fn(),
    },
  }

  // Replace store methods with mocks
  act(() => {
    useAuthStore.setState({
      login: mocks.auth.login,
      logout: mocks.auth.logout,
    })

    useChecklistStore.setState({
      loadChecklists: mocks.checklist.loadChecklists,
      completeTask: mocks.checklist.completeTask,
    })

    useOfflineStore.setState({
      syncNow: mocks.offline.syncNow,
      queueAction: mocks.offline.queueAction,
    })
  })

  const restore = () => {
    act(() => {
      useAuthStore.setState(originalMethods.auth)
      useChecklistStore.setState(originalMethods.checklist)
      useOfflineStore.setState(originalMethods.offline)
    })
  }

  return { mocks, restore }
}

// Test scenario builders
export const createAuthenticatedUserScenario = () => {
  const user = createMockUser()
  const roles = [
    createMockRole({ name: 'user' }),
    createMockRole({ id: 'role-2', name: 'manager', description: 'Manager access' }),
  ]
  const departments = [createMockDepartment()]

  return setupAuthStore({
    user,
    roles,
    departments,
    isAuthenticated: true,
    selectedDepartment: departments[0],
    activeRole: roles[0],
  })
}

export const createChecklistWithTasksScenario = () => {
  const checklist = createMockChecklist()
  const tasks = [
    createMockTask({ id: 'task-1', completed: false, required: true }),
    createMockTask({ id: 'task-2', completed: true, required: true }),
    createMockTask({ id: 'task-3', completed: false, required: false }),
  ]

  return setupChecklistStore({
    checklists: [checklist],
    tasks,
    activeChecklist: checklist,
  })
}

export const createOfflineScenario = () => {
  const actions = [
    createMockOfflineAction({ type: 'COMPLETE_TASK', priority: 'high' }),
    createMockOfflineAction({ type: 'SUBMIT_CHECKLIST', priority: 'critical' }),
  ]

  return setupOfflineStore({
    isOnline: false,
    syncQueue: actions,
    hasOfflineData: true,
  })
}

export const createManagerRoleScenario = () => {
  const managerRole = createMockRole({
    id: 'role-manager',
    name: 'manager',
    description: 'Manager access',
  })

  return setupRoleStore({
    activeRole: managerRole,
    availableRoles: [createMockRole({ name: 'user' }), managerRole],
  })
}

export const createNotificationScenario = () => {
  const notifications = [
    createMockNotification({
      type: 'warning',
      priority: 'high',
      read: false,
      title: 'Task Overdue',
    }),
    createMockNotification({
      type: 'success',
      priority: 'low',
      read: true,
      title: 'Checklist Completed',
    }),
  ]

  return setupNotificationStore({
    notifications,
    unreadCount: 1,
    pushEnabled: true,
  })
}

// Store subscription testing utilities
export const createStoreSubscriptionTester = <T,>(store: {
  subscribe: (listener: (state: T) => void) => () => void
  getState: () => T
}) => {
  const changes: T[] = []

  const unsubscribe = store.subscribe((state) => {
    changes.push({ ...state })
  })

  const getChanges = () => changes
  const getLatestChange = () => changes[changes.length - 1]
  const clearChanges = () => {
    changes.length = 0
  }

  return {
    unsubscribe,
    getChanges,
    getLatestChange,
    clearChanges,
  }
}

// Performance testing utilities for stores
export const measureStorePerformance = async <T,>(
  operation: () => Promise<T> | T,
  storeName: string,
): Promise<{ result: T; duration: number }> => {
  const start = performance.now()
  const result = await operation()
  const duration = performance.now() - start

  console.log(`Store operation "${storeName}" took ${duration.toFixed(2)}ms`)

  return { result, duration }
}

// Store memory usage testing
export const getStoreMemoryUsage = () => {
  const stores = {
    auth: useAuthStore.getState(),
    checklist: useChecklistStore.getState(),
    offline: useOfflineStore.getState(),
    role: useRoleStore.getState(),
    notification: useNotificationStore.getState(),
  }

  const sizes = Object.entries(stores).map(([name, state]) => ({
    store: name,
    size: JSON.stringify(state).length,
  }))

  return sizes
}
