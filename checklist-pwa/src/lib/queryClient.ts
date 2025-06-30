import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

// PWA-optimized QueryClient configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: Error & { status?: number }) => {
        if (error?.status === 404 || error?.status === 403) return false
        return failureCount < 3
      },
      networkMode: 'offlineFirst', // PWA requirement
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 1,
    },
  },
})

// PWA persistence setup
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'CHECKLIST_PWA_CACHE',
})

// Initialize persistence
void persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
})