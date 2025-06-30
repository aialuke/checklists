import React from 'react'

import { 
  useAuthSession, 
  useUserProfile, 
  useLoginMutation, 
  useLogoutMutation, 
  useCurrentUserRoles,
  useCurrentUserDepartments 
} from '../queries/authQueries'
import { useNetworkStatus } from '../queries/offlineQueries'
import { useNotifications } from '../stores/notificationClientStore'
import type { Department, Role, User } from '../types'

// Auth Container Props Interface
export interface AuthContainerProps {
  children: (props: AuthContainerState) => React.ReactNode
}

// State passed to presentational components
export interface AuthContainerState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  roles: Role[]
  availableDepartments: Department[]
  selectedDepartment: Department | null
  activeRole: Role | null

  // Actions
  login: (staffNumber: string) => Promise<void>
  logout: () => Promise<void>
  setDepartment: (department: Department) => void
  setActiveRole: (role: Role) => void
  clearError: () => void

  // Computed
  hasRole: (roleName: string) => boolean
  hasAnyRole: (roleNames: string[]) => boolean
  canAccessDepartment: (departmentId: string) => boolean
}

/**
 * AuthContainer - Connects UI components to TanStack Query
 * Implements Container/Presentational pattern for clean separation
 */
export const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
  // Get state from TanStack Query hooks
  const { data: session, isLoading: sessionLoading } = useAuthSession()
  const { data: userProfile, isLoading: profileLoading } = useUserProfile(session?.user?.id)
  const loginMutation = useLoginMutation()
  const logoutMutation = useLogoutMutation()
  const roles = useCurrentUserRoles()
  const departments = useCurrentUserDepartments()
  
  // Offline and notification support
  const { data: networkStatus } = useNetworkStatus()
  const { success, error: showError, offlineMode, backOnline } = useNotifications()
  
  // Track offline status for notifications
  React.useEffect(() => {
    if (networkStatus) {
      if (!networkStatus.isOnline) {
        offlineMode()
      } else if (networkStatus.lastConnected && 
                 Date.now() - networkStatus.lastConnected > 60000) { // Was offline for more than 1 minute
        backOnline()
      }
    }
  }, [networkStatus?.isOnline, offlineMode, backOnline])

  // Derived state
  const isAuthenticated = !!session?.user
  const isLoading = sessionLoading || profileLoading || loginMutation.isPending || logoutMutation.isPending
  const user = userProfile || null
  const error = loginMutation.error?.message || logoutMutation.error?.message || null

  // TODO: These will need to be managed by a separate client-side store during migration
  // For now, we'll provide default values
  const [selectedDepartment, setSelectedDepartment] = React.useState<Department | null>(
    departments.length === 1 ? (departments[0] ?? null) : null
  )
  const [activeRole, setActiveRole] = React.useState<Role | null>(
    roles.length === 1 ? (roles[0] ?? null) : null
  )

  // Actions
  const login = async (staffNumber: string) => {
    try {
      const result = await loginMutation.mutateAsync({ staffNumber })
      // Auto-select department and role if only one available
      if (result.departments.length === 1 && result.departments[0]) {
        setSelectedDepartment(result.departments[0])
      }
      if (result.roles.length === 1 && result.roles[0]) {
        setActiveRole(result.roles[0])
      }
      
      // Show success notification
      success('Welcome back!', `Logged in as staff #${staffNumber}`)
    } catch (err) {
      // Show error notification
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      showError('Login Failed', errorMessage)
    }
  }

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync()
      setSelectedDepartment(null)
      setActiveRole(null)
      success('Logged out', 'You have been logged out successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed'
      showError('Logout Failed', errorMessage)
    }
  }

  const setDepartment = (department: Department) => {
    // Check if user can access department
    if (canAccessDepartment(department.id)) {
      setSelectedDepartment(department)
    }
  }

  const setActiveRoleLocal = (role: Role) => {
    // Check if user has this role
    if (hasRole(role.name)) {
      setActiveRole(role)
    }
  }

  const clearError = () => {
    // Mutations handle their own errors, so this is a no-op for now
  }

  // Computed helpers
  const hasRole = (roleName: string) => {
    return roles.some((role) => role.name === roleName)
  }

  const hasAnyRole = (roleNames: string[]) => {
    return roleNames.some((roleName) => hasRole(roleName))
  }

  const canAccessDepartment = (departmentId: string) => {
    // Admins can access all departments
    if (roles.some((role) => role.name === 'admin')) {
      return true
    }
    // Check if department is in user's available departments
    return departments.some((dept) => dept.id === departmentId)
  }

  const containerState: AuthContainerState = {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    roles,
    availableDepartments: departments,
    selectedDepartment,
    activeRole,

    // Actions
    login,
    logout,
    setDepartment,
    setActiveRole: setActiveRoleLocal,
    clearError,

    // Computed
    hasRole,
    hasAnyRole,
    canAccessDepartment,
  }

  return <>{children(containerState)}</>
}

