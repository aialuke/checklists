import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import type { AuthState, User, Role, Department } from './types'

// Supabase client (to be imported from services)
// import { supabase } from '../services/api/supabase.client'

// Mock implementation for development
const mockSupabaseAuth = {
  validateStaffNumber: async (staffNumber: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (staffNumber === '123456') {
      return {
        user: {
          id: 'user-1',
          staff_number: '123456',
          full_name: 'John Doe',
          email: 'john.doe@company.com',
          department_id: 'dept-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        roles: [
          { id: 'role-1', name: 'user' as const, description: 'Standard user access' },
          { id: 'role-2', name: 'manager' as const, description: 'Department manager access' },
        ],
        departments: [
          {
            id: 'dept-1',
            name: 'Kitchen',
            code: 'KITCHEN',
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      }
    }

    throw new Error('Invalid staff number')
  },

  signOut: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
  },
}

// Create the auth store with modern Zustand 5.x patterns
export const useAuthStore = create<AuthState>()(
  devtools(
    subscribeWithSelector(
      immer(
        persist(
          (set, get) => ({
            // Initial state
            user: null,
            roles: [],
            isAuthenticated: false,
            isLoading: false,
            error: null,
            selectedDepartment: null,
            availableDepartments: [],
            activeRole: null,

            // Actions
            login: async (staffNumber: string) => {
              set((state) => {
                state.isLoading = true
                state.error = null
              })

              try {
                const { user, roles, departments } =
                  await mockSupabaseAuth.validateStaffNumber(staffNumber)

                set((state) => {
                  state.user = user
                  state.roles = roles
                  state.availableDepartments = departments
                  state.isAuthenticated = true
                  state.isLoading = false

                  // Auto-select department if user has only one
                  if (departments.length === 1) {
                    state.selectedDepartment = departments[0]
                  }

                  // Auto-select role if user has only one
                  if (roles.length === 1) {
                    state.activeRole = roles[0]
                  }
                })
              } catch (error) {
                set((state) => {
                  state.error = error instanceof Error ? error.message : 'Login failed'
                  state.isLoading = false
                  state.isAuthenticated = false
                })
              }
            },

            logout: async () => {
              set((state) => {
                state.isLoading = true
              })

              try {
                await mockSupabaseAuth.signOut()
              } catch (error) {
                console.error('Logout error:', error)
              } finally {
                set((state) => {
                  // Reset all auth state
                  state.user = null
                  state.roles = []
                  state.isAuthenticated = false
                  state.isLoading = false
                  state.error = null
                  state.selectedDepartment = null
                  state.availableDepartments = []
                  state.activeRole = null
                })
              }
            },

            setDepartment: (department: Department) => {
              set((state) => {
                const canAccess = get().canAccessDepartment(department.id)

                if (canAccess) {
                  state.selectedDepartment = department
                  state.error = null
                } else {
                  state.error = 'You do not have access to this department'
                }
              })
            },

            setActiveRole: (role: Role) => {
              set((state) => {
                const userHasRole = state.roles.some((r) => r.name === role.name)

                if (userHasRole) {
                  state.activeRole = role
                  state.error = null
                } else {
                  state.error = 'You do not have this role assigned'
                }
              })
            },

            clearError: () => {
              set((state) => {
                state.error = null
              })
            },

            // Computed getters
            hasRole: (roleName: string) => {
              const state = get()
              return state.roles.some((role) => role.name === roleName)
            },

            hasAnyRole: (roleNames: string[]) => {
              const state = get()
              return roleNames.some((roleName) =>
                state.roles.some((role) => role.name === roleName),
              )
            },

            canAccessDepartment: (departmentId: string) => {
              const state = get()

              // Admins can access all departments
              if (state.roles.some((role) => role.name === 'admin')) {
                return true
              }

              // Check if department is in user's available departments
              return state.availableDepartments.some((dept) => dept.id === departmentId)
            },
          }),
          {
            name: 'auth-store',
            version: 1,
            // Only persist essential auth data
            partialize: (state) => ({
              user: state.user,
              roles: state.roles,
              isAuthenticated: state.isAuthenticated,
              selectedDepartment: state.selectedDepartment,
              availableDepartments: state.availableDepartments,
              activeRole: state.activeRole,
            }),
            // Exclude sensitive or temporary data
            blacklist: ['isLoading', 'error'],
          },
        ),
      ),
    ),
    {
      name: 'auth-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)

// Selectors for optimized subscriptions
export const authSelectors = {
  user: (state: AuthState) => state.user,
  isAuthenticated: (state: AuthState) => state.isAuthenticated,
  isLoading: (state: AuthState) => state.isLoading,
  error: (state: AuthState) => state.error,
  roles: (state: AuthState) => state.roles,
  activeRole: (state: AuthState) => state.activeRole,
  selectedDepartment: (state: AuthState) => state.selectedDepartment,
  availableDepartments: (state: AuthState) => state.availableDepartments,

  // Computed selectors
  isManager: (state: AuthState) => state.roles.some((role) => role.name === 'manager'),
  isAdmin: (state: AuthState) => state.roles.some((role) => role.name === 'admin'),
  hasMultipleRoles: (state: AuthState) => state.roles.length > 1,
  hasMultipleDepartments: (state: AuthState) => state.availableDepartments.length > 1,

  // Complex selectors
  userDisplayName: (state: AuthState) => {
    return state.user?.full_name || state.user?.staff_number || 'Unknown User'
  },

  currentContext: (state: AuthState) => ({
    user: state.user,
    role: state.activeRole,
    department: state.selectedDepartment,
    isFullySetup: !!(state.user && state.activeRole && state.selectedDepartment),
  }),
}

// React 19 Suspense-compatible auth hooks
export const useAuthSuspense = () => {
  const authState = useAuthStore()

  // Throw promise for Suspense boundary if loading
  if (authState.isLoading && !authState.user) {
    throw new Promise<void>((resolve) => {
      const unsubscribe = useAuthStore.subscribe(
        (state) => state.isLoading,
        (isLoading) => {
          if (!isLoading) {
            unsubscribe()
            resolve()
          }
        },
      )
    })
  }

  return authState
}

// Hook for user with automatic loading state
export const useUser = () => {
  return useAuthStore(authSelectors.user)
}

// Hook for authentication status
export const useIsAuthenticated = () => {
  return useAuthStore(authSelectors.isAuthenticated)
}

// Hook for current role context
export const useCurrentRole = () => {
  return useAuthStore(authSelectors.activeRole)
}

// Hook for department context
export const useCurrentDepartment = () => {
  return useAuthStore(authSelectors.selectedDepartment)
}

// Hook for role-based access control
export const usePermissions = () => {
  const hasRole = useAuthStore((state) => state.hasRole)
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole)
  const canAccessDepartment = useAuthStore((state) => state.canAccessDepartment)

  return {
    hasRole,
    hasAnyRole,
    canAccessDepartment,
  }
}

// Authentication actions hook
export const useAuthActions = () => {
  return {
    login: useAuthStore((state) => state.login),
    logout: useAuthStore((state) => state.logout),
    setDepartment: useAuthStore((state) => state.setDepartment),
    setActiveRole: useAuthStore((state) => state.setActiveRole),
    clearError: useAuthStore((state) => state.clearError),
  }
}

// Development helper to reset auth state
export const resetAuthStore = () => {
  useAuthStore.setState({
    user: null,
    roles: [],
    isAuthenticated: false,
    isLoading: false,
    error: null,
    selectedDepartment: null,
    availableDepartments: [],
    activeRole: null,
  })
}

// Subscribe to auth state changes
export const subscribeToAuth = (callback: (state: AuthState) => void) => {
  return useAuthStore.subscribe(callback)
}

// Get current auth state without subscribing
export const getAuthState = () => {
  return useAuthStore.getState()
}
