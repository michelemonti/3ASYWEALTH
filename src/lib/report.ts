/**
 * Report model for the PDF: plain data derived from the same `summarize` used by
 * every other view, so the PDF can never disagree with the screen.
 */

import { summarize, type Summary } from '@/domain/calc'
import type { AssetCategory, Currency, Workspace } from '@/domain/types'

export interface ReportModel {
  generatedAt: string
  currency: Currency
  eurUsdRate: number | null
  eurUsdRateDate: string | null
  lastUpdated: string | null
  oldestValuation: string | null
  missingRate: number
  totals: Summary['totals']
  categories: Array<{ category: AssetCategory; count: number; total: number; shareOfAssets: number }>
  assets: Array<{
    name: string
    category: AssetCategory
    currency: Currency
    amount: number
    ownershipPercent: number | null
    value: number | null
    valuationDate: string
  }>
  liabilities: Array<{
    name: string
    linkedTo: string | null
    currency: Currency
    amount: number
    value: number | null
    valuationDate: string
  }>
}

export function buildReportModel(ws: Workspace, now = new Date()): ReportModel {
  const s = summarize(ws)
  const names = new Map(ws.assets.map((a) => [a.id, a.name]))
  const byValue = <T extends { value: number | null }>(a: T, b: T) => (b.value ?? -Infinity) - (a.value ?? -Infinity)
  return {
    generatedAt: now.toISOString(),
    currency: s.currency,
    eurUsdRate: ws.settings.eurUsdRate,
    eurUsdRateDate: ws.settings.eurUsdRateDate,
    lastUpdated: s.lastUpdated,
    oldestValuation: s.oldestValuation,
    missingRate: s.missingRate,
    totals: s.totals,
    categories: s.byCategory.map(({ category, count, total, shareOfAssets }) => ({ category, count, total, shareOfAssets })),
    assets: s.assets
      .map(({ item, value }) => ({
        name: item.name,
        category: item.category,
        currency: item.currency,
        amount: item.amount,
        ownershipPercent: item.valueBasis === 'whole' ? item.ownershipPercent : null,
        value,
        valuationDate: item.valuationDate,
      }))
      .sort(byValue),
    liabilities: s.liabilities
      .map(({ item, value }) => ({
        name: item.name,
        linkedTo: item.linkedAssetId ? (names.get(item.linkedAssetId) ?? null) : null,
        currency: item.currency,
        amount: item.amount,
        value,
        valuationDate: item.valuationDate,
      }))
      .sort(byValue),
  }
}

/**
 * jsPDF's built-in fonts use WinAnsi encoding. Replace characters it cannot encode
 * so user text is printed as text (never interpreted), and unsupported glyphs
 * degrade to "?" instead of producing garbage.
 */
const WINANSI_EXTRA = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ')
export function toPdfText(value: string): string {
  const normalized = value
    .replace(/[\u202F\u2009\u2007]/g, ' ')
    .replace(/[\u2212]/g, '-')
    .replace(/\r\n?/g, '\n')
  return Array.from(normalized)
    .map((ch) => {
      const code = ch.codePointAt(0) ?? 0
      if (ch === '\n' || (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WINANSI_EXTRA.has(ch)) return ch
      return '?'
    })
    .join('')
}
