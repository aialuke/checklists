import React from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import type { RoleState, Role, Department, NavigationItem } from './types'
import { useAuthStore } from './authStore'

// Navigation configurations for different roles
const roleNavigationConfigs: Record<string, NavigationItem[]> = {
  user: [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: 'home',
      roles: ['user', 'manager', 'admin'],
    },
    {
      id: 'checklists',
      label: 'My Checklists',
      path: '/checklists',
      icon: 'clipboard-list',
      roles: ['user', 'manager', 'admin'],
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: 'user',
      roles: ['user', 'manager', 'admin'],
    },
  ],

  manager: [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: 'home',
      roles: ['user', 'manager', 'admin'],
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'chart-bar',
      roles: ['manager', 'admin'],
    },
    {
      id: 'team',
      label: 'Team Progress',
      path: '/team',
      icon: 'users',
      roles: ['manager', 'admin'],
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      icon: 'document-text',
      roles: ['manager', 'admin'],
    },
    {
      id: 'checklists',
      label: 'Checklists',
      path: '/checklists',
      icon: 'clipboard-list',
      roles: ['user', 'manager', 'admin'],
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: 'user',
      roles: ['user', 'manager', 'admin'],
    },
  ],

  admin: [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: 'home',
      roles: ['user', 'manager', 'admin'],
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'chart-bar',
      roles: ['manager', 'admin'],
    },
    {
      id: 'admin',
      label: 'Administration',
      path: '/admin',
      icon: 'cog',
      roles: ['admin'],
      children: [
        {
          id: 'templates',
          label: 'Templates',
          path: '/admin/templates',
          icon: 'template',
          roles: ['admin'],
        },
        {
          id: 'departments',
          label: 'Departments',
          path: '/admin/departments',
          icon: 'office-building',
          roles: ['admin'],
        },
        {
          id: 'users',
          label: 'Users',
          path: '/admin/users',
          icon: 'user-group',
          roles: ['admin'],
        },
        {
          id: 'settings',
          label: 'Settings',
          path: '/admin/settings',
          icon: 'adjustments',
          roles: ['admin'],
        },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      icon: 'document-text',
      roles: ['manager', 'admin'],
    },
    {
      id: 'checklists',
      label: 'Checklists',
      path: '/checklists',
      icon: 'clipboard-list',
      roles: ['user', 'manager', 'admin'],
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: 'user',
      roles: ['user', 'manager', 'admin'],
    },
  ],
}

// Role-based permissions configuration
const rolePermissions: Record<string, string[]> = {
  user: ['checklist:view', 'checklist:complete', 'task:complete', 'profile:view', 'profile:update'],

  manager: [
    // Inherit user permissions
    'checklist:view',
    'checklist:complete',
    'task:complete',
    'profile:view',
    'profile:update',
    // Manager-specific permissions
    'dashboard:view',
    'team:view',
    'reports:view',
    'reports:export',
    'notifications:send',
    'checklist:assign',
    'progress:monitor',
  ],

  admin: [
    // Inherit all manager permissions
    'checklist:view',
    'checklist:complete',
    'task:complete',
    'profile:view',
    'profile:update',
    'dashboard:view',
    'team:view',
    'reports:view',
    'reports:export',
    'notifications:send',
    'checklist:assign',
    'progress:monitor',
    // Admin-specific permissions
    'template:create',
    'template:update',
    'template:delete',
    'department:create',
    'department:update',
    'department:delete',
    'user:create',
    'user:update',
    'user:delete',
    'role:assign',
    'settings:update',
    'system:configure',
  ],
}

// Available features for each role
const roleFeatures: Record<string, string[]> = {
  user: [
    'checklist-completion',
    'progress-tracking',
    'notification-preferences',
    'profile-management',
  ],

  manager: [
    'checklist-completion',
    'progress-tracking',
    'notification-preferences',
    'profile-management',
    'team-dashboard',
    'progress-monitoring',
    'report-generation',
    'team-notifications',
    'checklist-assignment',
  ],

  admin: [
    'checklist-completion',
    'progress-tracking',
    'notification-preferences',
    'profile-management',
    'team-dashboard',
    'progress-monitoring',
    'report-generation',
    'team-notifications',
    'checklist-assignment',
    'template-management',
    'department-management',
    'user-management',
    'role-management',
    'system-settings',
    'advanced-reporting',
  ],
}

