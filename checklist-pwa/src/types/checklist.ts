// Checklist-specific types

export interface ChecklistTemplate {
  id: string
  name: string
  department_id: string
  type: 'opening' | 'closing' | 'maintenance' | 'audit'
  deadline_time: string
  notification_minutes: number
  active: boolean
  created_at: string
  updated_at: string
  task_count?: number
}

export interface ChecklistInstance {
  id: string
  template_id: string
  department_id: string
  assigned_date: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  assigned_to: string
  created_at: string
  updated_at: string
  template?: ChecklistTemplate
  progress: number
  completion_percentage: number
  started_at?: string
  completed_at?: string
}

export interface Task {
  id: string
  template_task_id: string
  checklist_instance_id: string
  title: string
  description: string
  order: number
  required: boolean
  completed: boolean
  created_at: string
  updated_at: string
  completed_at?: string
  completed_by?: string
}

export interface TaskCompletion {
  id: string
  task_id: string
  checklist_instance_id: string
  completed_by: string
  completed_at: string
  notes?: string
}

// Checklist state interfaces (used by TanStack Query and Container components)
interface ChecklistState {
  checklists: ChecklistInstance[]
  tasks: Task[]
  activeChecklist: ChecklistInstance | null
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  viewMode: 'all' | 'pending' | 'completed'
  searchTerm: string

  // Actions
  loadChecklists: () => Promise<void>
  loadChecklist: (id: string) => Promise<void>
  setActiveChecklist: (checklist: ChecklistInstance | null) => void
  completeTask: (taskId: string, notes?: string) => Promise<void>
  undoTaskCompletion: (taskId: string) => Promise<void>
  submitChecklist: (checklistId: string) => Promise<void>
  refreshData: () => Promise<void>
  optimisticCompleteTask: (taskId: string) => void
  rollbackOptimisticUpdate: (taskId: string) => void

  // Computed getters
  getChecklistProgress: (checklistId: string) => number
  getCompletedTasks: () => Task[]
  getPendingTasks: () => Task[]
  getOverdueChecklists: () => ChecklistInstance[]
}

// TanStack Query specific types
export interface ChecklistQueryFilters {
  departmentId?: string
  status?: ChecklistInstance['status']
  type?: ChecklistTemplate['type']
}

export interface CompleteTaskMutationVariables {
  taskId: string
  notes?: string
}

export interface CompleteTaskMutationResponse {
  task: Task
  checklist: ChecklistInstance
}