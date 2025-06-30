import React, { Suspense } from 'react'
import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { LoaderCircle, TriangleAlert, RefreshCw } from 'lucide-react'

import { ErrorBoundary } from 'react-error-boundary'

export interface QuerySuspenseBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const QuerySuspenseBoundary: React.FC<QuerySuspenseBoundaryProps> = ({ 
  children, 
  fallback 
}) => {
  const isFetching = useIsFetching()
  
  // Show loading indicator if queries are actively fetching
  if (isFetching > 0) {
    return fallback ?? <ChecklistSkeleton />
  }
  
  return (
    <ErrorBoundary FallbackComponent={DataErrorFallback}>
      <Suspense fallback={fallback ?? <ChecklistSkeleton />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

interface DataErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

const DataErrorFallback: React.FC<DataErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
    <TriangleAlert className="h-12 w-12 text-red-500 mb-4" />
    <h2 className="text-lg font-semibold text-gray-900 mb-2">
      Something went wrong
    </h2>
    <p className="text-sm text-gray-600 mb-4 max-w-md">
      {error.message || 'An unexpected error occurred while loading data.'}
    </p>
    <button
      onClick={resetErrorBoundary}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <RefreshCw className="h-4 w-4" />
      Try again
    </button>
  </div>
)

const ChecklistSkeleton: React.FC = () => (
  <div className="space-y-4 p-4">
    <div className="flex items-center justify-center mb-6">
      <LoaderCircle className="h-6 w-6 text-blue-600 animate-spin" />
      <span className="ml-2 text-sm text-gray-600">Loading checklists...</span>
    </div>
    {Array.from({ length: 3 }, (_, i) => (
      <div key={i} className="animate-pulse">
        <div className="rounded-lg bg-white p-4 shadow border">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-3">
            <div className="h-6 w-3/4 rounded bg-gray-200"></div>
            <div className="h-5 w-16 rounded bg-gray-200"></div>
          </div>
          
          {/* Progress bar skeleton */}
          <div className="mb-3">
            <div className="h-2 w-full rounded bg-gray-200"></div>
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-2/3 rounded bg-gray-200"></div>
          </div>
          
          {/* Footer skeleton */}
          <div className="flex justify-between items-center mt-4">
            <div className="h-4 w-24 rounded bg-gray-200"></div>
            <div className="h-4 w-20 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

// Global loading indicator for multiple queries
export const GlobalQueryIndicator: React.FC = () => {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  
  const isLoading = isFetching > 0 || isMutating > 0
  
  if (!isLoading) return null
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        <span className="text-sm">
          {isFetching > 0 && isMutating > 0 
            ? 'Syncing data...'
            : isFetching > 0 
            ? 'Loading...'
            : 'Saving...'
          }
        </span>
      </div>
    </div>
  )
}

// PWA-specific loading states
const PWALoadingStates = {
  offline: (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
      <div className="h-12 w-12 bg-gray-300 rounded-full mb-4 flex items-center justify-center">
        📱
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Working Offline
      </h2>
      <p className="text-sm text-gray-600">
        You&apos;re offline, but you can still view and edit your checklists.
        Changes will sync when you&apos;re back online.
      </p>
    </div>
  ),
  
  syncing: (
    <div className="flex items-center gap-2 text-blue-600 text-sm">
      <LoaderCircle className="h-4 w-4 animate-spin" />
      Syncing changes...
    </div>
  ),
  
  syncComplete: (
    <div className="flex items-center gap-2 text-green-600 text-sm">
      ✓ All changes synced
    </div>
  )
}