import React from 'react'

import { Icon, type IconName } from '../ui/Icon'
import { Typography } from '../ui/Typography'

interface HeaderProps {
  title: string
  subtitle?: string
  badge?: {
    text: string
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  }
  leftAction?: {
    icon: IconName
    onClick: () => void
    ariaLabel: string
  }
  rightAction?: {
    icon: IconName
    onClick: () => void
    ariaLabel: string
  }
  className?: string
}

const badgeVariants = {
  primary: 'bg-primary-500 text-foreground',
  secondary: 'bg-secondary-500 text-white',
  success: 'bg-utility-success text-white',
  warning: 'bg-utility-warning text-foreground',
  error: 'bg-utility-error text-white',
}

/**
 * Header component following PWA app shell pattern
 * Features sticky positioning and safe area handling
 */
const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  badge,
  leftAction,
  rightAction,
  className = '',
}) => {
  return (
    <header
      className={`bg-secondary-500 pt-safe-top sticky top-0 z-40 px-4 py-3 text-white ${className} `.trim()}
    >
      <div className='flex min-h-[44px] items-center justify-between'>
        <div className='flex flex-1 items-center gap-3'>
          {leftAction && (
            <button
              onClick={leftAction.onClick}
              aria-label={leftAction.ariaLabel}
              className='hover:bg-secondary-600 -ml-2 rounded-lg p-2 transition-all duration-150 focus:ring-2 focus:ring-white/20 focus:outline-none active:scale-95 motion-reduce:transform-none motion-reduce:transition-none'
            >
              <Icon name={leftAction.icon} size={24} />
            </button>
          )}

          <div className='min-w-0 flex-1'>
            <Typography variant='h1' element='h1' className='truncate font-semibold text-white'>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant='caption' className='truncate text-white/80'>
                {subtitle}
              </Typography>
            )}
          </div>
        </div>

        <div className='flex items-center gap-3'>
          {badge && (
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${badgeVariants[badge.variant ?? 'primary']} `}
            >
              {badge.text}
            </span>
          )}

          {rightAction && (
            <button
              onClick={rightAction.onClick}
              aria-label={rightAction.ariaLabel}
              className='hover:bg-secondary-600 -mr-2 rounded-lg p-2 transition-all duration-150 focus:ring-2 focus:ring-white/20 focus:outline-none active:scale-95 motion-reduce:transform-none motion-reduce:transition-none'
            >
              <Icon name={rightAction.icon} size={24} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
