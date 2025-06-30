// Role-specific types

import type { Role, Department } from './auth'

export interface NavigationItem {
  id: string
  label: string
  path: string
  icon?: string
  requiredPermission?: string
  children?: NavigationItem[]
  roles?: string[] // Added to accommodate existing code
}

// Role state interfaces (used by TanStack Query and Container components)
interface RoleState {
  activeRole: Role | null
  availableRoles: Role[]
  rolePermissions: Record<string, string[]>
  navigationItems: NavigationItem[]
  dashboardLayout: string
  availableFeatures: string[]

  // Actions
  switchRole: (role: Role) => void
  refreshPermissions: () => void

  // Computed getters
  canPerformAction: (action: string) => boolean
  getAccessibleDepartments: () => Department[]
  getRoleBasedNavigation: () => NavigationItem[]
}