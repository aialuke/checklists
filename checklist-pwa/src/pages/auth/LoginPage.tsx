import React, { useState } from 'react'

import { Navigate } from 'react-router'

import { AppLayout } from '../../components/layout'
import { Button, Card, CardHeader, CardContent, Input, Typography } from '../../components/ui'
import { AuthContainer } from '../../containers'

/**
 * LoginPage - Authentication page connected to AuthStore
 * Uses Container/Presentational pattern for clean separation
 */
export const LoginPage: React.FC = () => {
  return <AuthContainer>{(authState) => <LoginPagePresentation {...authState} />}</AuthContainer>
}

interface LoginPagePresentationProps {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (staffNumber: string) => Promise<void>
  clearError: () => void
}

const LoginPagePresentation: React.FC<LoginPagePresentationProps> = ({
  isAuthenticated,
  isLoading,
  error,
  login,
  clearError,
}) => {
  const [staffNumber, setStaffNumber] = useState('')

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!staffNumber.trim()) return

    try {
      await login(staffNumber.trim())
    } catch {
      // Error is handled by the store
    }
  }

  const handleStaffNumberChange = (value: string) => {
    setStaffNumber(value)
    if (error) {
      clearError()
    }
  }

  return (
    <AppLayout
      headerTitle='Login'
      showBottomNavigation={false}
      navigationItems={[]}
      activeNavigationId=''
      onNavigationItemClick={() => { console.log('Navigation not available on login') }}
    >
      <div className='bg-surface-base flex min-h-screen items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          <Card className='shadow-lg'>
            <CardHeader>
              <div className='text-center'>
                <Typography variant='h1' className='text-secondary-500 mb-2'>
                  Checklist PWA
                </Typography>
                <Typography variant='body' className='text-foreground-muted'>
                  Enter your staff number to continue
                </Typography>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={(e) => { handleSubmit(e).catch(console.error) }} className='space-y-4'>
                <Input
                  type='text'
                  placeholder='Staff Number'
                  value={staffNumber}
                  onChange={(e) => handleStaffNumberChange(e.target.value)}
                  error={error || undefined}
                  disabled={isLoading}
                  autoFocus
                  required
                />

                {error && (
                  <div className='bg-utility-error/10 border-utility-error/20 rounded-lg border p-3'>
                    <Typography variant='caption' className='text-utility-error'>
                      {error}
                    </Typography>
                  </div>
                )}

                <Button
                  type='submit'
                  variant='primary'
                  size='lg'
                  className='w-full'
                  loading={isLoading}
                  disabled={!staffNumber.trim() || isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className='border-surface-stroke mt-6 border-t pt-4'>
                <Typography variant='caption' className='text-foreground-muted block text-center'>
                  Need help? Contact your manager
                </Typography>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

