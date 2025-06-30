import React, { useEffect } from 'react'

import { useNavigate } from 'react-router'

import { AppLayout } from '../../components/layout'
import {
  Button,
  Card,
  CardContent,
  Typography,
  ChecklistCard,
  StatusIndicator,
  Icon,
  ToastContainer,
  OfflineQueueIndicator,
} from '../../components/ui'
import {
  AuthContainer,
  ChecklistContainer,
  NotificationContainer,
  OfflineStatusContainer,
} from '../../containers'

import type {
  User,
  Department,
  Role,
  ChecklistInstance,
  Notification,
  ToastNotification,
  OfflineAction
} from '../../types'

/**
 * Staff DashboardPage - Main staff interface connected to stores
 * Shows assigned checklists and allows task completion
 */
export const DashboardPage: React.FC = () => {
  return (
    <AuthContainer>
      {(authState) => (
        <ChecklistContainer>
          {(checklistState) => (
            <NotificationContainer>
              {(notificationState) => (
                <OfflineStatusContainer>
                  {(offlineState) => (
                    <DashboardPagePresentation
                      {...authState}
                      {...checklistState}
                      {...notificationState}
                      {...offlineState}
                    />
                  )}
                </OfflineStatusContainer>
              )}
            </NotificationContainer>
          )}
        </ChecklistContainer>
      )}
    </AuthContainer>
  )
}

interface DashboardPagePresentationProps {
  // Auth state
  user: User | null
  selectedDepartment: Department | null
  activeRole: Role | null
  logout: () => Promise<void>

  // Checklist state
  checklists: ChecklistInstance[]
  isLoading: boolean
  error: string | null
  loadChecklists: () => Promise<void>
  selectChecklist: (checklistId: string) => void

  // Notification state
  notifications: Notification[]
  notificationCount: number
  toasts: ToastNotification[]
  showToast: (toast: {
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    duration?: number
  }) => void
  hideToast: (toastId: string) => void

  // Offline state
  isOnline: boolean
  connectionQuality: 'poor' | 'fair' | 'good' | 'excellent'
  queueCount: number
  syncQueue: OfflineAction[]
  hasFailedActions: boolean
  isSyncing: boolean
  syncProgress: number
  estimatedSyncTime: () => number
  syncNow: () => Promise<void>
  clearSyncErrors: () => void
}

const DashboardPagePresentation: React.FC<DashboardPagePresentationProps> = ({
  user,
  selectedDepartment,
  activeRole,
  logout,
  checklists,
  isLoading,
  error,
  loadChecklists,
  selectChecklist,
  toasts,
  hideToast,
  // Offline state
  isOnline,
  connectionQuality,
  queueCount,
  syncQueue,
  hasFailedActions,
  isSyncing,
  syncProgress,
  estimatedSyncTime,
  syncNow,
  clearSyncErrors,
}) => {
  const navigate = useNavigate()

  // Load checklists on component mount
  useEffect(() => {
    loadChecklists().catch(console.error)
  }, [loadChecklists])

  // Filter checklists for current department
  const todaysChecklists = checklists.filter(
    (checklist) =>
      checklist.department_id === selectedDepartment?.id &&
      new Date(checklist.assigned_date).toDateString() === new Date().toDateString(),
  )

  const handleLogout = async () => {
    await logout()
  }

  const handleRefresh = () => {
    loadChecklists().catch(console.error)
  }

  const navigationItems = [
    { id: 'home', label: 'Home', icon: 'home' as const },
    { id: 'tasks', label: 'Tasks', icon: 'check-circle' as const },
    { id: 'history', label: 'History', icon: 'clock' as const },
    { id: 'settings', label: 'Settings', icon: 'settings' as const },
  ]

  return (
    <AppLayout
      headerTitle={selectedDepartment?.name || 'Dashboard'}
      headerRightAction={{
        icon: 'log-out',
        onClick: () => { void handleLogout() },
        ariaLabel: 'Logout',
      }}
      navigationItems={navigationItems}
      activeNavigationId='home'
      onNavigationItemClick={() => { console.log('Staff navigation feature pending') }}
    >
      {/* Offline Queue Indicator - Floating */}
      <div className='fixed top-16 right-4 z-40'>
        <OfflineQueueIndicator
          queueCount={queueCount}
          syncQueue={syncQueue}
          hasFailedActions={hasFailedActions}
          isOnline={isOnline}
          connectionQuality={connectionQuality}
          isSyncing={isSyncing}
          syncProgress={syncProgress}
          estimatedSyncTime={estimatedSyncTime()}
          syncNow={syncNow}
          clearSyncErrors={clearSyncErrors}
          variant='compact'
          showRetryButton={false}
        />
      </div>
      <div className='flex-1 space-y-6 p-4'>
        {/* User Welcome */}
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <Typography variant='h2' className='text-foreground'>
                  Welcome back, {user?.full_name || 'User'}
                </Typography>
                <Typography variant='caption' className='text-foreground-muted'>
                  {selectedDepartment?.name} • {activeRole?.name}
                </Typography>
              </div>
              <Button variant='outline' size='sm' onClick={handleRefresh} loading={isLoading}>
                <Icon name='refresh-cw' className='mr-2 h-4 w-4' />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && <StatusIndicator type='sync-error' message={error} onDismiss={() => { console.log('Error dismiss feature pending') }} />}

        {/* Today's Checklists */}
        <div>
          <Typography variant='h2' className='mb-4'>
            Today&apos;s Checklists
          </Typography>

          {isLoading && todaysChecklists.length === 0 ? (
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='bg-surface-card h-24 animate-pulse rounded-xl' />
              ))}
            </div>
          ) : todaysChecklists.length > 0 ? (
            <div className='space-y-3'>
              {todaysChecklists.map((checklist) => (
                <ChecklistCard
                  key={checklist.id}
                  id={checklist.id}
                  title={checklist.template?.name || 'Checklist'}
                  department={selectedDepartment?.name || ''}
                  totalTasks={checklist.template?.task_count || 5}
                  completedTasks={Math.round(
                    (checklist.progress / 100) * (checklist.template?.task_count || 5),
                  )}
                  status={
                    checklist.status === 'pending'
                      ? 'not_started'
                      : (checklist.status as
                          | 'not_started'
                          | 'in_progress'
                          | 'completed'
                          | 'overdue')
                  }
                  type={
                    checklist.template?.type ??
                    'opening'
                  }
                  dueTime={checklist.template?.deadline_time}
                  onClick={(id) => {
                    selectChecklist(id)
                    void navigate(`/checklist/${id}`)
                  }}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className='p-8 text-center'>
                <Typography variant='body' className='text-foreground-muted'>
                  No checklists assigned for today
                </Typography>
                <Button variant='outline' size='sm' className='mt-4' onClick={handleRefresh}>
                  Check for Updates
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-2 gap-4'>
          <Card>
            <CardContent className='p-4 text-center'>
              <Typography variant='h3' className='text-primary-500 text-2xl font-bold'>
                {todaysChecklists.filter((c) => c.status === 'completed').length}
              </Typography>
              <Typography variant='caption' className='text-foreground-muted'>
                Completed Today
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4 text-center'>
              <Typography variant='h3' className='text-secondary-500 text-2xl font-bold'>
                {todaysChecklists.filter((c) => c.status === 'pending').length}
              </Typography>
              <Typography variant='caption' className='text-foreground-muted'>
                Pending
              </Typography>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={hideToast} />
    </AppLayout>
  )
}

