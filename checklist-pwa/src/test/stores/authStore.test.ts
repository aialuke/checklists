import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  usePermissions,
  resetAuthStore,
} from '../../stores/authStore'
import {
  createMockUser,
  createMockRole,
  createMockDepartment,
  setupAuthStore,
} from '../utils/store-test-utils'

describe('AuthStore', () => {
  beforeEach(() => {
    resetAuthStore()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState()

      expect(state.user).toBeNull()
      expect(state.roles).toEqual([])
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.selectedDepartment).toBeNull()
      expect(state.availableDepartments).toEqual([])
      expect(state.activeRole).toBeNull()
    })
  })

  describe('Login Action', () => {
    it('should handle successful login', async () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.login('123456')
      })

      // Should start loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()

      // Wait for login to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1100))
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toMatchObject({
        staff_number: '123456',
        full_name: 'John Doe',
      })
      expect(result.current.roles).toHaveLength(2)
    })

    it('should handle login failure', async () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.login('invalid')
      })

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1100))
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe('Invalid staff number')
      expect(result.current.user).toBeNull()
    })
  })

  describe('Department Selection', () => {
    it('should allow setting department for authorized user', () => {
      const department = createMockDepartment()
      setupAuthStore({
        isAuthenticated: true,
        departments: [department],
      })

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setDepartment(department)
      })

      expect(result.current.selectedDepartment).toEqual(department)
      expect(result.current.error).toBeNull()
    })

    it('should reject unauthorized department access', () => {
      const authorizedDept = createMockDepartment({ id: 'dept-1' })
      const unauthorizedDept = createMockDepartment({ id: 'dept-2', name: 'Unauthorized' })

      setupAuthStore({
        isAuthenticated: true,
        departments: [authorizedDept],
      })

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setDepartment(unauthorizedDept)
      })

      expect(result.current.selectedDepartment).not.toEqual(unauthorizedDept)
      expect(result.current.error).toBe('You do not have access to this department')
    })
  })

  describe('Role Management', () => {
    it('should allow setting active role for user with role', () => {
      const userRole = createMockRole({ name: 'user' })
      const managerRole = createMockRole({ id: 'role-2', name: 'manager' })

      setupAuthStore({
        roles: [userRole, managerRole],
        activeRole: userRole,
      })

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setActiveRole(managerRole)
      })

      expect(result.current.activeRole).toEqual(managerRole)
      expect(result.current.error).toBeNull()
    })

    it('should reject role assignment for unauthorized role', () => {
      const userRole = createMockRole({ name: 'user' })
      const adminRole = createMockRole({ id: 'role-admin', name: 'admin' })

      setupAuthStore({
        roles: [userRole],
        activeRole: userRole,
      })

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setActiveRole(adminRole)
      })

      expect(result.current.activeRole).toEqual(userRole)
      expect(result.current.error).toBe('You do not have this role assigned')
    })
  })

  describe('Permission Checking', () => {
    it('should correctly identify user roles', () => {
      const userRole = createMockRole({ name: 'user' })
      const managerRole = createMockRole({ id: 'role-2', name: 'manager' })

      setupAuthStore({
        roles: [userRole, managerRole],
      })

      const { result } = renderHook(() => useAuthStore())

      expect(result.current.hasRole('user')).toBe(true)
      expect(result.current.hasRole('manager')).toBe(true)
      expect(result.current.hasRole('admin')).toBe(false)
    })

    it('should check multiple roles with hasAnyRole', () => {
      const userRole = createMockRole({ name: 'user' })

      setupAuthStore({
        roles: [userRole],
      })

      const { result } = renderHook(() => useAuthStore())

      expect(result.current.hasAnyRole(['user', 'manager'])).toBe(true)
      expect(result.current.hasAnyRole(['manager', 'admin'])).toBe(false)
    })

    it('should check department access for admin users', () => {
      const adminRole = createMockRole({ name: 'admin' })
      const department = createMockDepartment()

      setupAuthStore({
        roles: [adminRole],
        departments: [department],
      })

      const { result } = renderHook(() => useAuthStore())

      // Admin should have access to any department
      expect(result.current.canAccessDepartment('any-department-id')).toBe(true)
    })
  })

  describe('Logout Action', () => {
    it('should clear all auth state on logout', async () => {
      setupAuthStore({
        isAuthenticated: true,
        user: createMockUser(),
        roles: [createMockRole()],
      })

      const { result } = renderHook(() => useAuthStore())

      expect(result.current.isAuthenticated).toBe(true)

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.roles).toEqual([])
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.selectedDepartment).toBeNull()
      expect(result.current.activeRole).toBeNull()
    })
  })

  describe('React Hooks', () => {
    it('should provide user data through useUser hook', () => {
      const user = createMockUser()
      setupAuthStore({ user })

      const { result } = renderHook(() => useUser())

      expect(result.current).toEqual(user)
    })

    it('should provide authentication status through useIsAuthenticated hook', () => {
      setupAuthStore({ isAuthenticated: true })

      const { result } = renderHook(() => useIsAuthenticated())

      expect(result.current).toBe(true)
    })

    it('should provide permission helpers through usePermissions hook', () => {
      const userRole = createMockRole({ name: 'user' })
      setupAuthStore({ roles: [userRole] })

      const { result } = renderHook(() => usePermissions())

      expect(result.current.hasRole('user')).toBe(true)
      expect(result.current.hasRole('admin')).toBe(false)
    })
  })

  describe('Store Persistence', () => {
    it('should persist essential auth data', () => {
      const user = createMockUser()
      const role = createMockRole()
      const department = createMockDepartment()

      setupAuthStore({
        user,
        roles: [role],
        departments: [department],
        isAuthenticated: true,
        selectedDepartment: department,
        activeRole: role,
      })

      // Get current state
      const state = useAuthStore.getState()

      // Simulate store rehydration
      resetAuthStore()
      useAuthStore.setState({
        user: state.user,
        roles: state.roles,
        isAuthenticated: state.isAuthenticated,
        selectedDepartment: state.selectedDepartment,
        availableDepartments: state.availableDepartments,
        activeRole: state.activeRole,
        isLoading: false,
        error: null,
      })

      const newState = useAuthStore.getState()
      expect(newState.user).toEqual(user)
      expect(newState.isAuthenticated).toBe(true)
      expect(newState.selectedDepartment).toEqual(department)
      expect(newState.activeRole).toEqual(role)
    })
  })

  describe('Store Subscriptions', () => {
    it('should notify subscribers of state changes', () => {
      const subscriber = vi.fn()
      const unsubscribe = useAuthStore.subscribe(subscriber)

      const user = createMockUser()

      act(() => {
        useAuthStore.setState({ user, isAuthenticated: true })
      })

      expect(subscriber).toHaveBeenCalled()

      unsubscribe()
    })

    it('should allow selective subscriptions', () => {
      const userSubscriber = vi.fn()
      const unsubscribe = useAuthStore.subscribe((state) => state.user, userSubscriber)

      const user = createMockUser()

      act(() => {
        useAuthStore.setState({ user })
      })

      expect(userSubscriber).toHaveBeenCalledWith(user)

      // Should not trigger when other state changes
      userSubscriber.mockClear()

      act(() => {
        useAuthStore.setState({ isLoading: true })
      })

      expect(userSubscriber).not.toHaveBeenCalled()

      unsubscribe()
    })
  })
})
