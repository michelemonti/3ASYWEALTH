import { Component, type ErrorInfo, type ReactNode } from 'react'
import i18n from '@/i18n/config'

interface State {
  error: Error | null
}

/** Last-resort fallback. Saved data lives in localStorage and is not touched by a render error. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info.componentStack)
  }

  override render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-dvh place-items-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">{i18n.t('errorBoundary.title')}</h1>
          <p className="mt-2 text-muted-foreground">{i18n.t('errorBoundary.body')}</p>
          {import.meta.env.DEV && <pre className="mt-4 overflow-auto rounded-lg bg-muted p-3 text-left text-xs">{String(this.state.error)}</pre>}
          <div className="mt-6 flex justify-center gap-3">
            <button className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground" onClick={() => window.location.reload()}>
              {i18n.t('errorBoundary.reload')}
            </button>
            <a className="grid h-10 place-items-center rounded-lg border px-4 text-sm font-medium" href="/data">
              {i18n.t('errorBoundary.data')}
            </a>
          </div>
        </div>
      </div>
    )
  }
}
