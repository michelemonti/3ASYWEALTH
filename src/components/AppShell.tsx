import { History, LayoutDashboard, Layers, SlidersHorizontal } from 'lucide-react'
import { lazy, Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BrandMark } from './Brand'
import { HideAmountsToggle } from './HideAmountsToggle'
import { LanguageSwitcher } from './LanguageSwitcher'
import { RateDialog } from './RateDialog'
import { StatusBanners } from './StatusBanners'
import { ThemeToggle } from './ThemeToggle'
import { useThemeSync } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { useUi } from '@/stores/uiStore'
import { wealthStore } from '@/stores/wealthStore'
import { DATA_KEY } from '@/lib/storage'
import { toast } from 'sonner'

const ItemDialog = lazy(() => import('./ItemDialog'))

const NAV = [
  { to: '/', key: 'overview', icon: LayoutDashboard, end: true },
  { to: '/holdings', key: 'holdings', icon: Layers, end: false },
  { to: '/history', key: 'history', icon: History, end: false },
  { to: '/data', key: 'data', icon: SlidersHorizontal, end: false },
] as const

function useScrollTopOnNavigate() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
}

/** Another tab saved newer data: load it instead of later overwriting it with a stale copy. */
function useCrossTabSync() {
  const { t } = useTranslation()
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== DATA_KEY && e.key !== null) return
      if (wealthStore.getState().syncFromStorage()) toast.info(t('sync.updated'))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [t])
}

export function AppShell() {
  const { t } = useTranslation()
  const itemOpen = useUi((s) => s.item.open)
  useThemeSync()
  useScrollTopOnNavigate()
  useCrossTabSync()

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-[60] rounded-lg bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        {t('nav.skip')}
      </a>

      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="container flex h-14 items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2 rounded-lg" aria-label={t('nav.home')}>
            <BrandMark />
            <span className="hidden font-semibold tracking-tight sm:inline">3ASYWEALTH</span>
          </NavLink>
          <nav aria-label={t('nav.main')} className="ml-4 hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV.map(({ to, key, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        'flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                        isActive && 'bg-muted text-foreground',
                      )
                    }
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {t(`nav.${key}`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-0.5">
            <HideAmountsToggle />
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="container flex-1 pb-28 pt-5 outline-none sm:pt-8 md:pb-12">
        <div className="mb-5 empty:hidden">
          <StatusBanners />
        </div>
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted/60" aria-hidden />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="hidden border-t md:block">
        <div className="container flex flex-wrap items-center justify-between gap-2 py-5 text-xs text-muted-foreground">
          <p>{t('footer.local')}</p>
          <p>
            <a href="https://www.3asy.app" className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              3ASY.APP
            </a>{' '}
            · {t('footer.license')} ·{' '}
            <a
              href="https://github.com/michelemonti"
              className="underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Miky Monti
            </a>
          </p>
        </div>
      </footer>

      <nav
        aria-label={t('nav.main')}
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-4">
          {NAV.map(({ to, key, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground',
                    isActive && 'text-primary',
                  )
                }
              >
                <Icon className="h-5 w-5" aria-hidden />
                {t(`nav.${key}`)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <RateDialog />
      {itemOpen && (
        <Suspense fallback={null}>
          <ItemDialog />
        </Suspense>
      )}
    </div>
  )
}
