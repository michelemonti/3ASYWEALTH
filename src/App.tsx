/**
 * Main App Component
 * 
 * Lazy-loaded routing for 3ASYWEALTH
 * 
 * @version 2.0
 */

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ErrorBoundary } from './components/ErrorBoundary'

const Landing = lazy(() => import('./pages/Landing'))
const AssetsTable = lazy(() => import('./pages/AssetsTable'))
const WealthSummary = lazy(() => import('./pages/WealthSummary'))
const About = lazy(() => import('./pages/About'))
const NotFound = lazy(() => import('./pages/NotFound'))

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg mx-auto animate-pulse">
            <span className="text-white font-bold text-xl">3W</span>
          </div>
        </div>
        <div className="h-1 w-32 mx-auto rounded-full bg-muted overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-shimmer" />
        </div>
      </div>
    </div>
  )
}

// App Component
const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/assets" element={<AssetsTable />} />
          <Route path="/summary" element={<WealthSummary />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>

    {/* Toast Notifications */}
    <Toaster position="top-right" richColors closeButton />
  </ErrorBoundary>
)

export default App
