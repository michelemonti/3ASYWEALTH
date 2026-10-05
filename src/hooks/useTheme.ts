import { useEffect } from 'react'
import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

const THEME_KEY = '3asywealth-theme'
const media = () => (typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null)

function readStored(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    /* storage unavailable */
  }
  return 'system'
}

const resolve = (theme: Theme): 'light' | 'dark' => (theme === 'system' ? (media()?.matches ? 'dark' : 'light') : theme)

function apply(resolved: 'light' | 'dark') {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
}

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  syncSystem: () => void
}

const useThemeStore = create<ThemeState>()((set, get) => ({
  theme: readStored(),
  resolvedTheme: resolve(readStored()),
  setTheme: (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* ignore */
    }
    const resolvedTheme = resolve(theme)
    apply(resolvedTheme)
    set({ theme, resolvedTheme })
  },
  syncSystem: () => {
    if (get().theme !== 'system') return
    const resolvedTheme = resolve('system')
    apply(resolvedTheme)
    set({ resolvedTheme })
  },
}))

/** Mount once (in the app shell) to follow the OS preference when theme = system. */
export function useThemeSync() {
  const syncSystem = useThemeStore((s) => s.syncSystem)
  useEffect(() => {
    apply(useThemeStore.getState().resolvedTheme)
    const mq = media()
    mq?.addEventListener('change', syncSystem)
    return () => mq?.removeEventListener('change', syncSystem)
  }, [syncSystem])
}

export function useTheme() {
  const theme = useThemeStore((s) => s.theme)
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme)
  const setTheme = useThemeStore((s) => s.setTheme)
  return { theme, resolvedTheme, setTheme }
}
