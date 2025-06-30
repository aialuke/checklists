import React from 'react'

import { useChecklistTasks, useCompleteTaskMutation, useUndoTaskMutation } from '../queries/checklistQueries'
import type { Task } from '../types'

// Task Container Props Interface
export interface TaskContainerProps {
  taskId: string
  children: (props: TaskContainerState) => React.ReactNode
}

// State passed to presentational components
export interface TaskContainerState {
  // State
  task: Task | null
  isCompleting: boolean
  error: string | null

  // Actions
  completeTask: (notes?: string) => Promise<void>
  undoCompletion: () => Promise<void>
}

/**
 * TaskContainer - Connects individual Task UI components to TanStack Query
 * Manages task-specific state and actions
 */
export const TaskContainer: React.FC<TaskContainerProps> = ({ taskId, children }) => {
  // Get task data from TanStack Query
  const { data: tasks = [] } = useChecklistTasks('')
  const task = tasks.find((t) => t.id === taskId) ?? null
  
  // Mutations for task actions
  const completeTaskMutation = useCompleteTaskMutation()
  const undoTaskMutation = useUndoTaskMutation()

  // Wrap actions to be task-specific
  const completeTask = async (notes?: string) => {
    if (!task) return
    await completeTaskMutation.mutateAsync({ taskId: task.id, notes })
  }

  const undoCompletion = async () => {
    if (!task) return
    await undoTaskMutation.mutateAsync(task.id)
  }

  const containerState: TaskContainerState = {
    // State
    task,
    isCompleting: completeTaskMutation.isPending || undoTaskMutation.isPending,
    error: completeTaskMutation.error?.message || undoTaskMutation.error?.message || null,

    // Actions
    completeTask,
    undoCompletion,
  }

  return <>{children(containerState)}</>
}

