// Auth-specific types

export interface User {
  id: string
  staff_number: string
  full_name: string
  email: string
  department_id: string
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  code: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: string
  description: string
}

// Auth state interfaces (used by TanStack Query and Container components)
interface AuthState {
  user: User | null
  roles: Role[]
  availableDepartments: Department[]
  isAuthenticated: boolean
  selectedDepartment: Department | null
  activeRole: Role | null
  isLoading: boolean
  error: string | null

  // Actions
  login: (staffNumber: string) => Promise<void>
  logout: () => Promise<void>
  setDepartment: (department: Department) => void
  setActiveRole: (role: Role) => void
  clearError: () => void

  // Computed getters
  hasRole: (roleName: string) => boolean
  hasAnyRole: (roleNames: string[]) => boolean
  canAccessDepartment: (departmentId: string) => boolean
}

// TanStack Query specific types
interface AuthQueryData {
  user: User | null
  session: any // Supabase session type
  roles: Role[]
  departments: Department[]
}

export interface LoginMutationVariables {
  staffNumber: string
}

export interface LoginMutationResponse {
  user: User
  roles: Role[]
  departments: Department[]
  session: any
}