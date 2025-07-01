'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useState, useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry: 3,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 3,
        // Persist mutations for offline support
        networkMode: 'offlineFirst',
      },
    },
  }));

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined') {
      const persister = createSyncStoragePersister({
        storage: window.localStorage,
        key: 'jb-checklists-cache',
      });

      persistQueryClient({
        queryClient,
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      });
    }
  }, [queryClient]);

  if (!isClient) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
