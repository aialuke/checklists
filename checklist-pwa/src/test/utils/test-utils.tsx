import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Mock Zustand stores for testing
const mockStores = {
  auth: {
    user: null,
    roles: [],
    department: null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    setDepartment: vi.fn(),
  },
  checklist: {
    checklists: [],
    tasks: [],
    isLoading: false,
    completeTask: vi.fn(),
    loadChecklists: vi.fn(),
  },
  offline: {
    isOnline: true,
    syncQueue: [],
    queueAction: vi.fn(),
    sync: vi.fn(),
  },
}

// Test wrapper component
interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <BrowserRouter>
      <div className='min-h-screen bg-gray-50'>{children}</div>
    </BrowserRouter>
  )
}

// Custom render function with providers
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  const user = userEvent.setup()

  return {
    user,
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  }
}

// Export everything
export * from '@testing-library/react'
export { customRender as render }
export { mockStores }

// Helper functions for common test scenarios
export const createMockChecklist = (overrides = {}) => ({
  id: 'test-checklist-1',
  template_id: 'template-1',
  department_id: 'dept-1',
  assigned_date: '2024-01-01',
  status: 'pending',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockTask = (overrides = {}) => ({
  id: 'test-task-1',
  template_id: 'template-1',
  title: 'Test Task',
  description: 'This is a test task',
  order: 1,
  required: true,
  completed: false,
  ...overrides,
})

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  staff_number: '123456',
  full_name: 'Test User',
  email: 'test@example.com',
  department_id: 'dept-1',
  roles: ['user'],
  ...overrides,
})

// Mobile testing utilities
export const mockTouchEvent = (element: Element, type: 'touchstart' | 'touchend' | 'touchmove') => {
  const event = new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: [
      {
        identifier: 0,
        target: element,
        clientX: 100,
        clientY: 100,
        pageX: 100,
        pageY: 100,
        screenX: 100,
        screenY: 100,
        radiusX: 10,
        radiusY: 10,
        rotationAngle: 0,
        force: 1,
      },
    ] as any,
  })

  element.dispatchEvent(event)
  return event
}

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now()
  renderFn()
  const end = performance.now()
  return end - start
}

// Accessibility testing utilities
export const getAccessibilityTree = (container: HTMLElement) => {
  const tree = container.querySelector('[role]') || container.firstElementChild
  return tree ? tree.getAttribute('role') : null
}

export const checkMinimumTouchTarget = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect()
  const minSize = 44 // 44px minimum touch target
  return rect.width >= minSize && rect.height >= minSize
}

// Offline testing utilities
export const simulateOffline = () => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: false,
  })
  window.dispatchEvent(new Event('offline'))
}

export const simulateOnline = () => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
  })
  window.dispatchEvent(new Event('online'))
}

// PWA testing utilities
export const mockServiceWorkerRegistration = () => {
  const registration = {
    scope: '/',
    active: {
      postMessage: vi.fn(),
    },
    installing: null,
    waiting: null,
    update: vi.fn(),
    unregister: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }

  vi.spyOn(navigator.serviceWorker, 'register').mockResolvedValue(registration as any)
  return registration
}
