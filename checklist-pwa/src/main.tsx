import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import './index.css'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'
import { QuerySuspenseBoundary, GlobalQueryIndicator } from './components/TanStackSuspense'
import { setupNetworkListeners } from './queries/offlineQueries'

// App wrapper with suspense and offline setup
const AppWrapper = () => {
  useEffect(() => {
    // Set up network listeners for offline functionality
    const cleanup = setupNetworkListeners()
    return cleanup
  }, [])

  return (
    <QuerySuspenseBoundary>
      <App />
      <GlobalQueryIndicator />
    </QuerySuspenseBoundary>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppWrapper />
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  </StrictMode>,
)
