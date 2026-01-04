/**
 * Currency Hook
 * 
 * Currency formatting utilities with locale support
 * 
 * @author Michele Miky Monti
 * @version 2.0.0
 */

import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface UseCurrencyOptions {
  currency?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  compact?: boolean
}

interface UseCurrencyReturn {
  format: (value: number) => string
  formatCompact: (value: number) => string
  formatWithSign: (value: number) => string
  parse: (value: string) => number
  currency: string
  locale: string
}

const LOCALE_MAP: Record<string, string> = {
  it: 'it-IT',
  en: 'en-US',
  es: 'es-ES',
}

const CURRENCY_MAP: Record<string, string> = {
  it: 'EUR',
  en: 'USD',
  es: 'EUR',
}

export function useCurrency(options: UseCurrencyOptions = {}): UseCurrencyReturn {
  const { i18n } = useTranslation()
  
  const locale = useMemo(() => 
    LOCALE_MAP[i18n.language] || 'it-IT'
  , [i18n.language])
  
  const currency = useMemo(() => 
    options.currency || CURRENCY_MAP[i18n.language] || 'EUR'
  , [options.currency, i18n.language])

  const formatter = useMemo(() => 
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: options.minimumFractionDigits ?? 0,
      maximumFractionDigits: options.maximumFractionDigits ?? 0,
    })
  , [locale, currency, options.minimumFractionDigits, options.maximumFractionDigits])

  const compactFormatter = useMemo(() => 
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      compactDisplay: 'short',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })
  , [locale, currency])

  const format = useCallback((value: number) => 
    formatter.format(value)
  , [formatter])

  const formatCompact = useCallback((value: number) => 
    compactFormatter.format(value)
  , [compactFormatter])

  const formatWithSign = useCallback((value: number) => {
    const formatted = format(Math.abs(value))
    if (value > 0) return `+${formatted}`
    if (value < 0) return `-${formatted}`
    return formatted
  }, [format])

  const parse = useCallback((value: string): number => {
    // Remove currency symbols and formatting
    const cleaned = value
      .replace(/[€$£¥]/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '') // Remove thousand separators (IT)
      .replace(/,/g, '.') // Convert decimal separator (IT)
    
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }, [])

  return {
    format,
    formatCompact,
    formatWithSign,
    parse,
    currency,
    locale,
  }
}
