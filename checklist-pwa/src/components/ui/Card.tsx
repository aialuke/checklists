import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'indicator'
  indicatorColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  className?: string
  children: React.ReactNode
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

const cardVariants = {
  default: `
    bg-surface-card rounded-xl p-4 shadow-sm
    hover:shadow-md transition-shadow duration-200
  `,
  interactive: `
    bg-surface-card rounded-xl p-4 shadow-sm
    hover:shadow-md active:scale-[0.98] 
    transition-all duration-200 cursor-pointer
    motion-reduce:transition-none motion-reduce:transform-none
  `,
  indicator: `
    bg-surface-card rounded-xl p-4 shadow-sm
    hover:shadow-md transition-shadow duration-200
    border-l-4
  `,
}

const indicatorColors = {
  primary: 'border-l-primary-500',
  secondary: 'border-l-secondary-500',
  success: 'border-l-utility-success',
  warning: 'border-l-utility-warning',
  error: 'border-l-utility-error',
}

/**
 * Card component following dopamine-driven design system
 * Provides consistent elevation and spacing for content containers
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  indicatorColor = 'primary',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = cardVariants[variant]
  const indicatorClass = variant === 'indicator' ? indicatorColors[indicatorColor] : ''

  return (
    <div className={`${baseClasses} ${indicatorClass} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

/**
 * Card Header component for titles and metadata
 */
export const CardHeader: React.FC<CardHeaderProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`mb-3 ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

/**
 * Card Content component for main content area
 */
export const CardContent: React.FC<CardContentProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

/**
 * Card Footer component for actions and metadata
 */
export const CardFooter: React.FC<CardFooterProps> = ({ className = '', children, ...props }) => {
  return (
    <div className={`mt-3 ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

