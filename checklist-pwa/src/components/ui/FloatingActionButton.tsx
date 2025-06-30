import React from 'react'

import { Icon, type IconName } from './Icon'

interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
  loading?: boolean
  className?: string
  children?: React.ReactNode
}

const positionClasses = {
  'bottom-right': 'fixed bottom-6 right-4',
  'bottom-left': 'fixed bottom-6 left-4',
  'bottom-center': 'fixed bottom-6 left-1/2 transform -translate-x-1/2',
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-14 h-14',
  lg: 'w-16 h-16',
}

const iconSizes = {
  sm: 20,
  md: 24,
  lg: 28,
}

const variantClasses = {
  primary: `
    bg-primary-500 text-foreground 
    hover:bg-primary-600 
    focus:bg-primary-600 focus:ring-primary-200
    disabled:bg-primary-300
  `,
  secondary: `
    bg-secondary-500 text-white 
    hover:bg-secondary-600 
    focus:bg-secondary-600 focus:ring-secondary-200
    disabled:bg-secondary-300
  `,
}

/**
 * FloatingActionButton component for primary actions
 * Features satisfying interactions and PWA-optimized positioning
 */
const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  position = 'bottom-right',
  size = 'md',
  variant = 'primary',
  loading = false,
  className = '',
  children,
  disabled,
  onClick,
  ...props
}) => {
  const isDisabled = disabled || loading

  const baseClasses = `
    flex items-center justify-center
    rounded-full shadow-lg
    transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-offset-2
    active:scale-95 focus:scale-105
    motion-reduce:transition-none motion-reduce:transform-none
    z-50
  `

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return

    // Add satisfying click feedback
    const button = e.currentTarget
    button.style.transform = 'scale(0.95)'
    setTimeout(() => {
      button.style.transform = ''
    }, 100)

    if (onClick) {
      onClick(e)
    }
  }

  return (
    <button
      className={` ${baseClasses} ${positionClasses[position]} ${sizeClasses[size]} ${variantClasses[variant]} ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className} `.trim()}
      disabled={isDisabled}
      onClick={handleClick}
      aria-label={children && typeof children === 'string' ? children : `${icon} action`}
      {...props}
    >
      {loading ? (
        <Icon name='loader-2' size={iconSizes[size]} className='animate-spin' />
      ) : (
        <Icon name={icon} size={iconSizes[size]} />
      )}

      {/* Hidden text for screen readers */}
      {children && <span className='sr-only'>{children}</span>}
    </button>
  )
}

