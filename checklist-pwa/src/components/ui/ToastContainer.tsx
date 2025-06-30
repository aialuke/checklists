import React from 'react'

import { Icon } from './Icon'
import { Typography } from './Typography'

import type { ToastNotification } from '../../types'

interface ToastContainerProps {
  toasts: ToastNotification[]
  onDismiss: (toastId: string) => void
}

const toastConfig = {
  success: {
    icon: 'check-circle' as const,
    bgColor: 'bg-utility-success',
    textColor: 'text-white',
  },
  error: {
    icon: 'alert-triangle' as const,
    bgColor: 'bg-utility-error',
    textColor: 'text-white',
  },
  warning: {
    icon: 'alert-triangle' as const,
    bgColor: 'bg-utility-warning',
    textColor: 'text-white',
  },
  info: {
    icon: 'bell' as const,
    bgColor: 'bg-primary-500',
    textColor: 'text-foreground',
  },
}

/**
 * ToastContainer - Displays toast notifications with auto-hide
 * Positioned fixed at top-right for mobile-first design
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null

  return (
    <div className='fixed top-4 right-4 z-50 max-w-sm space-y-2'>
      {toasts.map((toast) => {
        const toastType = toast.type ?? 'info'
        const config = toastConfig[toastType]

        return (
          <div
            key={toast.id}
            className={` ${config.bgColor} ${config.textColor} scale-100 transform rounded-lg p-4 opacity-100 shadow-lg transition-all duration-300 ease-in-out motion-reduce:transition-none`}
            role='alert'
            aria-live='polite'
          >
            <div className='flex items-start gap-3'>
              {/* Toast Icon */}
              <Icon
                name={config.icon}
                size={20}
                className={`mt-0.5 flex-shrink-0 ${config.textColor}`}
              />

              {/* Toast Content */}
              <div className='min-w-0 flex-1'>
                <Typography variant='caption' className={`font-medium ${config.textColor}`}>
                  {toast.title ?? 'Notification'}
                </Typography>
                {toast.message && (
                  <Typography variant='caption' className={`${config.textColor} mt-1 opacity-90`}>
                    {toast.message}
                  </Typography>
                )}
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => onDismiss(toast.id)}
                className={`ml-2 rounded-full p-1 transition-all duration-150 hover:bg-black/10 focus:ring-2 focus:ring-white/20 focus:outline-none active:scale-95 motion-reduce:transform-none motion-reduce:transition-none`}
                aria-label='Dismiss notification'
              >
                <Icon name='x' size={16} className={config.textColor} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

