import React from 'react'

import { 
  useChecklists, 
  useChecklist, 
  useChecklistTasks,
  useCompleteTaskMutation,
  useUndoTaskMutation,
  useSubmitChecklistMutation,
  useChecklistProgress
} from '../queries/checklistQueries'
import { useCurrentUserDepartments } from '../queries/authQueries'
import { useNetworkStatus, useAddToSyncQueue } from '../queries/offlineQueries'
import { useNotifications } from '../stores/notificationClientStore'
import type { ChecklistInstance, Task } from '../types'

// Checklist Container Props Interface
export interface ChecklistContainerProps {
  children: (props: ChecklistContainerState) => React.ReactNode
}

// State passed to presentational components
export interface ChecklistContainerState {
  // State
  checklists: ChecklistInstance[]
  activeChecklist: ChecklistInstance | null
  tasks: Task[]
  progress: number
  isLoading: boolean
  error: string | null

  // Actions
  loadChecklists: () => Promise<void>
  selectChecklist: (checklistId: string) => Promise<void>
  completeTask: (taskId: string, notes?: string) => Promise<void>
  undoTaskCompletion: (taskId: string) => Promise<void>
  submitChecklist: (checklistId: string) => Promise<void>
  refreshData: () => Promise<void>
}

/**
 * ChecklistContainer - Connects UI components to TanStack Query
 * Implements Container/Presentational pattern for clean separation
 */
export const ChecklistContainer: React.FC<ChecklistContainerProps> = ({ children }) => {
  // Get current user's departments for fetching
  const departments = useCurrentUserDepartments()
  const selectedDepartment = departments[0] // TODO: Get from client state store
  
  // State for active checklist selection
  const [activeChecklistId, setActiveChecklistId] = React.useState<string | null>(null)
  
  // Get state from TanStack Query hooks
  const { data: checklists = [], isLoading: checklistsLoading, refetch: refetchChecklists } = useChecklists(selectedDepartment?.id)
  const { data: activeChecklist } = useChecklist(activeChecklistId || '')
  const { data: tasks = [] } = useChecklistTasks(activeChecklistId || '')
  const progress = useChecklistProgress(activeChecklistId || '')
  
  // Offline and notification support
  const { data: networkStatus } = useNetworkStatus()
  const addToSyncQueue = useAddToSyncQueue()
  const { taskCompleted, taskFailed, success, error: showError } = useNotifications()
  
  // Mutations
  const completeTaskMutation = useCompleteTaskMutation()
  const undoTaskMutation = useUndoTaskMutation()
  const submitChecklistMutation = useSubmitChecklistMutation()

  // Derived state
  const isLoading = checklistsLoading || completeTaskMutation.isPending || submitChecklistMutation.isPending
  const errorState = completeTaskMutation.error?.message || submitChecklistMutation.error?.message || null

  // Actions
  const loadChecklists = async () => {
    await refetchChecklists()
  }

  const selectChecklist = async (checklistId: string) => {
    try {
      setActiveChecklistId(checklistId)
    } catch (error) {
      console.error('Failed to select checklist:', error)
      throw error
    }
  }

  const completeTask = async (taskId: string, notes?: string) => {
    try {
      if (!networkStatus?.isOnline) {
        // Queue for offline sync
        await addToSyncQueue.mutateAsync({
          type: 'task_completion',
          data: { taskId, notes, timestamp: Date.now() },
          maxRetries: 3
        })
        
        // Show optimistic feedback
        const task = tasks.find(t => t.id === taskId)
        taskCompleted(task?.title || 'Task')
      } else {
        // Online - complete immediately
        await completeTaskMutation.mutateAsync({ taskId, notes })
        const task = tasks.find(t => t.id === taskId)
        taskCompleted(task?.title || 'Task')
      }
    } catch (err) {
      const task = tasks.find(t => t.id === taskId)
      taskFailed(task?.title || 'Task', err instanceof Error ? err.message : undefined)
      throw err
    }
  }

  const undoTaskCompletion = async (taskId: string) => {
    await undoTaskMutation.mutateAsync(taskId)
  }

  const submitChecklist = async (checklistId: string) => {
    try {
      const checklist = checklists.find(c => c.id === checklistId)
      await submitChecklistMutation.mutateAsync(checklistId)
      success('Checklist Submitted', `"${checklist?.template?.name || 'Checklist'}" has been submitted successfully.`)
    } catch (err) {
      const checklist = checklists.find(c => c.id === checklistId)
      showError('Submission Failed', `Failed to submit "${checklist?.template?.name || 'checklist'}". ${err instanceof Error ? err.message : ''}`)
      throw err
    }
  }

  const refreshData = async () => {
    await refetchChecklists()
  }

  const containerState: ChecklistContainerState = {
    // State
    checklists,
    activeChecklist: activeChecklist || null,
    tasks,
    progress,
    isLoading,
    error: errorState,

    // Actions
    loadChecklists,
    selectChecklist,
    completeTask,
    undoTaskCompletion,
    submitChecklist,
    refreshData,
  }

  return <>{children(containerState)}</>
}

