import React from 'react'

import { Icon, type IconName } from './Icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: IconName
  iconPosition?: 'left' | 'right'
  loading?: boolean
  className?: string
  children?: React.ReactNode
}

const buttonVariants = {
  primary: `
    bg-primary-500 text-foreground 
    hover:bg-primary-600 
    focus:bg-primary-600 focus:ring-2 focus:ring-primary-200
    disabled:bg-primary-300 disabled:cursor-not-allowed
  `,
  secondary: `
    bg-secondary-500 text-white 
    hover:bg-secondary-600 
    focus:bg-secondary-600 focus:ring-2 focus:ring-secondary-200
    disabled:bg-secondary-300 disabled:cursor-not-allowed
  `,
  outline: `
    border-2 border-secondary-500 text-secondary-500 bg-transparent
    hover:bg-secondary-50 
    focus:bg-secondary-50 focus:ring-2 focus:ring-secondary-200
    disabled:border-secondary-300 disabled:text-secondary-300 disabled:cursor-not-allowed
  `,
  ghost: `
    text-foreground bg-transparent
    hover:bg-surface-card
    focus:bg-surface-card focus:ring-2 focus:ring-primary-200
    disabled:text-foreground-muted disabled:cursor-not-allowed
  `,
}

const buttonSizes = {
  sm: 'px-4 py-2 text-sm min-h-[40px]',
  md: 'px-6 py-3 text-base min-h-touch', // 48px minimum touch target
  lg: 'px-8 py-4 text-lg min-h-[56px]',
}

/**
 * Button component following dopamine-driven design system
 * Features touch-optimized sizes, satisfying interactions, and accessibility
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading

  const baseClasses = `
    inline-flex items-center justify-center gap-2 
    rounded-lg font-medium 
    transition-all duration-150
    focus:outline-none focus:ring-offset-2
    active:scale-95 focus:scale-105
    motion-reduce:transition-none motion-reduce:transform-none
  `

  const variantClasses = buttonVariants[variant]
  const sizeClasses = buttonSizes[size]

  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim()}
      disabled={isDisabled}
      {...props}
    >
      {loading && <Icon name='loader-2' size={iconSize} className='animate-spin' />}

      {!loading && icon && iconPosition === 'left' && <Icon name={icon} size={iconSize} />}

      {children}

      {!loading && icon && iconPosition === 'right' && <Icon name={icon} size={iconSize} />}
    </button>
  )
}

