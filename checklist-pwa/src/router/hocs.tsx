import React from 'react'

import { ProtectedRoute, type ProtectedRouteProps } from './ProtectedRoute'

/**
 * Router HOC utilities
 * Separated from component files to support React Fast Refresh
 */

const withAuth = <P extends Record<string, unknown> = Record<string, never>>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {},
) => {
  const AuthProtectedComponent = (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  )
  
  AuthProtectedComponent.displayName = `withAuth(${Component.displayName ?? Component.name})`
  return AuthProtectedComponent
}