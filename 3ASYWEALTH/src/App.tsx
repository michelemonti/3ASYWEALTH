/**
 * Main App Component
 * 
 * Enhanced with Error Boundary and React Query provider.
 * 
 * @version 2.0 - Claude 4.5 Upgrade
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from './components/ErrorBoundary'
import { UnifiedAuthProvider } from './components/UnifiedAuthProvider'
import { LocaleProvider } from './locale/LocaleProvider'
import { Toaster } from 'sonner'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Subscribe from './pages/Subscribe'
import { LoginPage } from './pages/LoginPage'
import { Dashboard } from './pages/Dashboard'
import { WealthDashboard } from './pages/WealthDashboard'
import Landing from './pages/Landing'
import { ProtectedRoute } from './components/ProtectedRoute'

// React Query Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
})

// App Component
const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <BrowserRouter>
          <UnifiedAuthProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<WealthDashboard />} />
              <Route path="/subscribe" element={<Subscribe />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<LoginPage />} />
              <Route 
                path="/protected" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UnifiedAuthProvider>
        </BrowserRouter>
      </LocaleProvider>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />

      {/* Dev Tools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </ErrorBoundary>
)

export default App
