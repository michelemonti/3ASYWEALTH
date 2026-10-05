import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Toaster, type ToasterProps } from 'sonner'
import { AppShell } from './components/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useTheme } from './hooks/useTheme'
import Overview from './pages/Overview'

const Holdings = lazy(() => import('./pages/Holdings'))
const History = lazy(() => import('./pages/History'))
const DataSettings = lazy(() => import('./pages/DataSettings'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageFallback() {
  return <div className="h-40 animate-pulse rounded-xl bg-muted/60" aria-hidden />
}

// Supported by sonner at runtime but missing from its 1.x type definitions.
type LabelledToasterProps = ToasterProps & { containerAriaLabel?: string }

function ThemedToaster() {
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const props: LabelledToasterProps = {
    position: 'bottom-center',
    theme: resolvedTheme,
    offset: 88,
    toastOptions: { duration: 6000 },
    containerAriaLabel: t('common.notifications'),
  }
  return <Toaster {...props} />
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Overview />} />
              <Route path="holdings" element={<Holdings />} />
              <Route path="history" element={<History />} />
              <Route path="data" element={<DataSettings />} />
              {/* v1 routes */}
              <Route path="assets" element={<Navigate to="/holdings" replace />} />
              <Route path="summary" element={<Navigate to="/" replace />} />
              <Route path="about" element={<Navigate to="/data#about" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      <ThemedToaster />
    </ErrorBoundary>
  )
}
