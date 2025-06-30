import React from 'react'

import { Card } from './Card'
import { Checkbox } from './Checkbox'
import { Icon, type IconName } from './Icon'
import { Typography } from './Typography'

interface TaskCardProps {
  id: string
  title: string
  description?: string
  completed: boolean
  dueTime?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  category?: string
  onToggle: (id: string, completed: boolean) => void
  onClick?: (id: string) => void
  actionIcon?: IconName
  onActionClick?: (id: string) => void
  disabled?: boolean
  className?: string
}

const priorityColors = {
  low: 'text-foreground-muted',
  medium: 'text-utility-warning',
  high: 'text-utility-error',
  critical: 'text-utility-error font-bold',
}

const priorityIcons: Record<'low' | 'medium' | 'high' | 'critical', IconName> = {
  low: 'clock',
  medium: 'alert-triangle',
  high: 'alert-triangle',
  critical: 'alert-triangle',
}

/**
 * TaskCard component for individual checklist tasks
 * Features dopamine-driven completion feedback and touch optimization
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  completed,
  dueTime,
  priority = 'medium',
  category,
  onToggle,
  onClick,
  actionIcon,
  onActionClick,
  disabled = false,
  className = '',
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on checkbox or action button
    const target = e.target as HTMLElement
    if (target.closest('[role="checkbox"]') || target.closest('[data-action-button]')) {
      return
    }

    if (onClick) {
      onClick(id)
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    onToggle(id, checked)
  }

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onActionClick) {
      onActionClick(id)
    }
  }

  return (
    <Card
      variant='interactive'
      className={` ${completed ? 'bg-surface-card/70' : 'bg-surface-card'} ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className} `.trim()}
      onClick={handleCardClick}
    >
      <div className='flex min-h-[56px] items-center gap-3 p-4'>
        {/* Checkbox */}
        <Checkbox
          checked={completed}
          onChange={handleCheckboxChange}
          variant='task'
          size='md'
          animate={true}
          disabled={disabled}
          aria-label={`Mark "${title}" as ${completed ? 'incomplete' : 'complete'}`}
        />

        {/* Content Area */}
        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0 flex-1'>
              <Typography
                variant='h3'
                element='h3'
                className={`truncate ${
                  completed ? 'text-foreground-muted line-through' : 'text-foreground'
                } transition-all duration-200`}
              >
                {title}
              </Typography>

              {description && (
                <Typography
                  variant='caption'
                  className={`mt-1 line-clamp-2 ${completed ? 'text-foreground-muted/70' : 'text-foreground-muted'} `}
                >
                  {description}
                </Typography>
              )}
            </div>

            {/* Priority and Action Icons */}
            <div className='flex flex-shrink-0 items-center gap-2'>
              {priority && priority !== 'low' && (
                <Icon
                  name={priorityIcons[priority]}
                  size={16}
                  className={priorityColors[priority]}
                />
              )}

              {actionIcon && (
                <button
                  onClick={handleActionClick}
                  data-action-button
                  className='hover:bg-surface-stroke focus:ring-primary-200 rounded-md p-1 transition-all duration-150 focus:ring-2 focus:outline-none active:scale-95 motion-reduce:transform-none motion-reduce:transition-none'
                  aria-label={`Action for ${title}`}
                >
                  <Icon name={actionIcon} size={16} className='text-foreground-muted' />
                </button>
              )}
            </div>
          </div>

          {/* Metadata row */}
          <div className='mt-2 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              {dueTime && (
                <div className='flex items-center gap-1'>
                  <Icon name='clock' size={12} className='text-foreground-muted' />
                  <Typography
                    variant='caption'
                    className={` ${completed ? 'text-foreground-muted/70' : 'text-foreground-muted'} `}
                  >
                    Due: {dueTime}
                  </Typography>
                </div>
              )}

              {category && (
                <span className='bg-secondary-500 flex-shrink-0 rounded-full px-2 py-1 text-xs text-white'>
                  {category}
                </span>
              )}
            </div>

            {/* Completion indicator */}
            {completed && (
              <div className='flex items-center gap-1'>
                <Icon name='check-circle' size={12} className='text-utility-success' />
                <Typography variant='caption' className='text-utility-success'>
                  Complete
                </Typography>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

