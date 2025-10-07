/**
 * Main App Component
 * 
 * Simple routing for 3ASYWEALTH
 * 
 * @version 1.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ErrorBoundary } from './components/ErrorBoundary'
import Landing from './pages/Landing'
import { WealthDashboard } from './pages/WealthDashboard'
import NotFound from './pages/NotFound'

// App Component
const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<WealthDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>

    {/* Toast Notifications */}
    <Toaster position="top-right" richColors />
  </ErrorBoundary>
)

export default App
