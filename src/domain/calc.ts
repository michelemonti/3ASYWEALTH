/**
 * Single source of truth for every number shown in the app: dashboard, holdings
 * table, charts, simulations, snapshots and PDF all go through `summarize`.
 *
 * Rounding convention: each item is converted to the display currency and rounded
 * to cents once; totals are the sum of those rounded item values. This way the rows
 * of any table always add up exactly to the totals shown elsewhere.
 */

import {
  ASSET_CATEGORIES,
  type Asset,
  type AssetCategory,
  type Currency,
  type Liability,
  type Settings,
  type SnapshotTotals,
} from './types'
import { isValidRate, roundCents } from './numbers'

/** Convert between EUR and USD with a manual rate (1 EUR = rate USD). null if impossible. */
export function convert(amount: number, from: Currency, to: Currency, eurUsdRate: number | null): number | null {
  if (from === to) return amount
  if (!isValidRate(eurUsdRate)) return null
  return from === 'EUR' ? amount * eurUsdRate : amount / eurUsdRate
}

/** Portion of the asset attributed to the person, in the asset's own currency (unrounded). */
export function personalAmount(asset: Pick<Asset, 'amount' | 'valueBasis' | 'ownershipPercent'>): number {
  return asset.valueBasis === 'whole' ? (asset.amount * asset.ownershipPercent) / 100 : asset.amount
}

export interface ValuedAsset {
  item: Asset
  /** Attributed value in the asset's currency. */
  personal: number
  /** Attributed value in the display currency, rounded to cents. null if the rate is missing. */
  value: number | null
}

export interface ValuedLiability {
  item: Liability
  value: number | null
}

export interface CategoryTotal {
  category: AssetCategory
  total: number
  count: number
  /** Percentage of total assets (never of net worth). */
  shareOfAssets: number
}

export interface Summary {
  currency: Currency
  eurUsdRate: number | null
  assets: ValuedAsset[]
  liabilities: ValuedLiability[]
  totals: {
    assets: number
    liabilities: number
    netWorth: number
    /** Only the `cash` category: money that is actually available. */
    liquidity: number
  }
  byCategory: CategoryTotal[]
  /** Items that could not be converted because no exchange rate is set. */
  missingRate: number
  /** Latest edit time of any asset or liability (ISO), null when empty. */
  lastUpdated: string | null
  /** Oldest valuation date among items (YYYY-MM-DD), null when empty. */
  oldestValuation: string | null
}

export interface SummaryInput {
  assets: Asset[]
  liabilities: Liability[]
  settings: Pick<Settings, 'displayCurrency' | 'eurUsdRate'>
}

export function summarize(input: SummaryInput, currency: Currency = input.settings.displayCurrency): Summary {
  const rate = input.settings.eurUsdRate
  let missingRate = 0

  const toDisplay = (amount: number, from: Currency): number | null => {
    const converted = convert(amount, from, currency, rate)
    if (converted === null) {
      missingRate += 1
      return null
    }
    return roundCents(converted)
  }

  const assets: ValuedAsset[] = input.assets.map((item) => {
    const personal = personalAmount(item)
    return { item, personal, value: toDisplay(personal, item.currency) }
  })
  const liabilities: ValuedLiability[] = input.liabilities.map((item) => ({
    item,
    value: toDisplay(item.amount, item.currency),
  }))

  const sum = (values: Array<number | null>) => roundCents(values.reduce<number>((acc, v) => acc + (v ?? 0), 0))

  const assetsTotal = sum(assets.map((a) => a.value))
  const liabilitiesTotal = sum(liabilities.map((l) => l.value))

  const byCategory: CategoryTotal[] = ASSET_CATEGORIES.map((category) => {
    const inCategory = assets.filter((a) => a.item.category === category)
    const total = sum(inCategory.map((a) => a.value))
    return {
      category,
      total,
      count: inCategory.length,
      shareOfAssets: assetsTotal > 0 ? (total / assetsTotal) * 100 : 0,
    }
  })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.total - a.total)

  const liquidity = byCategory.find((c) => c.category === 'cash')?.total ?? 0

  const all = [...input.assets, ...input.liabilities]
  const lastUpdated = all.reduce<string | null>((max, i) => (max === null || i.updatedAt > max ? i.updatedAt : max), null)
  const oldestValuation = all.reduce<string | null>(
    (min, i) => (min === null || i.valuationDate < min ? i.valuationDate : min),
    null,
  )

  return {
    currency,
    eurUsdRate: rate,
    assets,
    liabilities,
    totals: {
      assets: assetsTotal,
      liabilities: liabilitiesTotal,
      netWorth: roundCents(assetsTotal - liabilitiesTotal),
      liquidity,
    },
    byCategory,
    missingRate,
    lastUpdated,
    oldestValuation,
  }
}

/** Top assets by attributed display value. */
export function topAssets(summary: Summary, limit = 5): ValuedAsset[] {
  return [...summary.assets]
    .filter((a) => a.value !== null)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    .slice(0, limit)
}

export function snapshotTotalsFrom(summary: Summary): SnapshotTotals {
  const byCategory = Object.fromEntries(ASSET_CATEGORIES.map((c) => [c, 0])) as Record<AssetCategory, number>
  for (const c of summary.byCategory) byCategory[c.category] = c.total
  return {
    assets: summary.totals.assets,
    liabilities: summary.totals.liabilities,
    netWorth: summary.totals.netWorth,
    liquidity: summary.totals.liquidity,
    byCategory,
  }
}

/** Whether the data needs an exchange rate to be shown in `currency`. */
export function needsRate(input: Pick<SummaryInput, 'assets' | 'liabilities'>, currency: Currency): boolean {
  return [...input.assets, ...input.liabilities].some((i) => i.currency !== currency)
}

// Summaries are recomputed only when the underlying arrays/settings change.
const cache = new WeakMap<object, Map<string, Summary>>()

export function summarizeCached(input: SummaryInput, currency: Currency = input.settings.displayCurrency): Summary {
  const key = `${currency}|${input.settings.eurUsdRate ?? ''}`
  const holder = input as object
  let byKey = cache.get(holder)
  if (!byKey) {
    byKey = new Map()
    cache.set(holder, byKey)
  }
  let result = byKey.get(key)
  if (!result) {
    result = summarize(input, currency)
    byKey.set(key, result)
  }
  return result
}
