import React from 'react'

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'

import { ProtectedRoute } from './ProtectedRoute'
import {
  LoginPage,
  DashboardPage,
  ChecklistPage,
  ManagerDashboardPage,
  AdminDashboardPage,
} from '../pages'

/**
 * Application Router Configuration
 * Implements role-based routing with protected routes
 */
const router = createBrowserRouter([
  // Public Routes
  {
    path: '/login',
    element: <LoginPage />,
  },

  // Default redirect to dashboard
  {
    path: '/',
    element: <Navigate to='/dashboard' replace />,
  },

  // Staff Routes (User Role)
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute requiredRoles={['user', 'manager', 'admin']}>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/checklist/:checklistId',
    element: (
      <ProtectedRoute requiredRoles={['user', 'manager', 'admin']}>
        <ChecklistPage />
      </ProtectedRoute>
    ),
  },

  // Manager Routes
  {
    path: '/manager',
    element: (
      <ProtectedRoute requiredRoles={['manager', 'admin']}>
        <ManagerDashboardPage />
      </ProtectedRoute>
    ),
  },

  // Admin Routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRoles={['admin']}>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },

  // 404 Catch-all
  {
    path: '*',
    element: (
      <div className='bg-surface-base flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-foreground mb-4 text-2xl font-bold'>Page Not Found</h1>
          <p className='text-foreground-muted mb-6'>The page you&apos;re looking for doesn&apos;t exist.</p>
          <a
            href='/dashboard'
            className='bg-primary-500 text-foreground hover:bg-primary-600 rounded-lg px-6 py-3 font-medium transition-colors'
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    ),
  },
])

/**
 * Main App Router Component
 */
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />
}