export const useRoleStore = create<RoleState>()(
  devtools(
    subscribeWithSelector(
      immer(
        persist(
          (set, get) => ({
            // Initial state
            activeRole: null,
            availableRoles: [],
            rolePermissions: {},
            navigationItems: [],
            dashboardLayout: 'user',
            availableFeatures: [],

            // Actions
            switchRole: (role: Role) => {
              const authState = useAuthStore.getState()
              const userHasRole = authState.roles.some((r) => r.name === role.name)

              if (!userHasRole) {
                console.error('User does not have the requested role')
                return
              }

              set((state) => {
                state.activeRole = role
                state.dashboardLayout = role.name
                state.availableFeatures = roleFeatures[role.name] || []
                state.rolePermissions = { [role.name]: rolePermissions[role.name] || [] }
                state.navigationItems = get().getRoleBasedNavigation()
              })

              // Update auth store's active role
              useAuthStore.getState().setActiveRole(role)
            },

            refreshPermissions: async () => {
              const authState = useAuthStore.getState()

              set((state) => {
                state.availableRoles = authState.roles

                // Build combined permissions for all user roles
                const userPermissions: Record<string, string[]> = {}
                authState.roles.forEach((role) => {
                  userPermissions[role.name] = rolePermissions[role.name] || []
                })
                state.rolePermissions = userPermissions

                // Set active role if not set
                if (!state.activeRole && authState.roles.length > 0) {
                  const defaultRole =
                    authState.roles.find((r) => r.name === 'user') || authState.roles[0]
                  state.activeRole = defaultRole
                  state.dashboardLayout = defaultRole.name
                  state.availableFeatures = roleFeatures[defaultRole.name] || []
                }

                // Update navigation
                state.navigationItems = get().getRoleBasedNavigation()
              })
            },

            // Computed getters
            canPerformAction: (action: string) => {
              const state = get()
              if (!state.activeRole) return false

              const permissions = state.rolePermissions[state.activeRole.name] || []
              return permissions.includes(action)
            },

            getAccessibleDepartments: () => {
              const authState = useAuthStore.getState()
              const state = get()

              // Admins can access all departments
              if (state.activeRole?.name === 'admin') {
                return authState.availableDepartments
              }

              // For other roles, return only assigned departments
              return authState.availableDepartments.filter((dept) =>
                authState.canAccessDepartment(dept.id),
              )
            },

            getRoleBasedNavigation: () => {
              const state = get()
              if (!state.activeRole) return []

              const config =
                roleNavigationConfigs[state.activeRole.name] || roleNavigationConfigs.user

              // Filter navigation items based on user's available roles
              const authState = useAuthStore.getState()
              const userRoleNames = authState.roles.map((r) => r.name)

              return config
                .filter((item) => item.roles.some((role) => userRoleNames.includes(role)))
                .map((item) => ({
                  ...item,
                  children: item.children?.filter((child) =>
                    child.roles.some((role) => userRoleNames.includes(role)),
                  ),
                }))
            },
          }),
          {
            name: 'role-store',
            version: 1,
            // Persist role selection and permissions
            partialize: (state) => ({
              activeRole: state.activeRole,
              dashboardLayout: state.dashboardLayout,
            }),
          },
        ),
      ),
    ),
    {
      name: 'role-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)

// Initialize role store when auth state changes
useAuthStore.subscribe(
  (state) => state.roles,
  (roles) => {
    useRoleStore.getState().refreshPermissions()
  },
)

// Selectors for optimized subscriptions
export const roleSelectors = {
  activeRole: (state: RoleState) => state.activeRole,
  availableRoles: (state: RoleState) => state.availableRoles,
  navigationItems: (state: RoleState) => state.navigationItems,
  dashboardLayout: (state: RoleState) => state.dashboardLayout,
  availableFeatures: (state: RoleState) => state.availableFeatures,

  // Computed selectors
  isManager: (state: RoleState) => state.activeRole?.name === 'manager',
  isAdmin: (state: RoleState) => state.activeRole?.name === 'admin',
  isUser: (state: RoleState) => state.activeRole?.name === 'user',

  hasMultipleRoles: (state: RoleState) => state.availableRoles.length > 1,

  // Permission selectors
  canViewDashboard: (state: RoleState) => {
    return state.activeRole?.name === 'manager' || state.activeRole?.name === 'admin'
  },

  canManageTemplates: (state: RoleState) => {
    return state.activeRole?.name === 'admin'
  },

  canViewReports: (state: RoleState) => {
    return state.activeRole?.name === 'manager' || state.activeRole?.name === 'admin'
  },

  // Feature availability
  hasFeature: (feature: string) => (state: RoleState) => {
    return state.availableFeatures.includes(feature)
  },
}

// React hooks for role management
export const useCurrentRole = () => {
  return useRoleStore(roleSelectors.activeRole)
}

export const useAvailableRoles = () => {
  return useRoleStore(roleSelectors.availableRoles)
}

export const useRoleNavigation = () => {
  return useRoleStore(roleSelectors.navigationItems)
}

export const useDashboardLayout = () => {
  return useRoleStore(roleSelectors.dashboardLayout)
}

export const useRolePermissions = () => {
  const canPerformAction = useRoleStore((state) => state.canPerformAction)
  const getAccessibleDepartments = useRoleStore((state) => state.getAccessibleDepartments)

  return {
    canPerformAction,
    getAccessibleDepartments,
    canViewDashboard: useRoleStore(roleSelectors.canViewDashboard),
    canManageTemplates: useRoleStore(roleSelectors.canManageTemplates),
    canViewReports: useRoleStore(roleSelectors.canViewReports),
  }
}

export const useRoleFeatures = () => {
  const availableFeatures = useRoleStore(roleSelectors.availableFeatures)
  const hasFeature = useRoleStore((state) => state.availableFeatures.includes)

  return {
    availableFeatures,
    hasFeature: (feature: string) => availableFeatures.includes(feature),
  }
}

export const useRoleActions = () => {
  return {
    switchRole: useRoleStore((state) => state.switchRole),
    refreshPermissions: useRoleStore((state) => state.refreshPermissions),
  }
}

// Role switching helper
export const switchToRole = (roleName: string) => {
  const authState = useAuthStore.getState()
  const targetRole = authState.roles.find((r) => r.name === roleName)

  if (targetRole) {
    useRoleStore.getState().switchRole(targetRole)
  } else {
    console.error(`Role ${roleName} not available for current user`)
  }
}

// Check if user can perform specific actions
export const checkPermission = (action: string): boolean => {
  return useRoleStore.getState().canPerformAction(action)
}

// Get navigation items for current role
export const getCurrentNavigation = (): NavigationItem[] => {
  return useRoleStore.getState().getRoleBasedNavigation()
}

// Role-based component wrapper
export const withRoleCheck = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: string | string[],
) => {
  return (props: P) => {
    const activeRole = useCurrentRole()
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

    if (!activeRole || !requiredRoles.includes(activeRole.name)) {
      return null
    }

    return <Component {...props} />
  }
}

// Permission-based component wrapper
export const withPermissionCheck = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string | string[],
) => {
  return (props: P) => {
    const { canPerformAction } = useRolePermissions()
    const requiredPermissions = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission]

    const hasPermission = requiredPermissions.some((permission) => canPerformAction(permission))

    if (!hasPermission) {
      return null
    }

    return <Component {...props} />
  }
}

// Development helpers
export const resetRoleStore = () => {
  useRoleStore.setState({
    activeRole: null,
    availableRoles: [],
    rolePermissions: {},
    navigationItems: [],
    dashboardLayout: 'user',
    availableFeatures: [],
  })
}

export const getRoleState = () => {
  return useRoleStore.getState()
}

// Debug helper to log current role context
export const logRoleContext = () => {
  const roleState = useRoleStore.getState()
  const authState = useAuthStore.getState()

  console.log('Role Context:', {
    activeRole: roleState.activeRole,
    availableRoles: authState.roles,
    permissions: roleState.rolePermissions,
    features: roleState.availableFeatures,
    navigation: roleState.navigationItems,
  })
}
