import React from 'react'

import { Button } from './Button'
import { Card, CardHeader, CardContent, CardFooter } from './Card'
import { Icon, type IconName } from './Icon'
import { Typography } from './Typography'

interface ChecklistCardProps {
  id: string
  title: string
  description?: string
  department: string
  totalTasks: number
  completedTasks: number
  dueTime?: string
  lastUpdated?: string
  type: 'opening' | 'closing' | 'maintenance' | 'audit'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue'
  onClick?: (id: string) => void
  onStart?: (id: string) => void
  onComplete?: (id: string) => void
  disabled?: boolean
  className?: string
}

const typeConfig = {
  opening: {
    color: 'primary',
    icon: 'check-circle' as IconName,
    label: 'Opening',
  },
  closing: {
    color: 'secondary',
    icon: 'x' as IconName,
    label: 'Closing',
  },
  maintenance: {
    color: 'warning',
    icon: 'settings' as IconName,
    label: 'Maintenance',
  },
  audit: {
    color: 'error',
    icon: 'clipboard-list' as IconName,
    label: 'Audit',
  },
}

const statusConfig = {
  not_started: {
    color: 'text-foreground-muted',
    bgColor: 'bg-surface-stroke',
    label: 'Not Started',
  },
  in_progress: {
    color: 'text-primary-500',
    bgColor: 'bg-primary-500',
    label: 'In Progress',
  },
  completed: {
    color: 'text-utility-success',
    bgColor: 'bg-utility-success',
    label: 'Completed',
  },
  overdue: {
    color: 'text-utility-error',
    bgColor: 'bg-utility-error',
    label: 'Overdue',
  },
}

/**
 * ChecklistCard component for checklist overview and management
 * Features progress tracking, status indicators, and action buttons
 */
export const ChecklistCard: React.FC<ChecklistCardProps> = ({
  id,
  title,
  description,
  department,
  totalTasks,
  completedTasks,
  dueTime,
  lastUpdated,
  type,
  status,
  onClick,
  onStart,
  onComplete,
  disabled = false,
  className = '',
}) => {
  const typeInfo = typeConfig[type]
  const statusInfo = statusConfig[status]
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const isCompleted = status === 'completed'
  const isOverdue = status === 'overdue'

  const handleCardClick = () => {
    if (disabled) return
    if (onClick) {
      onClick(id)
    }
  }

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onStart) {
      onStart(id)
    }
  }

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onComplete) {
      onComplete(id)
    }
  }

  const getIndicatorColor = () => {
    if (isCompleted) return 'success'
    if (isOverdue) return 'error'
    if (type === 'opening') return 'primary'
    if (type === 'closing') return 'secondary'
    if (type === 'maintenance') return 'warning'
    if (type === 'audit') return 'error'
    return 'primary'
  }

  return (
    <Card
      variant='indicator'
      indicatorColor={getIndicatorColor()}
      className={` ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${isCompleted ? 'bg-surface-card/80' : 'bg-surface-card'} ${className} `.trim()}
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex min-w-0 flex-1 items-center gap-2'>
            <Icon
              name={typeInfo.icon}
              size={20}
              className={`flex-shrink-0 ${isCompleted ? 'text-utility-success' : 'text-secondary-500'} `}
            />
            <Typography
              variant='h3'
              className={`truncate ${isCompleted ? 'text-foreground-muted line-through' : 'text-foreground'} `}
            >
              {title}
            </Typography>
          </div>

          <div className='flex flex-shrink-0 items-center gap-2'>
            {/* Type badge */}
            <span className='bg-secondary-500 rounded-full px-2 py-1 text-xs text-white'>
              {typeInfo.label}
            </span>

            {/* Status indicator */}
            <div
              className={`h-3 w-3 flex-shrink-0 rounded-full ${statusInfo.bgColor} `}
              title={statusInfo.label}
            />
          </div>
        </div>

        {description && (
          <Typography
            variant='caption'
            className={`mt-2 line-clamp-2 ${isCompleted ? 'text-foreground-muted/70' : 'text-foreground-muted'} `}
          >
            {description}
          </Typography>
        )}
      </CardHeader>

      <CardContent>
        {/* Progress Section */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Typography variant='caption' className='font-medium'>
              Progress
            </Typography>
            <Typography variant='caption' className={statusInfo.color}>
              {statusInfo.label}
            </Typography>
          </div>

          {/* Progress Bar */}
          <div className='bg-surface-stroke h-2 w-full rounded-full'>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${isCompleted ? 'bg-utility-success' : 'bg-primary-500'} `}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Progress Text */}
          <div className='flex items-center justify-between'>
            <Typography variant='caption' className='text-foreground-muted'>
              {completedTasks} of {totalTasks} tasks complete
            </Typography>
            <Typography variant='caption' className='font-medium'>
              {progressPercentage}%
            </Typography>
          </div>
        </div>

        {/* Metadata */}
        <div className='mt-4 flex flex-wrap items-center gap-4'>
          <div className='flex items-center gap-1'>
            <Icon name='users' size={12} className='text-foreground-muted' />
            <Typography variant='caption' className='text-foreground-muted'>
              {department}
            </Typography>
          </div>

          {dueTime && (
            <div className='flex items-center gap-1'>
              <Icon
                name='clock'
                size={12}
                className={isOverdue ? 'text-utility-error' : 'text-foreground-muted'}
              />
              <Typography
                variant='caption'
                className={isOverdue ? 'text-utility-error' : 'text-foreground-muted'}
              >
                Due: {dueTime}
              </Typography>
            </div>
          )}

          {lastUpdated && (
            <div className='flex items-center gap-1'>
              <Icon name='calendar' size={12} className='text-foreground-muted' />
              <Typography variant='caption' className='text-foreground-muted'>
                Updated: {lastUpdated}
              </Typography>
            </div>
          )}
        </div>
      </CardContent>

      {/* Action Buttons */}
      {!disabled && (
        <CardFooter>
          <div className='flex gap-2'>
            {status === 'not_started' && onStart && (
              <Button
                variant='primary'
                size='sm'
                icon='check-circle'
                onClick={handleStartClick}
                className='flex-1'
              >
                Start Checklist
              </Button>
            )}

            {status === 'in_progress' && (
              <>
                <Button variant='outline' size='sm' onClick={handleCardClick} className='flex-1'>
                  Continue
                </Button>

                {completedTasks === totalTasks && onComplete && (
                  <Button
                    variant='primary'
                    size='sm'
                    icon='check-circle'
                    onClick={handleCompleteClick}
                    className='flex-1'
                  >
                    Complete
                  </Button>
                )}
              </>
            )}

            {status === 'completed' && (
              <Button
                variant='ghost'
                size='sm'
                icon='check-circle'
                onClick={handleCardClick}
                className='flex-1'
              >
                View Results
              </Button>
            )}

            {status === 'overdue' && (
              <Button
                variant='secondary'
                size='sm'
                icon='alert-triangle'
                onClick={handleCardClick}
                className='flex-1'
              >
                Review Overdue
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

