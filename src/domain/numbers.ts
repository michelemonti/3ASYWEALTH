/**
 * Locale-aware number parsing and rounding.
 *
 * Parsing is strict: anything that is not unambiguously a number returns null,
 * so invalid input is reported instead of silently becoming zero.
 */

export type DecimalSeparator = '.' | ','

export function decimalSeparatorFor(locale: string): DecimalSeparator {
  const part = new Intl.NumberFormat(locale).formatToParts(1.5).find((p) => p.type === 'decimal')
  return part?.value === ',' ? ',' : '.'
}

const STRIP = /[\s\u00A0\u202F'’]|€|\$|eur|usd/gi

function validGrouping(intPart: string, sep: DecimalSeparator): boolean {
  const groups = intPart.split(sep)
  if (groups.length === 1) return /^\d*$/.test(intPart)
  const [first, ...rest] = groups
  return /^\d{1,3}$/.test(first ?? '') && rest.every((g) => /^\d{3}$/.test(g))
}

/**
 * Parse a human-entered decimal number such as "1.234,56", "1,234.56", "€ 300 000",
 * "12,5" or "-80000". `hint` is the decimal separator of the user's locale and is
 * only used for genuinely ambiguous input like "1.234" or "1,234".
 */
export function parseDecimal(input: string, hint: DecimalSeparator = ','): number | null {
  let s = input.trim().replace(STRIP, '')
  if (!s) return null

  let sign = 1
  if (s.startsWith('-') || s.startsWith('+')) {
    if (s.startsWith('-')) sign = -1
    s = s.slice(1)
  }
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return null

  const dots = s.split('.').length - 1
  const commas = s.split(',').length - 1
  let normalized: string

  if (dots === 0 && commas === 0) {
    normalized = s
  } else if (dots > 0 && commas > 0) {
    const decimal: DecimalSeparator = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ','
    const thousands: DecimalSeparator = decimal === '.' ? ',' : '.'
    const decimalCount = decimal === '.' ? dots : commas
    if (decimalCount !== 1) return null
    const [intPart = '', frac = ''] = s.split(decimal)
    if (!validGrouping(intPart, thousands) || !/^\d*$/.test(frac)) return null
    normalized = `${intPart.split(thousands).join('')}.${frac}`
  } else {
    const sep: DecimalSeparator = dots > 0 ? '.' : ','
    const count = Math.max(dots, commas)
    if (count > 1) {
      if (!validGrouping(s, sep)) return null
      normalized = s.split(sep).join('')
    } else {
      const [intPart = '', frac = ''] = s.split(sep)
      const ambiguous = frac.length === 3 && /^[1-9]\d{0,2}$/.test(intPart)
      const isDecimal = ambiguous ? sep === hint : true
      normalized = isDecimal ? `${intPart}.${frac}` : `${intPart}${frac}`
    }
  }

  if (normalized.startsWith('.')) normalized = `0${normalized}`
  if (normalized.endsWith('.')) normalized = normalized.slice(0, -1)
  const value = sign * Number(normalized)
  return Number.isFinite(value) ? value : null
}

/** Round half away from zero to 2 decimals, avoiding binary artefacts (1.005 → 1.01). */
export function roundCents(value: number): number {
  if (!Number.isFinite(value)) return value
  const sign = value < 0 ? -1 : 1
  const rounded = Number(`${Math.round(Number(`${Math.abs(value)}e2`))}e-2`)
  return rounded === 0 ? 0 : sign * rounded
}

/** Format a stored number for an editable text field in the user's locale (no grouping). */
export function toInputString(value: number, locale: string, maxDigits = 2): string {
  return new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: maxDigits }).format(value)
}

export type AmountError = 'required' | 'invalid' | 'negative' | 'zero'

/** Validate a money amount entered by the user: must be a finite number ≥ 0 (or > 0). */
export function parseAmount(
  input: string,
  hint: DecimalSeparator,
  { allowZero = true }: { allowZero?: boolean } = {},
): { value: number } | { error: AmountError } {
  if (!input.trim()) return { error: 'required' }
  const n = parseDecimal(input, hint)
  if (n === null) return { error: 'invalid' }
  if (n < 0) return { error: 'negative' }
  if (n === 0 && !allowZero) return { error: 'zero' }
  return { value: roundCents(n) }
}

export type PercentError = 'required' | 'invalid' | 'range'

export function parsePercent(input: string, hint: DecimalSeparator): { value: number } | { error: PercentError } {
  const s = input.trim().replace(/%$/, '')
  if (!s) return { error: 'required' }
  const n = parseDecimal(s, hint)
  if (n === null) return { error: 'invalid' }
  if (n <= 0 || n > 100) return { error: 'range' }
  return { value: Math.round(n * 10000) / 10000 }
}

export type RateError = 'required' | 'invalid' | 'range'

export function parseRate(input: string, hint: DecimalSeparator): { value: number } | { error: RateError } {
  if (!input.trim()) return { error: 'required' }
  const n = parseDecimal(input, hint)
  if (n === null) return { error: 'invalid' }
  if (!isValidRate(n)) return { error: 'range' }
  return { value: n }
}

export const isValidRate = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/** Local calendar date as YYYY-MM-DD. */
export function todayISODate(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isISODate(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const [y, m, d] = v.split('-').map(Number) as [number, number, number]
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

export function isISODateTime(v: unknown): v is string {
  return typeof v === 'string' && !Number.isNaN(Date.parse(v)) && /^\d{4}-\d{2}-\d{2}T/.test(v)
}

/** Parse a YYYY-MM-DD date as a local calendar date (avoids UTC off-by-one). */
export function dateFromISODate(v: string): Date {
  const [y, m, d] = v.split('-').map(Number) as [number, number, number]
  return new Date(y, m - 1, d)
}
