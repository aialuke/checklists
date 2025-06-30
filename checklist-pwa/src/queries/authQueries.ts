import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { 
  User, 
  Role, 
  Department, 
  LoginMutationVariables, 
  LoginMutationResponse 
} from '../types/auth'

// Import supabase client - will use mock until real integration is set up
// import { supabase } from '../services/api/supabase.client'

// Mock implementation matching authStore behavior for now
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
          { id: 'role-1', name: 'user', description: 'Standard user access' },
          { id: 'role-2', name: 'manager', description: 'Department manager access' },
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
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600000, // 1 hour
          user: {
            id: 'user-1',
            email: 'john.doe@company.com',
          }
        }
      }
    }

    throw new Error('Invalid staff number')
  },

  getSession: async () => {
    // Mock session check
    const stored = localStorage.getItem('auth-session')
    if (stored) {
      const session = JSON.parse(stored)
      if (session.expires_at > Date.now()) {
        return { session, error: null }
      }
    }
    return { session: null, error: null }
  },

  signOut: async () => {
    localStorage.removeItem('auth-session')
    await new Promise((resolve) => setTimeout(resolve, 500))
  },
}

// Query key factory (2024 best practice)
const authKeys = {
  all: ['auth'] as const,
  users: () => [...authKeys.all, 'users'] as const,
  user: (id: string) => [...authKeys.users(), id] as const,
  sessions: () => [...authKeys.all, 'sessions'] as const,
  session: () => [...authKeys.sessions(), 'current'] as const,
  departments: () => [...authKeys.all, 'departments'] as const,
  roles: (userId?: string) => [...authKeys.all, 'roles', userId] as const,
}

// Core authentication queries
export const useAuthSession = () => {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const { session, error } = await mockSupabaseAuth.getSession()
      if (error) throw error
      return session
    },
    staleTime: Infinity,
    retry: false,
  })
}

export const useUserProfile = (userId?: string) => {
  return useQuery({
    queryKey: authKeys.user(userId || ''),
    queryFn: async () => {
      if (!userId) return null
      
      // In real implementation, this would fetch from Supabase
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('id', userId)
      //   .single()
      // if (error) throw error
      // return data
      
      // Mock implementation
      return {
        id: userId,
        staff_number: '123456',
        full_name: 'John Doe',
        email: 'john.doe@company.com',
        department_id: 'dept-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User
    },
    enabled: !!userId,
  })
}

const useUserRoles = (userId?: string) => {
  return useQuery({
    queryKey: authKeys.roles(userId),
    queryFn: async () => {
      if (!userId) return []
      
      // Mock implementation - in real app would fetch from Supabase
      return [
        { id: 'role-1', name: 'user', description: 'Standard user access' },
        { id: 'role-2', name: 'manager', description: 'Department manager access' },
      ] as Role[]
    },
    enabled: !!userId,
  })
}

const useUserDepartments = (userId?: string) => {
  return useQuery({
    queryKey: authKeys.departments(),
    queryFn: async () => {
      if (!userId) return []
      
      // Mock implementation - in real app would fetch from Supabase
      return [
        {
          id: 'dept-1',
          name: 'Kitchen',
          code: 'KITCHEN',
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ] as Department[]
    },
    enabled: !!userId,
  })
}

// Authentication mutations
export const useLoginMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ staffNumber }: LoginMutationVariables): Promise<LoginMutationResponse> => {
      const result = await mockSupabaseAuth.validateStaffNumber(staffNumber)
      
      // Store session for mock persistence
      localStorage.setItem('auth-session', JSON.stringify(result.session))
      
      return result
    },
    onSuccess: (data) => {
      // Invalidate all auth queries to refresh data
      queryClient.invalidateQueries({ queryKey: authKeys.all })
      
      // Set user data in cache
      if (data.user) {
        queryClient.setQueryData(authKeys.user(data.user.id), data.user)
        queryClient.setQueryData(authKeys.roles(data.user.id), data.roles)
        queryClient.setQueryData(authKeys.departments(), data.departments)
        queryClient.setQueryData(authKeys.session(), data.session)
      }
    },
    onError: (error) => {
      console.error('Login failed:', error)
      // Clear any stale auth data
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    }
  })
}

export const useLogoutMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      await mockSupabaseAuth.signOut()
    },
    onSuccess: () => {
      // Clear all query cache on logout
      queryClient.clear()
    },
    onError: (error) => {
      console.error('Logout error:', error)
      // Clear cache anyway on logout error
      queryClient.clear()
    }
  })
}

// Helper hooks for convenience
const useIsAuthenticated = () => {
  const { data: session } = useAuthSession()
  return !!session
}

const useCurrentUser = () => {
  const { data: session } = useAuthSession()
  const { data: user } = useUserProfile(session?.user?.id)
  return user
}

export const useCurrentUserRoles = () => {
  const { data: session } = useAuthSession()
  const { data: roles } = useUserRoles(session?.user?.id)
  return roles || []
}

export const useCurrentUserDepartments = () => {
  const { data: session } = useAuthSession()
  const { data: departments } = useUserDepartments(session?.user?.id)
  return departments || []
}