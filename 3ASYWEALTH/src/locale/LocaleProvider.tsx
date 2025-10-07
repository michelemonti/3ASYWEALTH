import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getDictionary, resolvePath, SupportedLocale } from './i18n'

interface LocaleContextValue {
  locale: SupportedLocale
  t: (key: string) => string
  setLocale: (l: SupportedLocale) => void
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

const LS_KEY = 'app.locale'
const DEFAULT_LOCALE: SupportedLocale = 'it'

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(DEFAULT_LOCALE)
  const [dict, setDict] = useState(getDictionary(DEFAULT_LOCALE))

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && (localStorage.getItem(LS_KEY) as SupportedLocale)) || undefined
    if (stored && (stored === 'it' || stored === 'en')) {
      setLocaleState(stored)
      setDict(getDictionary(stored))
    } else {
      // Try navigator
      const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'it'
      const candidate = nav === 'en' ? 'en' : 'it'
      setLocaleState(candidate)
      setDict(getDictionary(candidate))
    }
  }, [])

  const setLocale = useCallback((l: SupportedLocale) => {
    setLocaleState(l)
    setDict(getDictionary(l))
    try { localStorage.setItem(LS_KEY, l) } catch {}
  }, [])

  const t = useCallback((key: string) => {
    const value = resolvePath(dict, key)
    if (typeof value === 'string') return value
    return key // fallback show key path
  }, [dict])

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}

// Optional helper component for a simple toggle UI
export const LocaleToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { locale, setLocale } = useLocale()
  return (
    <button
      onClick={() => setLocale(locale === 'it' ? 'en' : 'it')}
      className={className || 'text-xs px-2 py-1 border rounded hover:bg-muted transition'}
      aria-label="Toggle language"
    >
      {locale === 'it' ? 'EN' : 'IT'}
    </button>
  )
}
