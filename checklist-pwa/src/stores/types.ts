// Shared types for Zustand stores
export interface User {
  id: string
  staff_number: string
  full_name: string
  email: string
  department_id?: string
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: 'user' | 'manager' | 'admin'
  description: string
}

export interface Department {
  id: string
  name: string
  code: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface ChecklistTemplate {
  id: string
  name: string
  department_id: string
  type: 'opening' | 'closing'
  deadline_time: string
  notification_minutes: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface TemplateTask {
  id: string
  template_id: string
  title: string
  description?: string
  order: number
  required: boolean
  estimated_minutes?: number
  created_at: string
  updated_at: string
}

export interface ChecklistInstance {
  id: string
  template_id: string
  department_id: string
  assigned_date: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  assigned_to?: string
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  // Computed fields
  template?: ChecklistTemplate
  tasks?: Task[]
  progress?: number
  completion_percentage?: number
}

export interface Task {
  id: string
  template_task_id: string
  checklist_instance_id: string
  title: string
  description?: string
  order: number
  required: boolean
  completed: boolean
  completed_by?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface TaskCompletion {
  id: string
  task_id: string
  checklist_instance_id: string
  completed_by: string
  completed_at: string
  notes?: string
}

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  read: boolean
  user_id: string
  created_at: string
  expires_at?: string
  action_url?: string
}

// Store state interfaces
export interface AuthState {
  // User session
  user: User | null
  roles: Role[]
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Department context
  selectedDepartment: Department | null
  availableDepartments: Department[]

  // Active role context for multi-role users
  activeRole: Role | null

  // Actions
  login: (staffNumber: string) => Promise<void>
  logout: () => void
  setDepartment: (department: Department) => void
  setActiveRole: (role: Role) => void
  clearError: () => void

  // Computed getters
  hasRole: (roleName: string) => boolean
  hasAnyRole: (roleNames: string[]) => boolean
  canAccessDepartment: (departmentId: string) => boolean
}

export interface ChecklistState {
  // Checklist data
  checklists: ChecklistInstance[]
  activeChecklist: ChecklistInstance | null
  tasks: Task[]

  // UI state
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null

  // Filters and view state
  viewMode: 'all' | 'pending' | 'completed'
  searchTerm: string

  // Actions
  loadChecklists: () => Promise<void>
  loadChecklist: (id: string) => Promise<void>
  setActiveChecklist: (checklist: ChecklistInstance | null) => void
  completeTask: (taskId: string, notes?: string) => Promise<void>
  undoTaskCompletion: (taskId: string) => Promise<void>
  submitChecklist: (checklistId: string) => Promise<void>
  refreshData: () => Promise<void>

  // Optimistic updates
  optimisticCompleteTask: (taskId: string) => void
  rollbackOptimisticUpdate: (taskId: string) => void

  // Computed getters
  getChecklistProgress: (checklistId: string) => number
  getCompletedTasks: () => Task[]
  getPendingTasks: () => Task[]
  getOverdueChecklists: () => ChecklistInstance[]
}

export interface OfflineState {
  // Network status
  isOnline: boolean
  connectionQuality: 'poor' | 'good' | 'excellent'
  lastSyncTime: Date | null

  // Sync queue
  syncQueue: OfflineAction[]
  isSyncing: boolean
  syncProgress: number
  syncErrors: string[]

  // Offline data cache
  hasOfflineData: boolean
  cacheSize: number
  lastCacheUpdate: Date | null

  // Actions
  queueAction: (action: OfflineAction) => void
  removeFromQueue: (actionId: string) => void
  syncNow: () => Promise<void>
  clearSyncErrors: () => void

  // Cache management
  updateCache: (data: any) => Promise<void>
  clearCache: () => Promise<void>
  getCachedData: (key: string) => any

  // Computed getters
  getQueuedActionsCount: () => number
  hasFailedActions: () => boolean
  estimatedSyncTime: () => number
}

export interface RoleState {
  // Current role context
  activeRole: Role | null
  availableRoles: Role[]
  rolePermissions: Record<string, string[]>

  // UI adaptations
  navigationItems: NavigationItem[]
  dashboardLayout: 'user' | 'manager' | 'admin'
  availableFeatures: string[]

  // Actions
  switchRole: (role: Role) => void
  refreshPermissions: () => Promise<void>

  // Computed getters
  canPerformAction: (action: string) => boolean
  getAccessibleDepartments: () => Department[]
  getRoleBasedNavigation: () => NavigationItem[]
}

export interface NotificationState {
  // Notifications
  notifications: Notification[]
  unreadCount: number

  // Push notification settings
  pushEnabled: boolean
  pushSubscription: PushSubscription | null
  notificationPermission: NotificationPermission

  // In-app notification state
  toasts: ToastNotification[]
  alertQueue: AlertNotification[]

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  removeNotification: (notificationId: string) => void
  clearOldNotifications: () => void

  // Push notifications
  requestNotificationPermission: () => Promise<boolean>
  subscribeToPush: () => Promise<boolean>
  unsubscribeFromPush: () => Promise<void>

  // Toast notifications
  showToast: (toast: Omit<ToastNotification, 'id'>) => void
  hideToast: (toastId: string) => void

  // Computed getters
  getNotificationsByType: (type: string) => Notification[]
  getRecentNotifications: (hours?: number) => Notification[]
}

// Supporting types
export interface OfflineAction {
  id: string
  type: 'COMPLETE_TASK' | 'SUBMIT_CHECKLIST' | 'UPDATE_PROFILE' | 'SYNC_DATA'
  payload: any
  timestamp: Date
  retryCount: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'retrying' | 'failed' | 'completed'
}

export interface NavigationItem {
  id: string
  label: string
  path: string
  icon: string
  roles: string[]
  children?: NavigationItem[]
}

export interface ToastNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    handler: () => void
  }
}

export interface AlertNotification {
  id: string
  type: 'confirm' | 'alert' | 'prompt'
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

// Store slice types for composition
export interface StoreSlice<T> {
  (...args: any[]): T
}

// Persistence configuration
export interface PersistConfig {
  name: string
  version: number
  migrate?: (persistedState: any, version: number) => any
  partialize?: (state: any) => any
  blacklist?: string[]
  whitelist?: string[]
}

// Store configuration options
export interface StoreOptions {
  devtools?: boolean
  persist?: PersistConfig
  subscribeWithSelector?: boolean
  immer?: boolean
}
