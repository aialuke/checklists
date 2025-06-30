import React, { useEffect, useState } from 'react'

import { Icon, type IconName } from './Icon'
import { Typography } from './Typography'

interface StatusIndicatorProps {
  type: 'offline' | 'syncing' | 'sync-success' | 'sync-error' | 'update-available'
  message?: string
  position?: 'top' | 'bottom'
  duration?: number // Auto-hide duration in ms (0 = no auto-hide)
  onDismiss?: () => void
  className?: string
}

const statusConfig = {
  offline: {
    icon: 'x' as IconName,
    bgColor: 'bg-primary-500',
    textColor: 'text-foreground',
    defaultMessage: 'Working offline',
    position: 'bottom',
    persistent: true,
  },
  syncing: {
    icon: 'loader-2' as IconName,
    bgColor: 'bg-primary-500',
    textColor: 'text-foreground',
    defaultMessage: 'Syncing...',
    position: 'bottom',
    persistent: true,
    animate: true,
  },
  'sync-success': {
    icon: 'check-circle' as IconName,
    bgColor: 'bg-utility-success',
    textColor: 'text-white',
    defaultMessage: 'Synced successfully',
    position: 'top',
    persistent: false,
  },
  'sync-error': {
    icon: 'alert-triangle' as IconName,
    bgColor: 'bg-utility-error',
    textColor: 'text-white',
    defaultMessage: 'Sync failed',
    position: 'top',
    persistent: false,
  },
  'update-available': {
    icon: 'bell' as IconName,
    bgColor: 'bg-secondary-500',
    textColor: 'text-white',
    defaultMessage: 'Update available',
    position: 'top',
    persistent: false,
  },
}

/**
 * StatusIndicator component for PWA status notifications
 * Features offline indicators, sync status, and system notifications
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  type,
  message,
  position: positionProp,
  duration = 0,
  onDismiss,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const config = statusConfig[type]
  const position = positionProp ?? config.position
  const displayMessage = message ?? config.defaultMessage

  useEffect(() => {
    if (duration > 0 && !config.persistent) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          if (onDismiss) onDismiss()
        }, 300) // Wait for exit animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, config.persistent, onDismiss])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      if (onDismiss) onDismiss()
    }, 300)
  }

  const positionClasses: Record<'top' | 'bottom', string> = {
    top: 'fixed top-4 right-4',
    bottom: 'fixed bottom-20 left-1/2 transform -translate-x-1/2',
  }

  if (!isVisible) return null

  return (
    <div
      className={` ${positionClasses[position as keyof typeof positionClasses]} ${config.bgColor} ${config.textColor} z-50 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${className} `.trim()}
      role='status'
      aria-live='polite'
    >
      <div className='flex items-center gap-2'>
        {/* Status Icon */}
        <Icon
          name={config.icon}
          size={16}
          className={`flex-shrink-0 ${'animate' in config && config.animate ? 'animate-spin' : ''} ${type === 'offline' ? 'animate-pulse' : ''} `}
        />

        {/* Status Message */}
        <Typography variant='caption' className={config.textColor}>
          {displayMessage}
        </Typography>

        {/* Dismiss Button (for non-persistent indicators) */}
        {!config.persistent && onDismiss && (
          <button
            onClick={handleDismiss}
            className={`ml-2 rounded-full p-1 transition-all duration-150 hover:bg-black/10 focus:ring-2 focus:ring-white/20 focus:outline-none active:scale-95 motion-reduce:transform-none motion-reduce:transition-none`}
            aria-label='Dismiss notification'
          >
            <Icon name='x' size={12} className={config.textColor} />
          </button>
        )}

        {/* Pulsing dot for offline indicator */}
        {type === 'offline' && (
          <div className='bg-foreground h-2 w-2 flex-shrink-0 animate-pulse rounded-full' />
        )}
      </div>
    </div>
  )
}

