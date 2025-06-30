import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { 
  ChecklistInstance, 
  Task, 
  TaskCompletion,
  ChecklistQueryFilters,
  CompleteTaskMutationVariables,
  CompleteTaskMutationResponse 
} from '../types/checklist'

// Mock API implementation matching checklistStore behavior
const mockChecklistAPI = {
  getChecklists: async (departmentId: string, date: string): Promise<ChecklistInstance[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800))

    return [
      {
        id: 'checklist-1',
        template_id: 'template-1',
        department_id: departmentId,
        assigned_date: date,
        status: 'pending',
        assigned_to: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        template: {
          id: 'template-1',
          name: 'Opening Checklist',
          department_id: departmentId,
          type: 'opening',
          deadline_time: '14:00',
          notification_minutes: 30,
          task_count: 8,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        progress: 25,
        completion_percentage: 25,
      },
      {
        id: 'checklist-2',
        template_id: 'template-2',
        department_id: departmentId,
        assigned_date: date,
        status: 'pending',
        assigned_to: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        template: {
          id: 'template-2',
          name: 'Closing Checklist',
          department_id: departmentId,
          type: 'closing',
          deadline_time: '22:00',
          notification_minutes: 60,
          task_count: 12,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        progress: 67,
        completion_percentage: 67,
      },
    ]
  },

  getChecklistTasks: async (checklistId: string): Promise<Task[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    return [
      {
        id: 'task-1',
        template_task_id: 'template-task-1',
        checklist_instance_id: checklistId,
        title: 'Check equipment status',
        description: 'Verify all equipment is functioning properly',
        order: 1,
        required: true,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'task-2',
        template_task_id: 'template-task-2',
        checklist_instance_id: checklistId,
        title: 'Clean workspace',
        description: 'Ensure workspace is clean and organized',
        order: 2,
        required: true,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'task-3',
        template_task_id: 'template-task-3',
        checklist_instance_id: checklistId,
        title: 'Stock supplies',
        description: 'Check and restock necessary supplies',
        order: 3,
        required: false,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
  },

  completeTask: async (taskId: string, notes?: string): Promise<TaskCompletion> => {
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Simulate occasional failures for testing
    if (Math.random() < 0.1) {
      throw new Error('Network error - task completion failed')
    }

    return {
      id: `completion-${taskId}`,
      task_id: taskId,
      checklist_instance_id: 'checklist-1',
      completed_by: 'user-1',
      completed_at: new Date().toISOString(),
      notes,
    }
  },

  undoTaskCompletion: async (taskId: string): Promise<void> => {
    console.log(`Undoing task completion for task: ${taskId}`)
    await new Promise((resolve) => setTimeout(resolve, 400))
  },

  submitChecklist: async (checklistId: string): Promise<ChecklistInstance> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      id: checklistId,
      template_id: 'template-1',
      department_id: 'dept-1',
      assigned_date: new Date().toISOString().split('T')[0] ?? new Date().toISOString(),
      status: 'completed',
      assigned_to: 'user-1',
      started_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      progress: 100,
      completion_percentage: 100,
    }
  },
}

// Query key factory
const checklistKeys = {
  all: ['checklists'] as const,
  lists: () => [...checklistKeys.all, 'list'] as const,
  list: (filters: ChecklistQueryFilters) => [...checklistKeys.lists(), filters] as const,
  details: () => [...checklistKeys.all, 'detail'] as const,
  detail: (id: string) => [...checklistKeys.details(), id] as const,
  tasks: (checklistId: string) => [...checklistKeys.all, 'tasks', checklistId] as const,
}

