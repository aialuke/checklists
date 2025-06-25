import { vi } from 'vitest'

// Performance monitoring utilities for testing
export interface PerformanceMetrics {
  FCP: number // First Contentful Paint
  LCP: number // Largest Contentful Paint
  FID: number // First Input Delay
  CLS: number // Cumulative Layout Shift
  INP: number // Interaction to Next Paint
}

// Performance budget thresholds (2024 standards)
export const PERFORMANCE_BUDGETS = {
  FCP: 800, // < 0.8s
  LCP: 1200, // < 1.2s
  FID: 100, // < 100ms
  CLS: 0.05, // < 0.05
  INP: 100, // < 100ms
  BUNDLE_SIZE: 150 * 1024, // < 150KB
  JS_BOOT_TIME: 600, // < 600ms
}

// Mock Performance Observer for testing
export const createMockPerformanceObserver = () => {
  const entries: PerformanceEntry[] = []

  const observer = vi.fn().mockImplementation((callback: PerformanceObserverCallback) => {
    return {
      observe: vi.fn((options: PerformanceObserverInit) => {
        // Simulate performance entries based on observed types
        if (options.entryTypes?.includes('paint')) {
          entries.push({
            name: 'first-contentful-paint',
            entryType: 'paint',
            startTime: 650, // Simulated FCP time
            duration: 0,
            toJSON: vi.fn(),
          } as PerformanceEntry)
        }

        if (options.entryTypes?.includes('largest-contentful-paint')) {
          entries.push({
            name: 'largest-contentful-paint',
            entryType: 'largest-contentful-paint',
            startTime: 980, // Simulated LCP time
            duration: 0,
            toJSON: vi.fn(),
          } as PerformanceEntry)
        }

        if (options.entryTypes?.includes('layout-shift')) {
          entries.push({
            name: '',
            entryType: 'layout-shift',
            startTime: Date.now(),
            duration: 0,
            value: 0.02,
            toJSON: vi.fn(),
          } as PerformanceEntry & { value: number })
        }

        // Trigger callback with mock entries
        setTimeout(() => {
          callback(
            { getEntries: () => entries } as PerformanceObserverEntryList,
            observer as unknown as PerformanceObserver,
          )
        }, 100)
      }),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => entries),
    }
  })

  return observer
}

// Mock Web Vitals measurement
export const mockWebVitals = (metrics: Partial<PerformanceMetrics> = {}) => {
  const defaultMetrics: PerformanceMetrics = {
    FCP: 650,
    LCP: 980,
    FID: 45,
    CLS: 0.02,
    INP: 85,
    ...metrics,
  }

  return defaultMetrics
}

// Bundle size testing utility
export const calculateBundleSize = (bundleContent: string): number => {
  return new Blob([bundleContent]).size
}

// JavaScript boot time simulation
export const simulateJSBootTime = (
  complexity: 'simple' | 'moderate' | 'complex' = 'moderate',
): number => {
  const baseTimes = {
    simple: 200,
    moderate: 400,
    complex: 800,
  }

  // Add some randomness to simulate real-world variance
  const variance = Math.random() * 100 - 50 // ±50ms
  return baseTimes[complexity] + variance
}

// Core Web Vitals assertion helpers
export const assertPerformanceBudget = (metrics: PerformanceMetrics) => {
  const failures: string[] = []

  if (metrics.FCP > PERFORMANCE_BUDGETS.FCP) {
    failures.push(`FCP: ${metrics.FCP}ms exceeds budget of ${PERFORMANCE_BUDGETS.FCP}ms`)
  }

  if (metrics.LCP > PERFORMANCE_BUDGETS.LCP) {
    failures.push(`LCP: ${metrics.LCP}ms exceeds budget of ${PERFORMANCE_BUDGETS.LCP}ms`)
  }

  if (metrics.FID > PERFORMANCE_BUDGETS.FID) {
    failures.push(`FID: ${metrics.FID}ms exceeds budget of ${PERFORMANCE_BUDGETS.FID}ms`)
  }

  if (metrics.CLS > PERFORMANCE_BUDGETS.CLS) {
    failures.push(`CLS: ${metrics.CLS} exceeds budget of ${PERFORMANCE_BUDGETS.CLS}`)
  }

  if (metrics.INP > PERFORMANCE_BUDGETS.INP) {
    failures.push(`INP: ${metrics.INP}ms exceeds budget of ${PERFORMANCE_BUDGETS.INP}ms`)
  }

  if (failures.length > 0) {
    throw new Error(`Performance budget violations:\n${failures.join('\n')}`)
  }
}

// Memory usage testing
export const measureMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize
  }
  return 0
}

// Network simulation for performance testing
export const simulateNetworkConditions = (type: '4g' | '3g' | 'slow-3g' | 'offline') => {
  const conditions = {
    '4g': { downlink: 10, rtt: 50 },
    '3g': { downlink: 1.5, rtt: 300 },
    'slow-3g': { downlink: 0.5, rtt: 2000 },
    offline: { downlink: 0, rtt: 0 },
  }

  // Mock navigator.connection API
  Object.defineProperty(navigator, 'connection', {
    writable: true,
    value: {
      ...conditions[type],
      effectiveType: type,
      saveData: type === 'slow-3g' || type === 'offline',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
  })
}

// Render performance testing utility
export const measureRenderPerformance = async (renderFn: () => Promise<void> | void) => {
  const start = performance.now()
  await renderFn()
  const end = performance.now()

  const renderTime = end - start

  // Assert render time is reasonable (< 16ms for 60fps)
  if (renderTime > 16) {
    console.warn(`Render took ${renderTime.toFixed(2)}ms (target: <16ms for 60fps)`)
  }

  return renderTime
}

// Animation frame rate testing
export const measureFrameRate = (duration: number = 1000): Promise<number> => {
  return new Promise((resolve) => {
    let frames = 0
    const startTime = performance.now()

    const frame = () => {
      frames++
      const elapsed = performance.now() - startTime

      if (elapsed < duration) {
        requestAnimationFrame(frame)
      } else {
        const fps = Math.round((frames * 1000) / elapsed)
        resolve(fps)
      }
    }

    requestAnimationFrame(frame)
  })
}
