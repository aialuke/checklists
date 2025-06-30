import React from 'react'

import { Button } from './Button'
import { Icon } from './Icon'
import { Typography } from './Typography'

interface InstallPromptProps {
  isVisible: boolean
  onInstall: () => void
  onDismiss: () => void
  className?: string
}

/**
 * InstallPrompt component for PWA installation
 * Features bottom sheet design and compelling call-to-action
 */
const InstallPrompt: React.FC<InstallPromptProps> = ({
  isVisible,
  onInstall,
  onDismiss,
  className = '',
}) => {
  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 z-40 bg-black/50 transition-opacity duration-300'
        onClick={onDismiss}
        aria-hidden='true'
      />

      {/* Install Prompt Bottom Sheet */}
      <div
        className={`bg-surface-base pb-safe-bottom fixed inset-x-0 bottom-0 z-50 transform rounded-t-xl p-6 shadow-2xl transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'} ${className} `.trim()}
        role='dialog'
        aria-modal='true'
        aria-labelledby='install-prompt-title'
        aria-describedby='install-prompt-description'
      >
        <div className='mx-auto max-w-sm text-center'>
          {/* App Icon */}
          <div className='bg-primary-500 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl'>
            <Icon name='check-circle' size={32} className='text-foreground' />
          </div>

          {/* Title */}
          <Typography variant='h2' element='h3' className='mb-2'>
            <span id='install-prompt-title'>Install Checklist App</span>
          </Typography>

          {/* Description */}
          <Typography variant='body' className='text-foreground-muted mb-6'>
            <span id='install-prompt-description'>
              Get quick access and work offline. Install our app for the best experience.
            </span>
          </Typography>

          {/* Features List */}
          <div className='mb-6 space-y-2 text-left'>
            <div className='flex items-center gap-2'>
              <Icon name='check-circle' size={16} className='text-utility-success flex-shrink-0' />
              <Typography variant='caption' className='text-foreground-muted'>
                Work offline without internet
              </Typography>
            </div>
            <div className='flex items-center gap-2'>
              <Icon name='check-circle' size={16} className='text-utility-success flex-shrink-0' />
              <Typography variant='caption' className='text-foreground-muted'>
                Quick access from home screen
              </Typography>
            </div>
            <div className='flex items-center gap-2'>
              <Icon name='check-circle' size={16} className='text-utility-success flex-shrink-0' />
              <Typography variant='caption' className='text-foreground-muted'>
                Instant updates and notifications
              </Typography>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='space-y-3'>
            <Button
              variant='primary'
              size='lg'
              onClick={onInstall}
              className='w-full'
              icon='check-circle'
            >
              Add to Home Screen
            </Button>

            <Button variant='ghost' size='md' onClick={onDismiss} className='w-full'>
              Maybe later
            </Button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          className='hover:bg-surface-card focus:ring-primary-200 absolute top-4 right-4 rounded-full p-2 transition-all duration-150 focus:ring-2 focus:outline-none active:scale-95 motion-reduce:transform-none motion-reduce:transition-none'
          aria-label='Close install prompt'
        >
          <Icon name='x' size={20} className='text-foreground-muted' />
        </button>
      </div>
    </>
  )
}