// Core queries
export const useChecklists = (departmentId?: string) => {
  return useQuery({
    queryKey: checklistKeys.list({ departmentId: departmentId || 'all' }),
    queryFn: async () => {
      if (!departmentId) {
        throw new Error('Department ID is required')
      }
      
      const today = new Date().toISOString().split('T')[0] ?? new Date().toISOString()
      const data = await mockChecklistAPI.getChecklists(departmentId, today)
      return data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!departmentId,
  })
}

export const useChecklist = (checklistId: string) => {
  return useQuery({
    queryKey: checklistKeys.detail(checklistId),
    queryFn: async () => {
      // In real implementation, this would fetch detailed checklist from Supabase
      // const { data, error } = await supabase
      //   .from('checklist_instances')
      //   .select(`
      //     *,
      //     template:checklist_templates(*),
      //     tasks:tasks(*),
      //     department:departments(*)
      //   `)
      //   .eq('id', checklistId)
      //   .single()
      // 
      // if (error) throw error
      // return data
      
      // Mock implementation
      const checklists = await mockChecklistAPI.getChecklists('dept-1', new Date().toISOString().split('T')[0] ?? new Date().toISOString())
      const checklist = checklists.find(c => c.id === checklistId)
      if (!checklist) {
        throw new Error('Checklist not found')
      }
      return checklist
    },
    enabled: !!checklistId,
  })
}

export const useChecklistTasks = (checklistId: string) => {
  return useQuery({
    queryKey: checklistKeys.tasks(checklistId),
    queryFn: async () => {
      const data = await mockChecklistAPI.getChecklistTasks(checklistId)
      return data
    },
    enabled: !!checklistId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Optimistic mutations
export const useCompleteTaskMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ taskId, notes }: CompleteTaskMutationVariables): Promise<CompleteTaskMutationResponse> => {
      const completion = await mockChecklistAPI.completeTask(taskId, notes)
      
      // Mock response with updated task
      const task: Task = {
        id: taskId,
        template_task_id: 'template-task-1',
        checklist_instance_id: completion.checklist_instance_id,
        title: 'Updated Task',
        description: 'Task description',
        order: 1,
        required: true,
        completed: true,
        completed_at: completion.completed_at,
        completed_by: completion.completed_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      return {
        task,
        checklist: {} as ChecklistInstance, // Would be populated in real implementation
      }
    },
    
    // Optimistic updates with rollback
    onMutate: async ({ taskId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: checklistKeys.all })
      
      // Snapshot the previous values
      const previousTasks = queryClient.getQueryData(checklistKeys.tasks(taskId.split('-')[0] + '-1')) // Mock getting checklist ID
      
      // Optimistically update task completion
      queryClient.setQueriesData(
        { queryKey: checklistKeys.tasks(taskId.split('-')[0] + '-1') },
        (oldTasks: Task[] | undefined) => {
          if (!oldTasks) return oldTasks
          
          return oldTasks.map(task => 
            task.id === taskId 
              ? { 
                  ...task, 
                  completed: true, 
                  completed_at: new Date().toISOString(),
                  completed_by: 'user-1'
                }
              : task
          )
        }
      )
      
      // Update any checklist detail queries
      queryClient.setQueriesData(
        { queryKey: checklistKeys.details() },
        (oldChecklist: ChecklistInstance | undefined) => {
          if (!oldChecklist) return oldChecklist
          
          // Recalculate progress
          const tasks = queryClient.getQueryData(checklistKeys.tasks(oldChecklist.id)) as Task[] | undefined
          if (tasks) {
            const completedCount = tasks.filter(t => t.completed || t.id === taskId).length
            const progress = (completedCount / tasks.length) * 100
            
            return {
              ...oldChecklist,
              progress,
              completion_percentage: progress,
            }
          }
          
          return oldChecklist
        }
      )
      
      return { previousTasks }
    },
    
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(
          checklistKeys.tasks(variables.taskId.split('-')[0] + '-1'), 
          context.previousTasks
        )
      }
      
      console.error('Task completion failed:', err)
    },
    
    onSettled: () => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: checklistKeys.all })
    },
  })
}

export const useUndoTaskMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      await mockChecklistAPI.undoTaskCompletion(taskId)
      return taskId
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: checklistKeys.all })
      
      const previousTasks = queryClient.getQueryData(checklistKeys.tasks(taskId.split('-')[0] + '-1'))
      
      // Optimistically update to uncomplete
      queryClient.setQueriesData(
        { queryKey: checklistKeys.tasks(taskId.split('-')[0] + '-1') },
        (oldTasks: Task[] | undefined) => {
          if (!oldTasks) return oldTasks
          
          return oldTasks.map(task => 
            task.id === taskId 
              ? { 
                  ...task, 
                  completed: false, 
                  completed_at: undefined,
                  completed_by: undefined
                }
              : task
          )
        }
      )
      
      return { previousTasks }
    },
    onError: (_err, taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          checklistKeys.tasks(taskId.split('-')[0] + '-1'), 
          context.previousTasks
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.all })
    },
  })
}

export const useSubmitChecklistMutation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (checklistId: string) => {
      const data = await mockChecklistAPI.submitChecklist(checklistId)
      return data
    },
    onSuccess: (data) => {
      // Update the specific checklist in cache
      queryClient.setQueryData(checklistKeys.detail(data.id), data)
      
      // Invalidate lists to show updated status
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() })
    },
    onError: (error) => {
      console.error('Checklist submission failed:', error)
    }
  })
}

// Helper hooks
export const useChecklistProgress = (checklistId: string) => {
  const { data: tasks } = useChecklistTasks(checklistId)
  
  if (!tasks || tasks.length === 0) return 0
  
  const completedCount = tasks.filter(task => task.completed).length
  return (completedCount / tasks.length) * 100
}