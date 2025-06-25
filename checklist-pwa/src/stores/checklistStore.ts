import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { ChecklistState, ChecklistInstance, Task, TaskCompletion } from './types'
import { useAuthStore } from './authStore'

// Mock API implementation for development
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
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        progress: 0,
        completion_percentage: 0,
      },
      {
        id: 'checklist-2',
        template_id: 'template-2',
        department_id: departmentId,
        assigned_date: date,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        template: {
          id: 'template-2',
          name: 'Closing Checklist',
          department_id: departmentId,
          type: 'closing',
          deadline_time: '22:00',
          notification_minutes: 60,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        progress: 0,
        completion_percentage: 0,
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
    await new Promise((resolve) => setTimeout(resolve, 400))
  },

  submitChecklist: async (checklistId: string): Promise<ChecklistInstance> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      id: checklistId,
      template_id: 'template-1',
      department_id: 'dept-1',
      assigned_date: new Date().toISOString().split('T')[0],
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

// Store for optimistic updates tracking
interface OptimisticUpdate {
  id: string
  type: 'COMPLETE_TASK' | 'UNDO_TASK' | 'SUBMIT_CHECKLIST'
  taskId?: string
  checklistId?: string
  originalValue?: any
  timestamp: Date
}

export const useChecklistStore = create<ChecklistState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => {
        // Private state for optimistic updates
        let optimisticUpdates: OptimisticUpdate[] = []

        return {
          // Initial state
          checklists: [],
          activeChecklist: null,
          tasks: [],
          isLoading: false,
          error: null,
          lastUpdated: null,
          viewMode: 'all',
          searchTerm: '',

          // Actions
          loadChecklists: async () => {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              const authState = useAuthStore.getState()
              const departmentId = authState.selectedDepartment?.id

              if (!departmentId) {
                throw new Error('No department selected')
              }

              const today = new Date().toISOString().split('T')[0]
              const checklists = await mockChecklistAPI.getChecklists(departmentId, today)

              set((state) => {
                state.checklists = checklists
                state.isLoading = false
                state.lastUpdated = new Date()

                // Calculate progress for each checklist
                state.checklists.forEach((checklist) => {
                  const checklistTasks = state.tasks.filter(
                    (t) => t.checklist_instance_id === checklist.id,
                  )
                  if (checklistTasks.length > 0) {
                    const completedTasks = checklistTasks.filter((t) => t.completed).length
                    checklist.progress = (completedTasks / checklistTasks.length) * 100
                    checklist.completion_percentage = checklist.progress
                  }
                })
              })
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to load checklists'
                state.isLoading = false
              })
            }
          },

          loadChecklist: async (id: string) => {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              // Find checklist in existing data
              const checklist = get().checklists.find((c) => c.id === id)
              if (!checklist) {
                throw new Error('Checklist not found')
              }

              // Load tasks for the checklist
              const tasks = await mockChecklistAPI.getChecklistTasks(id)

              set((state) => {
                state.activeChecklist = checklist
                state.tasks = tasks
                state.isLoading = false

                // Update checklist progress
                const completedTasks = tasks.filter((t) => t.completed).length
                if (state.activeChecklist) {
                  state.activeChecklist.progress = (completedTasks / tasks.length) * 100
                  state.activeChecklist.completion_percentage = state.activeChecklist.progress
                }
              })
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to load checklist'
                state.isLoading = false
              })
            }
          },

          setActiveChecklist: (checklist: ChecklistInstance | null) => {
            set((state) => {
              state.activeChecklist = checklist
              if (!checklist) {
                state.tasks = []
              }
            })
          },

          completeTask: async (taskId: string, notes?: string) => {
            // Perform optimistic update first
            get().optimisticCompleteTask(taskId)

            const updateId = `complete-${taskId}-${Date.now()}`
            const originalTask = get().tasks.find((t) => t.id === taskId)

            optimisticUpdates.push({
              id: updateId,
              type: 'COMPLETE_TASK',
              taskId,
              originalValue: originalTask ? { ...originalTask } : null,
              timestamp: new Date(),
            })

            try {
              const completion = await mockChecklistAPI.completeTask(taskId, notes)

              // Remove optimistic update on success
              optimisticUpdates = optimisticUpdates.filter((u) => u.id !== updateId)

              set((state) => {
                const task = state.tasks.find((t) => t.id === taskId)
                if (task) {
                  task.completed = true
                  task.completed_at = completion.completed_at
                  task.completed_by = completion.completed_by
                }

                // Update checklist progress
                if (state.activeChecklist) {
                  const completedTasks = state.tasks.filter((t) => t.completed).length
                  state.activeChecklist.progress = (completedTasks / state.tasks.length) * 100
                  state.activeChecklist.completion_percentage = state.activeChecklist.progress
                }
              })
            } catch (error) {
              // Rollback optimistic update on failure
              get().rollbackOptimisticUpdate(taskId)
              optimisticUpdates = optimisticUpdates.filter((u) => u.id !== updateId)

              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to complete task'
              })
            }
          },

          undoTaskCompletion: async (taskId: string) => {
            // Optimistic update
            set((state) => {
              const task = state.tasks.find((t) => t.id === taskId)
              if (task) {
                task.completed = false
                task.completed_at = undefined
                task.completed_by = undefined
              }

              // Update checklist progress
              if (state.activeChecklist) {
                const completedTasks = state.tasks.filter((t) => t.completed).length
                state.activeChecklist.progress = (completedTasks / state.tasks.length) * 100
                state.activeChecklist.completion_percentage = state.activeChecklist.progress
              }
            })

            try {
              await mockChecklistAPI.undoTaskCompletion(taskId)
            } catch (error) {
              // Rollback on failure
              set((state) => {
                const task = state.tasks.find((t) => t.id === taskId)
                if (task) {
                  task.completed = true
                  task.completed_at = new Date().toISOString()
                }
                state.error =
                  error instanceof Error ? error.message : 'Failed to undo task completion'
              })
            }
          },

          submitChecklist: async (checklistId: string) => {
            set((state) => {
              state.isLoading = true
              state.error = null
            })

            try {
              const updatedChecklist = await mockChecklistAPI.submitChecklist(checklistId)

              set((state) => {
                // Update checklist in array
                const index = state.checklists.findIndex((c) => c.id === checklistId)
                if (index !== -1) {
                  state.checklists[index] = updatedChecklist
                }

                // Update active checklist if it's the same one
                if (state.activeChecklist?.id === checklistId) {
                  state.activeChecklist = updatedChecklist
                }

                state.isLoading = false
              })
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to submit checklist'
                state.isLoading = false
              })
            }
          },

          refreshData: async () => {
            await get().loadChecklists()
            if (get().activeChecklist) {
              await get().loadChecklist(get().activeChecklist!.id)
            }
          },

          // Optimistic update helpers
          optimisticCompleteTask: (taskId: string) => {
            set((state) => {
              const task = state.tasks.find((t) => t.id === taskId)
              if (task && !task.completed) {
                task.completed = true
                task.completed_at = new Date().toISOString()
                task.completed_by = useAuthStore.getState().user?.id || 'unknown'
              }

              // Update checklist progress
              if (state.activeChecklist) {
                const completedTasks = state.tasks.filter((t) => t.completed).length
                state.activeChecklist.progress = (completedTasks / state.tasks.length) * 100
                state.activeChecklist.completion_percentage = state.activeChecklist.progress
              }
            })
          },

          rollbackOptimisticUpdate: (taskId: string) => {
            const update = optimisticUpdates.find((u) => u.taskId === taskId)
            if (update && update.originalValue) {
              set((state) => {
                const taskIndex = state.tasks.findIndex((t) => t.id === taskId)
                if (taskIndex !== -1) {
                  state.tasks[taskIndex] = { ...update.originalValue }
                }

                // Recalculate progress
                if (state.activeChecklist) {
                  const completedTasks = state.tasks.filter((t) => t.completed).length
                  state.activeChecklist.progress = (completedTasks / state.tasks.length) * 100
                  state.activeChecklist.completion_percentage = state.activeChecklist.progress
                }
              })
            }
          },

          // Computed getters
          getChecklistProgress: (checklistId: string) => {
            const state = get()
            const checklist = state.checklists.find((c) => c.id === checklistId)
            return checklist?.progress || 0
          },

          getCompletedTasks: () => {
            return get().tasks.filter((task) => task.completed)
          },

          getPendingTasks: () => {
            return get().tasks.filter((task) => !task.completed)
          },

          getOverdueChecklists: () => {
            const now = new Date()
            return get().checklists.filter((checklist) => {
              if (checklist.status === 'completed') return false

              // Check if past deadline
              const deadline = new Date(
                checklist.assigned_date + 'T' + checklist.template?.deadline_time,
              )
              return now > deadline
            })
          },
        }
      }),
    ),
    {
      name: 'checklist-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)

// Selectors for optimized subscriptions
export const checklistSelectors = {
  checklists: (state: ChecklistState) => state.checklists,
  activeChecklist: (state: ChecklistState) => state.activeChecklist,
  tasks: (state: ChecklistState) => state.tasks,
  isLoading: (state: ChecklistState) => state.isLoading,
  error: (state: ChecklistState) => state.error,
  lastUpdated: (state: ChecklistState) => state.lastUpdated,
  viewMode: (state: ChecklistState) => state.viewMode,
  searchTerm: (state: ChecklistState) => state.searchTerm,

  // Filtered data selectors
  visibleChecklists: (state: ChecklistState) => {
    let filtered = state.checklists

    if (state.viewMode === 'pending') {
      filtered = filtered.filter((c) => c.status === 'pending' || c.status === 'in_progress')
    } else if (state.viewMode === 'completed') {
      filtered = filtered.filter((c) => c.status === 'completed')
    }

    if (state.searchTerm) {
      const search = state.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.template?.name.toLowerCase().includes(search) ||
          c.status.toLowerCase().includes(search),
      )
    }

    return filtered
  },

  pendingTasks: (state: ChecklistState) => state.tasks.filter((t) => !t.completed),
  completedTasks: (state: ChecklistState) => state.tasks.filter((t) => t.completed),
  requiredTasks: (state: ChecklistState) => state.tasks.filter((t) => t.required),

  // Progress selectors
  activeChecklistProgress: (state: ChecklistState) => {
    if (!state.activeChecklist || state.tasks.length === 0) return 0
    const completed = state.tasks.filter((t) => t.completed).length
    return Math.round((completed / state.tasks.length) * 100)
  },

  canSubmitChecklist: (state: ChecklistState) => {
    if (!state.activeChecklist) return false
    const requiredTasks = state.tasks.filter((t) => t.required)
    const completedRequiredTasks = requiredTasks.filter((t) => t.completed)
    return requiredTasks.length > 0 && completedRequiredTasks.length === requiredTasks.length
  },
}

