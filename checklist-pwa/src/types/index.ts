// Common types across the application
// Re-export all types for easy importing

// Core entity types
export type { User, Department, Role } from './auth'
export type { 
  ChecklistTemplate, 
  ChecklistInstance, 
  Task, 
  TaskCompletion 
} from './checklist'
export type { 
  Notification, 
  ToastNotification 
} from './notification'
export type { 
  OfflineAction 
} from './offline'
export type { 
  NavigationItem 
} from './role'

// Note: Legacy state types removed after TanStack Query migration completion