import React, { Suspense, ErrorBoundary, ReactNode } from 'react'
import { useAuthStore, authSelectors } from './authStore'
import { useChecklistStore, checklistSelectors } from './checklistStore'
import { useOfflineStore, offlineSelectors } from './offlineStore'
import { useRoleStore, roleSelectors } from './roleStore'
import { useNotificationStore, notificationSelectors } from './notificationStore'

// Enhanced React 19 Suspense patterns for Zustand stores

// Loading skeleton components
const AuthSkeleton = () => (
  <div className='animate-pulse'>
    <div className='mb-4 h-8 w-48 rounded bg-gray-200'></div>
    <div className='h-4 w-32 rounded bg-gray-200'></div>
  </div>
)

const ChecklistSkeleton = () => (
  <div className='space-y-4'>
    {[...Array(3)].map((_, i) => (
      <div key={i} className='animate-pulse'>
        <div className='rounded-lg bg-white p-4 shadow'>
          <div className='mb-2 h-6 w-3/4 rounded bg-gray-200'></div>
          <div className='mb-2 h-4 w-1/2 rounded bg-gray-200'></div>
          <div className='h-2 w-full rounded bg-gray-200'></div>
        </div>
      </div>
    ))}
  </div>
)

const DashboardSkeleton = () => (
  <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
    {[...Array(6)].map((_, i) => (
      <div key={i} className='animate-pulse'>
        <div className='rounded-lg bg-white p-6 shadow'>
          <div className='mb-4 h-8 w-16 rounded bg-gray-200'></div>
          <div className='h-4 w-24 rounded bg-gray-200'></div>
        </div>
      </div>
    ))}
  </div>
)

// Error fallback components
interface ErrorFallbackProps {
  error: Error
  retry: () => void
}

const AuthErrorFallback = ({ error, retry }: ErrorFallbackProps) => (
  <div className='rounded-lg border border-red-200 bg-red-50 p-6'>
    <h3 className='mb-2 font-medium text-red-800'>Authentication Error</h3>
    <p className='mb-4 text-sm text-red-600'>{error.message}</p>
    <button onClick={retry} className='rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700'>
      Retry Login
    </button>
  </div>
)

const DataErrorFallback = ({ error, retry }: ErrorFallbackProps) => (
  <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-6'>
    <h3 className='mb-2 font-medium text-yellow-800'>Data Loading Error</h3>
    <p className='mb-4 text-sm text-yellow-700'>{error.message}</p>
    <button
      onClick={retry}
      className='rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700'
    >
      Retry
    </button>
  </div>
)

// Suspense-compatible hooks using React 19 patterns
export const useAuthSuspense = () => {
  const isLoading = useAuthStore(authSelectors.isLoading)
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated)
  const user = useAuthStore(authSelectors.user)
  const error = useAuthStore(authSelectors.error)

  // Create suspense promise for initial auth check
  if (isLoading && !user && !error) {
    throw new Promise<void>((resolve, reject) => {
      const unsubscribe = useAuthStore.subscribe(
        (state) => ({ loading: state.isLoading, user: state.user, error: state.error }),
        ({ loading, user, error }) => {
          if (!loading || user || error) {
            unsubscribe()
            if (error) {
              reject(new Error(error))
            } else {
              resolve()
            }
          }
        },
      )
    })
  }

  if (error) {
    throw new Error(error)
  }

  return { isAuthenticated, user }
}

export const useChecklistsSuspense = () => {
  const isLoading = useChecklistStore(checklistSelectors.isLoading)
  const checklists = useChecklistStore(checklistSelectors.checklists)
  const error = useChecklistStore(checklistSelectors.error)

  // Throw promise for Suspense if still loading initial data
  if (isLoading && checklists.length === 0 && !error) {
    throw new Promise<void>((resolve, reject) => {
      const unsubscribe = useChecklistStore.subscribe(
        (state) => ({ loading: state.isLoading, data: state.checklists, error: state.error }),
        ({ loading, data, error }) => {
          if (!loading || data.length > 0 || error) {
            unsubscribe()
            if (error) {
              reject(new Error(error))
            } else {
              resolve()
            }
          }
        },
      )
    })
  }

  if (error) {
    throw new Error(error)
  }

  return checklists
}

// Higher-order components with React 19 Suspense
interface SuspenseWrapperProps {
  fallback?: ReactNode
  errorFallback?: React.ComponentType<ErrorFallbackProps>
  children: ReactNode
}

export const withAuthSuspense = (
  WrappedComponent: React.ComponentType<any>,
  options: { requireAuth?: boolean } = {},
) => {
  return (props: any) => (
    <ErrorBoundary
      fallback={({ error, retry }: any) => <AuthErrorFallback error={error} retry={retry} />}
    >
      <Suspense fallback={<AuthSkeleton />}>
        <AuthWrapper requireAuth={options.requireAuth}>
          <WrappedComponent {...props} />
        </AuthWrapper>
      </Suspense>
    </ErrorBoundary>
  )
}