// Hooks for specific checklist operations
export const useChecklists = () => {
  return useChecklistStore(checklistSelectors.visibleChecklists)
}

export const useActiveChecklist = () => {
  return useChecklistStore(checklistSelectors.activeChecklist)
}

export const useChecklistTasks = () => {
  return useChecklistStore(checklistSelectors.tasks)
}

export const useChecklistProgress = () => {
  return useChecklistStore(checklistSelectors.activeChecklistProgress)
}

export const useChecklistActions = () => {
  return {
    loadChecklists: useChecklistStore((state) => state.loadChecklists),
    loadChecklist: useChecklistStore((state) => state.loadChecklist),
    setActiveChecklist: useChecklistStore((state) => state.setActiveChecklist),
    completeTask: useChecklistStore((state) => state.completeTask),
    undoTaskCompletion: useChecklistStore((state) => state.undoTaskCompletion),
    submitChecklist: useChecklistStore((state) => state.submitChecklist),
    refreshData: useChecklistStore((state) => state.refreshData),
  }
}

// React 19 Suspense integration
export const useChecklistsSuspense = () => {
  const checklistState = useChecklistStore()

  if (checklistState.isLoading && checklistState.checklists.length === 0) {
    throw new Promise<void>((resolve) => {
      const unsubscribe = useChecklistStore.subscribe(
        (state) => state.isLoading,
        (isLoading) => {
          if (!isLoading) {
            unsubscribe()
            resolve()
          }
        },
      )
    })
  }

  return checklistState
}

// Development helpers
export const resetChecklistStore = () => {
  useChecklistStore.setState({
    checklists: [],
    activeChecklist: null,
    tasks: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
    viewMode: 'all',
    searchTerm: '',
  })
}

export const getChecklistState = () => {
  return useChecklistStore.getState()
}
