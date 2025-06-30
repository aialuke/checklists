import React from 'react'

import { AppLayout } from '../../components/layout'
import { Button, Card, CardContent, Typography } from '../../components/ui'
import { AuthContainer } from '../../containers'

import type {
  User,
  Role,
  Department
} from '../../types'

/**
 * Admin DashboardPage - System administration interface
 * Shows system-wide stats and management tools
 */
export const AdminDashboardPage: React.FC = () => {
  return (
    <AuthContainer>{(authState) => <AdminDashboardPresentation {...authState} />}</AuthContainer>
  )
}

interface AdminDashboardPresentationProps {
  // Auth state
  user: User | null
  activeRole: Role | null
  availableDepartments: Department[]
  logout: () => Promise<void>
}

const AdminDashboardPresentation: React.FC<AdminDashboardPresentationProps> = ({
  user,
  availableDepartments,
  logout,
}) => {
  const handleLogout = async () => {
    await logout()
  }

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bar-chart' as const },
    { id: 'departments', label: 'Departments', icon: 'users' as const },
    { id: 'templates', label: 'Templates', icon: 'clipboard-list' as const },
    { id: 'reports', label: 'Reports', icon: 'bar-chart' as const },
    { id: 'settings', label: 'Settings', icon: 'settings' as const },
  ]

  return (
    <AppLayout
      headerTitle='System Administration'
      headerRightAction={{
        icon: 'log-out',
        onClick: () => { handleLogout().catch(console.error) },
        ariaLabel: 'Logout',
      }}
      navigationItems={navigationItems}
      activeNavigationId='dashboard'
      onNavigationItemClick={() => { console.log('Navigation feature pending') }}
    >
      <div className='flex-1 space-y-6 p-4'>
        {/* Admin Welcome */}
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <Typography variant='h2' className='text-foreground'>
                  Admin Dashboard
                </Typography>
                <Typography variant='caption' className='text-foreground-muted'>
                  {user?.full_name} • System Administrator
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Overview */}
        <div>
          <Typography variant='h2' className='mb-4'>
            System Overview
          </Typography>

          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <Card>
              <CardContent className='p-4 text-center'>
                <Typography variant='h3' className='text-primary-500 text-2xl font-bold'>
                  {availableDepartments.length}
                </Typography>
                <Typography variant='caption' className='text-foreground-muted'>
                  Departments
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4 text-center'>
                <Typography variant='h3' className='text-utility-success text-2xl font-bold'>
                  24
                </Typography>
                <Typography variant='caption' className='text-foreground-muted'>
                  Active Users
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4 text-center'>
                <Typography variant='h3' className='text-utility-warning text-2xl font-bold'>
                  15
                </Typography>
                <Typography variant='caption' className='text-foreground-muted'>
                  Templates
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4 text-center'>
                <Typography variant='h3' className='text-secondary-500 text-2xl font-bold'>
                  98%
                </Typography>
                <Typography variant='caption' className='text-foreground-muted'>
                  System Health
                </Typography>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Department Status */}
        <div>
          <Typography variant='h2' className='mb-4'>
            Department Status
          </Typography>

          <div className='space-y-3'>
            {availableDepartments.map((department) => (
              <Card key={department.id}>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Typography variant='body' className='font-medium'>
                        {department.name}
                      </Typography>
                      <Typography variant='caption' className='text-foreground-muted'>
                        Code: {department.code}
                      </Typography>
                    </div>
                    <div className='text-right'>
                      <Typography variant='body' className='text-utility-success'>
                        Active
                      </Typography>
                      <Typography variant='caption' className='text-foreground-muted'>
                        5 users online
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <Typography variant='h2' className='mb-4'>
            Administrative Actions
          </Typography>

          <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
            <Button variant='outline' size='lg' icon='users' className='h-20 flex-col'>
              <span>User Management</span>
            </Button>

            <Button variant='outline' size='lg' icon='clipboard-list' className='h-20 flex-col'>
              <span>Template Editor</span>
            </Button>

            <Button variant='outline' size='lg' icon='bar-chart' className='h-20 flex-col'>
              <span>System Reports</span>
            </Button>

            <Button variant='outline' size='lg' icon='settings' className='h-20 flex-col'>
              <span>System Settings</span>
            </Button>

            <Button variant='outline' size='lg' icon='alert-triangle' className='h-20 flex-col'>
              <span>Audit Logs</span>
            </Button>

            <Button variant='outline' size='lg' icon='bell' className='h-20 flex-col'>
              <span>Notifications</span>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

