import { http, HttpResponse } from 'msw'

// Mock Supabase API endpoints
const supabaseUrl = 'https://your-project.supabase.co'

export const handlers = [
  // Auth endpoints
  http.post(`${supabaseUrl}/auth/v1/token`, () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        user_metadata: {
          staff_number: '123456',
        },
      },
    })
  }),

  // Staff validation
  http.post(`${supabaseUrl}/rest/v1/rpc/validate_staff_number`, () => {
    return HttpResponse.json({
      valid: true,
      staff_id: 'mock-staff-id',
      roles: ['user'],
    })
  }),

  // Checklists endpoint
  http.get(`${supabaseUrl}/rest/v1/daily_checklist_instances`, () => {
    return HttpResponse.json([
      {
        id: 'checklist-1',
        template_id: 'template-1',
        department_id: 'dept-1',
        assigned_date: '2024-01-01',
        status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ])
  }),

  // Tasks endpoint
  http.get(`${supabaseUrl}/rest/v1/template_tasks`, () => {
    return HttpResponse.json([
      {
        id: 'task-1',
        template_id: 'template-1',
        title: 'Sample Task',
        description: 'This is a sample task',
        order: 1,
        required: true,
      },
    ])
  }),

  // Task completion
  http.post(`${supabaseUrl}/rest/v1/task_completions`, () => {
    return HttpResponse.json({
      id: 'completion-1',
      task_id: 'task-1',
      checklist_instance_id: 'checklist-1',
      completed_by: 'mock-staff-id',
      completed_at: new Date().toISOString(),
    })
  }),

  // Departments endpoint
  http.get(`${supabaseUrl}/rest/v1/departments`, () => {
    return HttpResponse.json([
      {
        id: 'dept-1',
        name: 'Kitchen',
        code: 'KITCHEN',
        active: true,
      },
    ])
  }),

  // Real-time subscriptions (WebSocket mock)
  http.get(`${supabaseUrl}/realtime/v1/*`, () => {
    return HttpResponse.json({
      message: 'Connected to realtime',
    })
  }),

  // Generic error handler for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`)
    return HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),
]
