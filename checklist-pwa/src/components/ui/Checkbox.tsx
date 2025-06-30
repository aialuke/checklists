import React, { useState, useEffect } from 'react'

import { Icon } from './Icon'

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  label?: string
  description?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  variant?: 'default' | 'task'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animate?: boolean
}

const checkboxSizes = {
  sm: {
    container: 'min-h-[40px]',
    checkbox: 'w-5 h-5',
    icon: 16,
    text: 'text-sm',
    description: 'text-xs',
  },
  md: {
    container: 'min-h-touch', // 48px
    checkbox: 'w-6 h-6',
    icon: 18,
    text: 'text-sm md:text-base',
    description: 'text-xs md:text-sm',
  },
  lg: {
    container: 'min-h-[56px]',
    checkbox: 'w-8 h-8',
    icon: 24,
    text: 'text-base md:text-lg',
    description: 'text-sm md:text-base',
  },
}

/**
 * Enhanced Checkbox component with dopamine-driven animations
 * Features satisfying completion feedback and accessibility compliance
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  checked = false,
  onChange,
  variant = 'default',
  size = 'md',
  className = '',
  animate = true,
  disabled,
  id,
  ...props
}) => {
  const [isChecked, setIsChecked] = useState(checked)
  const [showCompleteAnimation, setShowCompleteAnimation] = useState(false)

  const sizeConfig = checkboxSizes[size]
  const checkboxId = id ?? `checkbox-${Math.random().toString(36).substr(2, 9)}`

  useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  const handleChange = () => {
    if (disabled) return

    const newChecked = !isChecked
    setIsChecked(newChecked)

    // Trigger completion animation for task variant
    if (variant === 'task' && newChecked && animate) {
      setShowCompleteAnimation(true)
      setTimeout(() => setShowCompleteAnimation(false), 600)
    }

    if (onChange) {
      onChange(newChecked)
    }
  }

  const baseCheckboxClasses = `
    relative flex-shrink-0 border-2 rounded cursor-pointer
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-1
    active:scale-95 
    motion-reduce:transition-none motion-reduce:transform-none
  `

  const checkboxStateClasses = isChecked
    ? 'bg-primary-500 border-primary-500 text-foreground'
    : 'bg-transparent border-surface-stroke hover:border-primary-300'

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-300'

  const completionClasses =
    showCompleteAnimation && variant === 'task' ? 'animate-bounce-subtle shadow-lg' : ''

  return (
    <label
      className={`flex cursor-pointer items-start gap-3 ${sizeConfig.container} ${className} ${disabled ? 'cursor-not-allowed' : ''} `.trim()}
      htmlFor={checkboxId}
    >
      {/* Hidden native checkbox for accessibility */}
      <input
        type='checkbox'
        id={checkboxId}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className='sr-only'
        {...props}
      />

      {/* Custom checkbox visual */}
      <div
        className={` ${baseCheckboxClasses} ${sizeConfig.checkbox} ${checkboxStateClasses} ${disabledClasses} ${completionClasses} `.trim()}
        role='checkbox'
        aria-checked={isChecked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            handleChange()
          }
        }}
      >
        {/* Checkmark icon */}
        {isChecked && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <Icon
              name='check-square'
              size={sizeConfig.icon}
              className={`text-foreground ${animate ? 'animate-in fade-in duration-150' : ''} `}
            />
          </div>
        )}

        {/* Completion burst effect for task variant */}
        {showCompleteAnimation && variant === 'task' && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='bg-primary-500 h-full w-full animate-ping rounded opacity-75' />
          </div>
        )}
      </div>

      {/* Label and description */}
      {(label || description) && (
        <div className='flex min-w-0 flex-1 flex-col justify-center'>
          {label && (
            <span
              className={`text-foreground font-medium ${sizeConfig.text} ${isChecked && variant === 'task' ? 'text-foreground-muted line-through' : ''} transition-all duration-200`.trim()}
            >
              {label}
            </span>
          )}
          {description && (
            <span className={`text-foreground-muted mt-1 ${sizeConfig.description} `.trim()}>
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  )
}

