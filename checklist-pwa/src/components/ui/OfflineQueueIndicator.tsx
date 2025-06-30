import React, { useCallback } from 'react'

import { Button } from './Button'
import { Icon } from './Icon'
import { Typography } from './Typography'

import type { OfflineAction } from '../../types'

interface OfflineQueueIndicatorProps {
  // Queue state
  queueCount: number
  syncQueue: OfflineAction[]
  hasFailedActions: boolean

  // Network state
  isOnline: boolean
  connectionQuality: 'poor' | 'fair' | 'good' | 'excellent'

  // Sync state
  isSyncing: boolean
  syncProgress: number
  estimatedSyncTime: number

  // Actions
  syncNow: () => Promise<void>
  clearSyncErrors: () => void

  // Display options
  variant?: 'compact' | 'detailed'
  showRetryButton?: boolean
}

const connectionConfig = {
  poor: { color: 'text-utility-error', icon: 'wifi-off' as const },
  fair: { color: 'text-utility-warning', icon: 'wifi' as const },
  good: { color: 'text-utility-success', icon: 'wifi' as const },
  excellent: { color: 'text-utility-success', icon: 'wifi' as const },
}

const formatSyncTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
}

/**
 * OfflineQueueIndicator - Shows sync queue status and controls
 * Displays pending actions, connection quality, and sync progress
 */
export const OfflineQueueIndicator: React.FC<OfflineQueueIndicatorProps> = ({
  queueCount,
  syncQueue,
  hasFailedActions,
  isOnline,
  connectionQuality,
  isSyncing,
  syncProgress,
  estimatedSyncTime,
  syncNow,
  clearSyncErrors,
  variant = 'compact',
  showRetryButton = true,
}) => {
  const handleRetrySync = useCallback(async () => {
    try {
      if (hasFailedActions) {
        clearSyncErrors()
      }
      await syncNow()
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }, [hasFailedActions, clearSyncErrors, syncNow])

  const handleRetryClick = useCallback(() => {
    handleRetrySync().catch(console.error)
  }, [handleRetrySync])

  // Don't show indicator if no items in queue and online
  if (queueCount === 0 && isOnline && !isSyncing) {
    return null
  }

  const connectionInfo = connectionConfig[connectionQuality]
  const hasItems = queueCount > 0
  const failedActions = syncQueue.filter((action) => action.status === 'failed')
  const highPriorityActions = syncQueue.filter(
    (action) => action.priority === 'critical' || action.priority === 'high',
  )

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 ${hasFailedActions ? 'bg-utility-error/10' : hasItems ? 'bg-primary-500/10' : 'bg-utility-success/10'} transition-all duration-200`}
      >
        {/* Connection Status */}
        <Icon
          name={isOnline ? connectionInfo.icon : 'wifi-off'}
          size={16}
          className={isOnline ? connectionInfo.color : 'text-utility-error'}
        />

        {/* Queue Count */}
        {hasItems && (
          <>
            <Typography variant='caption' className='text-foreground font-medium'>
              {queueCount}
            </Typography>
            <Icon
              name={isSyncing ? 'loader-2' : hasFailedActions ? 'alert-triangle' : 'clock'}
              size={16}
              className={` ${isSyncing ? 'text-primary-500 animate-spin' : ''} ${hasFailedActions ? 'text-utility-error' : 'text-foreground-muted'} `}
            />
          </>
        )}

        {/* Sync Progress */}
        {isSyncing && (
          <div className='bg-surface-stroke h-1 w-8 overflow-hidden rounded-full'>
            <div
              className='bg-primary-500 h-full transition-all duration-300'
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        )}
      </div>
    )
  }

  // Detailed variant
  return (
    <div className='bg-surface-card space-y-3 rounded-xl p-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Icon
            name={isOnline ? connectionInfo.icon : 'wifi-off'}
            size={20}
            className={isOnline ? connectionInfo.color : 'text-utility-error'}
          />
          <Typography variant='h3' className='text-foreground'>
            {isOnline ? 'Online' : 'Offline'}
          </Typography>
          {!isOnline && (
            <div className='bg-utility-warning/10 text-utility-warning rounded px-2 py-1 text-xs'>
              Working offline
            </div>
          )}
        </div>

        {hasItems && showRetryButton && (
          <Button
            variant='outline'
            size='sm'
            onClick={handleRetryClick}
            loading={isSyncing}
            disabled={!isOnline}
          >
            <Icon name='refresh-cw' className='mr-1 h-4 w-4' />
            Sync Now
          </Button>
        )}
      </div>

      {/* Queue Summary */}
      {hasItems && (
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Typography variant='body' className='text-foreground-muted'>
              {queueCount} pending {queueCount === 1 ? 'action' : 'actions'}
            </Typography>
            {estimatedSyncTime > 0 && (
              <Typography variant='caption' className='text-foreground-muted'>
                ~{formatSyncTime(estimatedSyncTime)}
              </Typography>
            )}
          </div>

          {/* Priority Breakdown */}
          {highPriorityActions.length > 0 && (
            <div className='text-utility-warning flex items-center gap-1'>
              <Icon name='alert-triangle' size={14} />
              <Typography variant='caption'>{highPriorityActions.length} high priority</Typography>
            </div>
          )}

          {/* Failed Actions */}
          {failedActions.length > 0 && (
            <div className='text-utility-error flex items-center gap-1'>
              <Icon name='x-circle' size={14} />
              <Typography variant='caption'>{failedActions.length} failed - will retry</Typography>
            </div>
          )}
        </div>
      )}

      {/* Sync Progress Bar */}
      {isSyncing && (
        <div className='space-y-1'>
          <div className='flex items-center justify-between'>
            <Typography variant='caption' className='text-foreground-muted'>
              Syncing...
            </Typography>
            <Typography variant='caption' className='text-foreground-muted'>
              {syncProgress}%
            </Typography>
          </div>
          <div className='bg-surface-stroke h-2 w-full overflow-hidden rounded-full'>
            <div
              className='bg-primary-500 h-full transition-all duration-300'
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Connection Quality Info */}
      {isOnline && connectionQuality === 'poor' && (
        <div className='bg-utility-warning/10 flex items-center gap-2 rounded-lg p-2'>
          <Icon name='wifi' size={16} className='text-utility-warning' />
          <Typography variant='caption' className='text-utility-warning'>
            Slow connection - sync may take longer
          </Typography>
        </div>
      )}
    </div>
  )
}

