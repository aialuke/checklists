// ============================================
// TANSTACK QUERY MIGRATION - COMPLETE REPLACEMENT
// ============================================
// This file has been completely replaced to prevent
// TanStack Query migration complete - no legacy Zustand re-exports
// ============================================

// Client-side state (UI-only, keep Zustand for these)
export { useNotificationClientStore } from './notificationClientStore'

// Server state is now handled by TanStack Query
// Import from queries/ directory instead:
// - Auth: import from '../queries/authQueries'
// - Checklists: import from '../queries/checklistQueries'
// - Notifications: import from '../queries/notificationQueries'
// - Offline: import from '../queries/offlineQueries'

// Types moved to dedicated directory
// Import from '../types' instead of '../stores/types'

// Migration utilities (temporary, remove after migration)
export const MIGRATION_STATUS = {
  phase: 'PHASE_5_COMPLETE',
  tanstackQueryActive: true,
  zustandLegacyDisabled: true,
  completedDate: new Date().toISOString(),
} as const

// Prevent accidental legacy imports
export const LEGACY_IMPORTS_DISABLED = true

// Development debugging (only available in dev)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  ;(window as any).MIGRATION_STATUS = MIGRATION_STATUS
  console.log('🚀 TanStack Query Migration Phase 5 Complete!')
  console.log('📊 Legacy Zustand server state disabled')
  console.log('✅ Use queries/ directory for server state')
}