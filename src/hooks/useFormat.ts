import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { localeFor } from '@/i18n/config'
import { useSettings, useWealth } from '@/stores/wealthStore'
import { dateFromISODate, decimalSeparatorFor } from '@/domain/numbers'
import type { Currency } from '@/domain/types'

export const HIDDEN = '•••••'

export interface MoneyOptions {
  currency?: Currency
  /** Show cents. Overviews use whole units; detailed tables show cents. */
  cents?: boolean
  /** Prefix + for positive values (differences). */
  signed?: boolean
  compact?: boolean
  /** Ignore "hide amounts" (only for values the user is typing). */
  reveal?: boolean
}

export function useFormat() {
  const { i18n } = useTranslation()
  const locale = localeFor(i18n.language)
  const hidden = useWealth((s) => s.hideAmounts)
  const { displayCurrency } = useSettings()

  return useMemo(() => {
    const money = (value: number, o: MoneyOptions = {}) => {
      if (hidden && !o.reveal) return HIDDEN
      const fmt = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: o.currency ?? displayCurrency,
        notation: o.compact ? 'compact' : 'standard',
        minimumFractionDigits: o.compact ? 0 : o.cents ? 2 : 0,
        maximumFractionDigits: o.compact ? 1 : o.cents ? 2 : 0,
        signDisplay: o.signed ? 'exceptZero' : 'auto',
      })
      return fmt.format(value)
    }
    const percent = (value: number, digits = 1) =>
      new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: digits }).format(value / 100)
    const number = (value: number, digits = 4) =>
      new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)
    const date = (iso: string, style: 'medium' | 'long' = 'medium') =>
      new Intl.DateTimeFormat(locale, { dateStyle: style }).format(
        /^\d{4}-\d{2}-\d{2}$/.test(iso) ? dateFromISODate(iso) : new Date(iso),
      )
    const dateTime = (iso: string) =>
      new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))

    return {
      locale,
      hidden,
      currency: displayCurrency,
      decimal: decimalSeparatorFor(locale),
      dateOrder: (locale === 'en-US' ? 'mdy' : 'dmy') as 'mdy' | 'dmy',
      money,
      percent,
      number,
      date,
      dateTime,
    }
  }, [locale, hidden, displayCurrency])
}