export const withDataSuspense = (
  WrappedComponent: React.ComponentType<any>,
  fallback: ReactNode = <ChecklistSkeleton />,
) => {
  return (props: any) => (
    <ErrorBoundary
      fallback={({ error, retry }: any) => <DataErrorFallback error={error} retry={retry} />}
    >
      <Suspense fallback={fallback}>
        <WrappedComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

// Suspense boundary components
export const AuthSuspenseBoundary = ({
  children,
  fallback = <AuthSkeleton />,
}: SuspenseWrapperProps) => (
  <ErrorBoundary
    fallback={({ error, retry }: any) => <AuthErrorFallback error={error} retry={retry} />}
  >
    <Suspense fallback={fallback}>{children}</Suspense>
  </ErrorBoundary>
)

export const DataSuspenseBoundary = ({
  children,
  fallback = <ChecklistSkeleton />,
  errorFallback = DataErrorFallback,
}: SuspenseWrapperProps) => (
  <ErrorBoundary fallback={errorFallback}>
    <Suspense fallback={fallback}>{children}</Suspense>
  </ErrorBoundary>
)

export const DashboardSuspenseBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary
    fallback={({ error, retry }: any) => <DataErrorFallback error={error} retry={retry} />}
  >
    <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
  </ErrorBoundary>
)

// Auth wrapper component that uses Suspense
const AuthWrapper = ({
  children,
  requireAuth = true,
}: {
  children: ReactNode
  requireAuth?: boolean
}) => {
  const { isAuthenticated } = useAuthSuspense()

  if (requireAuth && !isAuthenticated) {
    // Redirect to login or show login form
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='w-full max-w-md rounded-lg bg-white p-6 shadow'>
          <h2 className='mb-4 text-xl font-semibold'>Authentication Required</h2>
          <p className='text-gray-600'>Please log in to access this content.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// React 19 data fetching patterns with Suspense
export const createSuspenseResource = <T,>(promiseFactory: () => Promise<T>, key: string) => {
  let status = 'pending'
  let result: T
  let error: Error

  const suspender = promiseFactory().then(
    (data) => {
      status = 'success'
      result = data
    },
    (err) => {
      status = 'error'
      error = err
    },
  )

  return {
    read(): T {
      if (status === 'pending') {
        throw suspender
      } else if (status === 'error') {
        throw error
      } else if (status === 'success') {
        return result
      }
      throw new Error('Unexpected resource state')
    },
  }
}

// Preload data for improved UX
export const preloadChecklists = () => {
  const checklistStore = useChecklistStore.getState()
  if (checklistStore.checklists.length === 0) {
    checklistStore.loadChecklists()
  }
}

export const preloadUserProfile = () => {
  const authStore = useAuthStore.getState()
  if (!authStore.user && !authStore.isLoading) {
    // Trigger auth check
    authStore.login('')
  }
}

// Concurrent features for React 19
export const useDeferredValue = <T,>(value: T) => {
  // React 19 useDeferredValue hook for non-urgent updates
  const [deferredValue, setDeferredValue] = React.useState(value)

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDeferredValue(value)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [value])

  return deferredValue
}

export const useTransition = () => {
  // React 19 useTransition hook for marking updates as non-urgent
  const [isPending, setIsPending] = React.useState(false)

  const startTransition = (callback: () => void) => {
    setIsPending(true)

    // Use scheduler.postTask if available, otherwise setTimeout
    if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
      ;(window as any).scheduler.postTask(
        () => {
          callback()
          setIsPending(false)
        },
        { priority: 'user-blocking' },
      )
    } else {
      setTimeout(() => {
        callback()
        setIsPending(false)
      }, 0)
    }
  }

  return [isPending, startTransition] as const
}

// Optimistic updates with Suspense
export const useOptimisticState = <T,>(
  state: T,
  updateFn: (currentState: T, optimisticValue: T) => T,
) => {
  const [optimisticState, setOptimisticState] = React.useState(state)
  const [isPending, startTransition] = useTransition()

  React.useEffect(() => {
    setOptimisticState(state)
  }, [state])

  const addOptimistic = (action: T) => {
    startTransition(() => {
      setOptimisticState((currentState) => updateFn(currentState, action))
    })
  }

  return [optimisticState, addOptimistic, isPending] as const
}

// Store integration with React 19 patterns
export const StoreProvider = ({ children }: { children: ReactNode }) => {
  React.useEffect(() => {
    // Initialize stores on mount
    const authStore = useAuthStore.getState()
    const offlineStore = useOfflineStore.getState()

    // Check auth status
    if (!authStore.isAuthenticated && !authStore.isLoading) {
      // Auto-login from stored session would go here
    }

    // Initialize offline monitoring
    if (typeof window !== 'undefined') {
      // Network monitoring is already initialized in offlineStore
    }
  }, [])

  return <>{children}</>
}

// Suspense-compatible error boundary
export class SuspenseErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: React.ComponentType<ErrorFallbackProps> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Suspense boundary caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DataErrorFallback
      return (
        <FallbackComponent
          error={this.state.error!}
          retry={() => this.setState({ hasError: false, error: undefined })}
        />
      )
    }

    return this.props.children
  }
}

// Example usage components
export const SuspenseChecklistPage = () => (
  <DataSuspenseBoundary fallback={<ChecklistSkeleton />}>
    <ChecklistContent />
  </DataSuspenseBoundary>
)

const ChecklistContent = () => {
  const checklists = useChecklistsSuspense()

  return (
    <div className='space-y-4'>
      {checklists.map((checklist) => (
        <div key={checklist.id} className='rounded-lg bg-white p-4 shadow'>
          <h3 className='font-medium'>{checklist.template?.name}</h3>
          <p className='text-sm text-gray-600'>Status: {checklist.status}</p>
        </div>
      ))}
    </div>
  )
}

export const SuspenseAuthCheck = () => (
  <AuthSuspenseBoundary>
    <AuthContent />
  </AuthSuspenseBoundary>
)

const AuthContent = () => {
  const { isAuthenticated, user } = useAuthSuspense()

  return <div>{isAuthenticated ? <p>Welcome, {user?.full_name}!</p> : <p>Please log in</p>}</div>
}
