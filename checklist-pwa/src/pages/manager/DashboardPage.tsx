import React from 'react'

import { AppLayout } from '../../components/layout'
import { Button, Card, CardContent, Typography, Icon } from '../../components/ui'
import { AuthContainer, ChecklistContainer, NotificationContainer } from '../../containers'

import type {
  User,
  Department,
  Role,
  ChecklistInstance,
  Notification
} from '../../types'

/**
 * Manager DashboardPage - Manager overview interface
 * Shows department progress and team management
 */
export const ManagerDashboardPage: React.FC = () => {
  return (
    <AuthContainer>
      {(authState) => (
        <ChecklistContainer>
          {(checklistState) => (
            <NotificationContainer>
              {(notificationState) => (
                <ManagerDashboardPresentation
                  {...authState}
                  {...checklistState}
                  {...notificationState}
                />
              )}
            </NotificationContainer>
          )}
        </ChecklistContainer>
      )}
    </AuthContainer>
  )
}

interface ManagerDashboardPresentationProps {
  // Auth state
  user: User | null
  selectedDepartment: Department | null
  activeRole: Role | null
  logout: () => Promise<void>

  // Checklist state
  checklists: ChecklistInstance[]
  isLoading: boolean
  loadChecklists: () => Promise<void>

  // Notification state
  unreadNotifications: Notification[]
  notificationCount: number
  markAllAsRead: () => void
}

const ManagerDashboardPresentation: React.FC<ManagerDashboardPresentationProps> = ({
  user,
  selectedDepartment,
  logout,
  checklists,
  isLoading,
  loadChecklists,
  unreadNotifications,
  // notificationCount,
  // markAllAsRead,
}) => {
  const handleLogout = async () => {
    await logout()
  }

  const handleRefresh = () => {
    loadChecklists().catch(console.error)
  }

  // Calculate department stats
  const todaysChecklists = checklists.filter(
    (checklist) =>
      checklist.department_id === selectedDepartment?.id &&
      new Date(checklist.assigned_date).toDateString() === new Date().toDateString(),
  )

  const completedToday = todaysChecklists.filter((c) => c.status === 'completed').length
  const pendingToday = todaysChecklists.filter((c) => c.status === 'pending').length
  const overdue = todaysChecklists.filter((c) => c.status === 'overdue').length
  const completionRate =
    todaysChecklists.length > 0 ? Math.round((completedToday / todaysChecklists.length) * 100) : 0

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bar-chart' as const },
    { id: 'team', label: 'Team', icon: 'users' as const },
    { id: 'reports', label: 'Reports', icon: 'clipboard-list' as const },
    { id: 'settings', label: 'Settings', icon: 'settings' as const },
  ]

  return (
    <AppLayout
      headerTitle={`${selectedDepartment?.name} Manager`}
      headerRightAction={{
        icon: 'log-out',
        onClick: () => { handleLogout().catch(console.error) },
        ariaLabel: 'Logout',
      }}
      navigationItems={navigationItems}
      activeNavigationId='dashboard'
      onNavigationItemClick={() => { console.log('Manager navigation feature pending') }}
    >
      <div className='flex-1 space-y-6 p-4'>
        {/* Manager Welcome */}
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <Typography variant='h2' className='text-foreground'>
                  Manager Dashboard
                </Typography>
                <Typography variant='caption' className='text-foreground-muted'>
                  {user?.full_name} • {selectedDepartment?.name}
                </Typography>
              </div>
              <Button variant='outline' size='sm' onClick={handleRefresh} loading={isLoading}>
                <Icon name='refresh-cw' className='mr-2 h-4 w-4' />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div>
          <Typography variant='h2' className='mb-4'>
            Today&apos;s Performance
          </Typography>

          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <Card>
              <CardContent className='p-4 text-center'>
                <Typography variant='h3' className='text-primary-500 text-2xl font-bold'>
                  {completionRate}%
                </Typography>
                <Typography variant='caption' className='text-foreground-muted'>
                  Completion Rate
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4 text-center'>
                <Typography variant='h3' className='text-utility-success text-2xl font-bold'>
                  {completedToday}
                </Typography>
                <Typography variant='caption' className='text-foreground-muted'>
                  Completed
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4 text-center'>
                <Typography variant='h3' className='text-utility-warning text-2xl font-bold'>
                  {pendingToday}
                </Typography>
                <Typography variant='caption' className='text-foreground-muted'>
                  Pending
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4 text-center'>
                <Typography variant='h3' className='text-utility-error text-2xl font-bold'>
                  {overdue}
                </Typography>
                <Typography variant='caption' className='text-foreground-muted'>
                  Overdue
                </Typography>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Notifications */}
        {unreadNotifications.length > 0 && (
          <div>
            <Typography variant='h2' className='mb-4'>
              Recent Alerts
            </Typography>

            <div className='space-y-3'>
              {unreadNotifications.slice(0, 5).map((notification) => (
                <Card key={notification.id}>
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <Typography variant='body' className='font-medium'>
                          {notification.title}
                        </Typography>
                        <Typography variant='caption' className='text-foreground-muted'>
                          {notification.message}
                        </Typography>
                      </div>
                      <Typography
                        variant='caption'
                        className='text-foreground-muted whitespace-nowrap'
                      >
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <Typography variant='h2' className='mb-4'>
            Quick Actions
          </Typography>

          <div className='grid grid-cols-2 gap-4'>
            <Button variant='outline' size='lg' icon='users' className='h-20 flex-col'>
              <span>Team Status</span>
            </Button>

            <Button variant='outline' size='lg' icon='bar-chart' className='h-20 flex-col'>
              <span>Generate Report</span>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

