/**
 * Currency Hook
 * 
 * Currency formatting utilities driven by the store's displayCurrency
 * 
 * @author Michele Miky Monti
 * @version 3.0.0
 */

import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useWealthStore } from '@/stores/wealthStore'

interface UseCurrencyReturn {
  format: (value: number) => string
  formatCompact: (value: number) => string
  formatWithSign: (value: number) => string
  parse: (value: string) => number
  currency: string
  symbol: string
  locale: string
}

const LOCALE_MAP: Record<string, string> = {
  it: 'it-IT',
  en: 'en-US',
  es: 'es-ES',
}

export function useCurrency(): UseCurrencyReturn {
  const { i18n } = useTranslation()
  const displayCurrency = useWealthStore((s) => s.displayCurrency)

  const locale = useMemo(
    () => LOCALE_MAP[i18n.language] || 'it-IT',
    [i18n.language]
  )

  const symbol = displayCurrency === 'EUR' ? '€' : '$'

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: displayCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    [locale, displayCurrency]
  )

  const compactFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: displayCurrency,
        notation: 'compact',
        compactDisplay: 'short',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }),
    [locale, displayCurrency]
  )

  const format = useCallback(
    (value: number) => formatter.format(value),
    [formatter]
  )

  const formatCompact = useCallback(
    (value: number) => compactFormatter.format(value),
    [compactFormatter]
  )

  const formatWithSign = useCallback(
    (value: number) => {
      const formatted = format(Math.abs(value))
      if (value > 0) return `+${formatted}`
      if (value < 0) return `-${formatted}`
      return formatted
    },
    [format]
  )

  const parse = useCallback((value: string): number => {
    let cleaned = value.replace(/[€$£¥]/g, '').replace(/\s/g, '')
    // Detect format: if string has both . and , check which is last (that's the decimal sep)
    const lastDot = cleaned.lastIndexOf('.')
    const lastComma = cleaned.lastIndexOf(',')
    if (lastComma > lastDot) {
      // European: 1.234,56
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else if (lastDot > lastComma) {
      // US: 1,234.56
      cleaned = cleaned.replace(/,/g, '')
    } else {
      cleaned = cleaned.replace(/,/g, '.')
    }
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }, [])

  return {
    format,
    formatCompact,
    formatWithSign,
    parse,
    currency: displayCurrency,
    symbol,
    locale,
  }
}
