import React from 'react'

import { useParams, Navigate } from 'react-router'

import { AppLayout } from '../../components/layout'
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Typography,
  TaskCard,
  StatusIndicator,
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
  ChecklistInstance,
  Task,
  ToastNotification,
  OfflineAction
} from '../../types'

/**
 * ChecklistPage - Individual checklist view with tasks
 * Connected to ChecklistStore via container pattern
 */
export const ChecklistPage: React.FC = () => {
  const { checklistId } = useParams<{ checklistId: string }>()

  if (!checklistId) {
    return <Navigate to='/dashboard' replace />
  }

  return (
    <AuthContainer>
      {(authState) => (
        <ChecklistContainer>
          {(checklistState) => (
            <NotificationContainer>
              {(notificationState) => (
                <OfflineStatusContainer>
                  {(offlineState) => (
                    <ChecklistPagePresentation
                      checklistId={checklistId}
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

interface ChecklistPagePresentationProps {
  checklistId: string

  // Auth state
  user: User | null
  selectedDepartment: Department | null

  // Checklist state
  activeChecklist: ChecklistInstance | null
  tasks: Task[]
  progress: number
  isLoading: boolean
  error: string | null
  selectChecklist: (checklistId: string) => void
  completeTask: (taskId: string, notes?: string) => Promise<void>
  undoTaskCompletion: (taskId: string) => Promise<void>
  submitChecklist: (checklistId: string) => Promise<void>

  // Notification state
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

const ChecklistPagePresentation: React.FC<ChecklistPagePresentationProps> = ({
  checklistId,
  // user,
  selectedDepartment,
  activeChecklist,
  tasks,
  progress,
  isLoading,
  error,
  selectChecklist,
  completeTask,
  undoTaskCompletion,
  // submitChecklist,
  toasts,
  showToast,
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
  // Load checklist if not active
  React.useEffect(() => {
    if (!activeChecklist || activeChecklist.id !== checklistId) {
      selectChecklist(checklistId)
    }
  }, [checklistId, activeChecklist, selectChecklist])

  if (!activeChecklist && !isLoading) {
    return <Navigate to='/dashboard' replace />
  }

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      if (completed) {
        await completeTask(taskId)
        const task = tasks.find((t) => t.id === taskId)
        showToast({
          type: 'success',
          title: 'Task Completed',
          message: `"${task?.title}" marked as complete`,
          duration: 3000,
        })
      } else {
        await undoTaskCompletion(taskId)
        const task = tasks.find((t) => t.id === taskId)
        showToast({
          type: 'info',
          title: 'Task Undone',
          message: `"${task?.title}" marked as incomplete`,
          duration: 3000,
        })
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: `Failed to update task: ${error instanceof Error ? error.message : 'Please try again.'}`,
        duration: 5000,
      })
    }
  }

  const handleCompleteChecklist = () => {
    if (activeChecklist) {
      // TODO: implement checklist submission
      // submitChecklist(activeChecklist.id).catch(console.error)
    }
  }

  const canCompleteChecklist = progress === 100
  const isChecklistCompleted = activeChecklist?.status === 'completed'

  const navigationItems = [
    { id: 'home', label: 'Home', icon: 'home' as const },
    { id: 'tasks', label: 'Tasks', icon: 'check-circle' as const },
    { id: 'history', label: 'History', icon: 'clock' as const },
    { id: 'settings', label: 'Settings', icon: 'settings' as const },
  ]

  return (
    <AppLayout
      headerTitle={activeChecklist?.template?.name || 'Checklist'}
      headerLeftAction={{
        icon: 'arrow-left',
        onClick: () => window.history.back(),
        ariaLabel: 'Go back',
      }}
      navigationItems={navigationItems}
      activeNavigationId='tasks'
      onNavigationItemClick={() => { console.log('Navigation feature pending') }}
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
        {/* Loading State */}
        {isLoading && !activeChecklist && (
          <div className='space-y-3'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='bg-surface-card h-16 animate-pulse rounded-xl' />
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && <StatusIndicator type='sync-error' message={error} onDismiss={() => { console.log('Error dismiss feature pending') }} />}

        {/* Checklist Header */}
        {activeChecklist && (
          <>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <Typography variant='h2' className='text-foreground'>
                      {activeChecklist.template?.name}
                    </Typography>
                    <Typography variant='caption' className='text-foreground-muted'>
                      {selectedDepartment?.name} • Due: {activeChecklist.template?.deadline_time}
                    </Typography>
                  </div>
                  <div className='text-right'>
                    <Typography variant='h3' className='text-primary-500'>
                      {progress}%
                    </Typography>
                    <Typography variant='caption' className='text-foreground-muted'>
                      Tasks complete
                    </Typography>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Progress Bar */}
                <div className='bg-surface-stroke mb-4 h-2 w-full rounded-full'>
                  <div
                    className='bg-primary-500 h-2 rounded-full transition-all duration-300'
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Complete Checklist Button */}
                {canCompleteChecklist && !isChecklistCompleted && (
                  <Button
                    variant='primary'
                    size='lg'
                    className='w-full'
                    onClick={handleCompleteChecklist}
                    loading={isLoading}
                  >
                    Complete Checklist
                  </Button>
                )}

                {isChecklistCompleted && (
                  <div className='bg-utility-success/10 rounded-lg p-4 text-center'>
                    <Typography variant='body' className='text-utility-success'>
                      ✓ Checklist completed successfully!
                    </Typography>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tasks List */}
            <div>
              <Typography variant='h2' className='mb-4'>
                Tasks
              </Typography>

              <div className='space-y-3'>
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    completed={task.completed}
                    dueTime={activeChecklist.template?.deadline_time}
                    priority={task.required ? 'high' : 'medium'}
                    category={selectedDepartment?.name || ''}
                    onToggle={(id, completed) => { handleTaskComplete(id, completed).catch(console.error) }}
                    disabled={isChecklistCompleted}
                  />
                ))}
              </div>

              {tasks.length === 0 && !isLoading && (
                <Card>
                  <CardContent className='p-8 text-center'>
                    <Typography variant='body' className='text-foreground-muted'>
                      No tasks available for this checklist
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={hideToast} />
    </AppLayout>
  )
}

