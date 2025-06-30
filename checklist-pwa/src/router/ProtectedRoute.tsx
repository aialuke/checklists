import React from 'react'

import { Navigate, useLocation } from 'react-router'

import { AuthContainer } from '../containers'

// Protected Route Props Interface
export interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  requireAuth?: boolean
}

/**
 * ProtectedRoute - Route guard that checks authentication and role permissions
 * Uses AuthContainer to access auth state without duplicating logic
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireAuth = true,
}) => {
  const location = useLocation()

  return (
    <AuthContainer>
      {({ isAuthenticated, activeRole, hasAnyRole, isLoading }) => {
        // Show loading if auth is still initializing
        if (isLoading) {
          return (
            <div className='bg-surface-base flex min-h-screen items-center justify-center'>
              <div className='bg-surface-card h-32 w-64 animate-pulse rounded-xl' />
            </div>
          )
        }

        // Check authentication requirement
        if (requireAuth && !isAuthenticated) {
          return <Navigate to='/login' state={{ from: location }} replace />
        }

        // Check role requirements
        if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
          // Redirect to appropriate dashboard based on current role
          const redirectPath = getDefaultDashboardForRole(activeRole?.name)
          return <Navigate to={redirectPath} replace />
        }

        return <>{children}</>
      }}
    </AuthContainer>
  )
}

/**
 * Get default dashboard path based on user role
 */
function getDefaultDashboardForRole(roleName?: string): string {
  switch (roleName) {
    case 'admin':
      return '/admin'
    case 'manager':
      return '/manager'
    case 'user':
    default:
      return '/dashboard'
  }
}

