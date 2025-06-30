import React from 'react'

import { Icon, type IconName } from './Icon'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: IconName
  rightIcon?: IconName
  onRightIconClick?: () => void
  className?: string
}

/**
 * Input component following dopamine-driven design system
 * Features enhanced touch targets and clear visual feedback
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconClick,
  className = '',
  id,
  ...props
}) => {
  const inputId = id ?? `input-${Math.random().toString(36).substr(2, 9)}`

  const baseInputClasses = `
    w-full h-12 px-3 
    border rounded-lg
    text-foreground text-sm md:text-base
    placeholder:text-foreground-muted
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:bg-surface-stroke disabled:cursor-not-allowed
  `

  const errorClasses = error
    ? 'border-utility-error focus:border-utility-error focus:ring-utility-error/20'
    : 'border-surface-stroke focus:border-primary-500 focus:ring-primary-200'

  const leftPadding = leftIcon ? 'pl-10' : 'pl-3'
  const rightPadding = rightIcon ? 'pr-10' : 'pr-3'

  return (
    <div className={`w-full ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className='text-foreground mb-2 block text-sm font-medium'>
          {label}
        </label>
      )}

      <div className='relative'>
        {leftIcon && (
          <div className='absolute top-1/2 left-3 -translate-y-1/2 transform'>
            <Icon name={leftIcon} size={20} className='text-foreground-muted' />
          </div>
        )}

        <input
          id={inputId}
          className={`${baseInputClasses} ${errorClasses} ${leftPadding} ${rightPadding}`.trim()}
          {...props}
        />

        {rightIcon && (
          <button
            type='button'
            onClick={onRightIconClick}
            className={`absolute top-1/2 right-3 -translate-y-1/2 transform ${onRightIconClick ? 'hover:text-foreground cursor-pointer' : 'cursor-default'} transition-colors duration-200`}
            disabled={!onRightIconClick}
          >
            <Icon name={rightIcon} size={20} className='text-foreground-muted' />
          </button>
        )}
      </div>

      {error && (
        <p className='text-utility-error mt-1 flex items-center gap-1 text-xs'>
          <Icon name='alert-triangle' size={12} />
          {error}
        </p>
      )}

      {helperText && !error && <p className='text-foreground-muted mt-1 text-xs'>{helperText}</p>}
    </div>
  )
}

