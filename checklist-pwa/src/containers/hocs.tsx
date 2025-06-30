import React from 'react'

import { AuthContainer, type AuthContainerState } from './AuthContainer'
import { ChecklistContainer, type ChecklistContainerState } from './ChecklistContainer'
import { NotificationContainer, type NotificationContainerState } from './NotificationContainer'
import { OfflineStatusContainer, type OfflineStatusContainerState } from './OfflineStatusContainer'
import { TaskContainer, type TaskContainerState } from './TaskContainer'

/**
 * HOC utilities for containers
 * Separated from component files to support React Fast Refresh
 */

// Auth HOC
const withAuth = <P extends object>(
  Component: React.ComponentType<P & AuthContainerState>,
) => {
  const AuthWrappedComponent = (props: P) => (
    <AuthContainer>{(authState) => <Component {...props} {...authState} />}</AuthContainer>
  )
  
  AuthWrappedComponent.displayName = `withAuth(${Component.displayName ?? Component.name})`
  return AuthWrappedComponent
}

// Checklist HOC
const withChecklist = <P extends object>(
  Component: React.ComponentType<P & ChecklistContainerState>,
) => {
  const ChecklistWrappedComponent = (props: P) => (
    <ChecklistContainer>
      {(checklistState) => <Component {...props} {...checklistState} />}
    </ChecklistContainer>
  )
  
  ChecklistWrappedComponent.displayName = `withChecklist(${Component.displayName ?? Component.name})`
  return ChecklistWrappedComponent
}

// Notification HOC
const withNotifications = <P extends object>(
  Component: React.ComponentType<P & NotificationContainerState>,
) => {
  const NotificationWrappedComponent = (props: P) => (
    <NotificationContainer>
      {(notificationState) => <Component {...props} {...notificationState} />}
    </NotificationContainer>
  )
  
  NotificationWrappedComponent.displayName = `withNotifications(${Component.displayName ?? Component.name})`
  return NotificationWrappedComponent
}

// Offline Status HOC
const withOfflineStatus = <P extends object>(
  Component: React.ComponentType<P & OfflineStatusContainerState>,
) => {
  const OfflineStatusWrappedComponent = (props: P) => (
    <OfflineStatusContainer>
      {(offlineState) => <Component {...props} {...offlineState} />}
    </OfflineStatusContainer>
  )
  
  OfflineStatusWrappedComponent.displayName = `withOfflineStatus(${Component.displayName ?? Component.name})`
  return OfflineStatusWrappedComponent
}

// Task HOC
const withTask = <P extends object>(
  Component: React.ComponentType<P & TaskContainerState>,
) => {
  const TaskWrappedComponent = (props: P & { taskId: string }) => (
    <TaskContainer taskId={props.taskId}>
      {(taskState) => <Component {...props} {...taskState} />}
    </TaskContainer>
  )
  
  TaskWrappedComponent.displayName = `withTask(${Component.displayName ?? Component.name})`
  return TaskWrappedComponent
}