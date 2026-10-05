/**
 * Domain model for 3ASYWEALTH.
 *
 * Everything persisted is plain JSON: dates are ISO strings, amounts are numbers
 * in the item's original currency. Display conversion never mutates stored data.
 */

export const CURRENCIES = ['EUR', 'USD'] as const
export type Currency = (typeof CURRENCIES)[number]

export const ASSET_CATEGORIES = ['cash', 'investments', 'business', 'realestate', 'personal'] as const
export type AssetCategory = (typeof ASSET_CATEGORIES)[number]

/**
 * How the entered amount relates to the person:
 * - `share`: the amount is already the person's own portion.
 * - `whole`: the amount is the value of the whole item; `ownershipPercent` applies.
 */
export type ValueBasis = 'share' | 'whole'

export interface Asset {
  id: string
  name: string
  category: AssetCategory
  currency: Currency
  amount: number
  valueBasis: ValueBasis
  /** 0 < p ≤ 100. Only meaningful when valueBasis is `whole`. */
  ownershipPercent: number
  /** YYYY-MM-DD */
  valuationDate: string
  notes: string
  source: string
  /** Free-text ownership from v1 data, kept for the user to review. Never used in calculations. */
  legacyOwnership?: string
  createdAt: string
  updatedAt: string
}

export interface Liability {
  id: string
  name: string
  currency: Currency
  /** Outstanding amount personally owed (already the person's share). */
  amount: number
  /** Informational only: never causes a second subtraction. */
  linkedAssetId?: string
  /** YYYY-MM-DD */
  valuationDate: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Settings {
  displayCurrency: Currency
  /** Manual EUR→USD rate: 1 EUR = eurUsdRate USD. null until the person sets one. */
  eurUsdRate: number | null
  /** YYYY-MM-DD the rate was set, null when unknown (e.g. migrated from v1). */
  eurUsdRateDate: string | null
}

export interface SnapshotTotals {
  assets: number
  liabilities: number
  netWorth: number
  liquidity: number
  byCategory: Record<AssetCategory, number>
}

/** Immutable, dated copy of the workspace at a point in time. */
export interface Snapshot {
  id: string
  createdAt: string
  note: string
  currency: Currency
  eurUsdRate: number | null
  totals: SnapshotTotals
  assets: Asset[]
  liabilities: Liability[]
}

export interface Workspace {
  assets: Asset[]
  liabilities: Liability[]
  snapshots: Snapshot[]
  settings: Settings
}

export const SCHEMA_VERSION = 2

export const emptySettings = (): Settings => ({
  displayCurrency: 'EUR',
  eurUsdRate: null,
  eurUsdRateDate: null,
})

export const emptyWorkspace = (): Workspace => ({
  assets: [],
  liabilities: [],
  snapshots: [],
  settings: emptySettings(),
})

export const isCurrency = (v: unknown): v is Currency =>
  typeof v === 'string' && (CURRENCIES as readonly string[]).includes(v)

export const isAssetCategory = (v: unknown): v is AssetCategory =>
  typeof v === 'string' && (ASSET_CATEGORIES as readonly string[]).includes(v)
