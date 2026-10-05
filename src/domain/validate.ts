/**
 * Validation of untrusted data (localStorage, JSON backups) and migration of
 * v1 data into the v2 model.
 *
 * v1 migration rule: the old `value` is treated as the amount already attributed to
 * the person (valueBasis = 'share'), so previous totals are preserved exactly with
 * the same exchange rate. The old free-text `ownership` is kept as `legacyOwnership`
 * for the person to review, and never used to recalculate anything.
 */

import {
  isAssetCategory,
  isCurrency,
  SCHEMA_VERSION,
  type Asset,
  type AssetCategory,
  type Currency,
  type Liability,
  type Settings,
  type Snapshot,
  type SnapshotTotals,
  type Workspace,
  ASSET_CATEGORIES,
} from './types'
import { isISODate, isISODateTime, isValidRate, parseDecimal, roundCents, todayISODate } from './numbers'
import { deepFreeze } from './snapshots'

export type IssueField =
  | 'record'
  | 'name'
  | 'category'
  | 'currency'
  | 'amount'
  | 'percent'
  | 'date'
  | 'link'
  | 'snapshot'
  | 'settings'

export interface Issue {
  severity: 'error' | 'warning'
  kind: 'asset' | 'liability' | 'snapshot' | 'settings'
  index: number
  name?: string
  field: IssueField
}

export type DocumentSource = 'v2' | 'v1-storage' | 'v1-export' | 'v1-array'

export type ReadResult =
  | { ok: true; workspace: Workspace; issues: Issue[]; source: DocumentSource }
  | { ok: false; error: 'unrecognized' | 'newerVersion' }

interface Ctx {
  newId: () => string
  now: Date
}

const defaultCtx = (): Ctx => ({ newId: () => crypto.randomUUID(), now: new Date() })

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (v: unknown): string => (typeof v === 'string' ? v : '')

/** Category aliases accepted from v1 data, CSV headers and human input (EN/IT/ES). */
const CATEGORY_ALIASES: Record<string, AssetCategory> = {
  cash: 'cash',
  liquidity: 'cash',
  liquid: 'cash',
  'liquidità': 'cash',
  liquidita: 'cash',
  liquidez: 'cash',
  'cash & accounts': 'cash',
  investments: 'investments',
  investment: 'investments',
  investimenti: 'investments',
  inversiones: 'investments',
  business: 'business',
  shareholdings: 'business',
  holdings: 'business',
  shares: 'business',
  equity: 'business',
  partecipazioni: 'business',
  'partecipazioni societarie': 'business',
  participaciones: 'business',
  'participaciones societarias': 'business',
  'business stakes': 'business',
  realestate: 'realestate',
  'real estate': 'realestate',
  property: 'realestate',
  immobili: 'realestate',
  inmuebles: 'realestate',
  'bienes raíces': 'realestate',
  'bienes raices': 'realestate',
  personal: 'personal',
  personalassets: 'personal',
  'personal assets': 'personal',
  'personal belongings': 'personal',
  assets: 'personal',
  'beni personali': 'personal',
  'activos personales': 'personal',
  'bienes personales': 'personal',
}

export function parseCategoryAlias(value: string): AssetCategory | null {
  return CATEGORY_ALIASES[value.trim().toLowerCase()] ?? null
}

function toNumber(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'string') return parseDecimal(v, '.')
  return null
}

function isoDateTimeOr(v: unknown, fallback: string): string {
  if (isISODateTime(v)) return new Date(v).toISOString()
  if (typeof v === 'string' || typeof v === 'number' || v instanceof Date) {
    const d = new Date(v)
    if (!Number.isNaN(d.getTime())) return d.toISOString()
  }
  return fallback
}

function uniqueIds<T extends { id: string }>(items: T[], ctx: Ctx, taken = new Set<string>()): Map<string, string> {
  const renamed = new Map<string, string>()
  for (const item of items) {
    if (!item.id || taken.has(item.id)) {
      const next = ctx.newId()
      renamed.set(item.id, next)
      item.id = next
    }
    taken.add(item.id)
  }
  return renamed
}

// ---------------------------------------------------------------------------
// v2
// ---------------------------------------------------------------------------

function parseAssetV2(raw: unknown, index: number, ctx: Ctx, issues: Issue[], kind: Issue['kind'] = 'asset'): Asset | null {
  const fail = (field: IssueField, name?: string) => {
    issues.push({ severity: 'error', kind, index, name, field })
    return null
  }
  if (!isRecord(raw)) return fail('record')
  const name = str(raw.name).trim()
  if (!name) return fail('name')
  if (!isAssetCategory(raw.category)) return fail('category', name)
  if (!isCurrency(raw.currency)) return fail('currency', name)
  const amount = toNumber(raw.amount)
  if (amount === null || amount < 0) return fail('amount', name)
  const valueBasis = raw.valueBasis === 'whole' ? 'whole' : raw.valueBasis === 'share' ? 'share' : null
  if (!valueBasis) return fail('percent', name)
  const pct = toNumber(raw.ownershipPercent)
  const ownershipPercent = valueBasis === 'share' ? 100 : pct
  if (ownershipPercent === null || ownershipPercent <= 0 || ownershipPercent > 100) return fail('percent', name)
  if (!isISODate(raw.valuationDate)) return fail('date', name)
  const nowIso = ctx.now.toISOString()
  const asset: Asset = {
    id: str(raw.id),
    name,
    category: raw.category,
    currency: raw.currency,
    amount: roundCents(amount),
    valueBasis,
    ownershipPercent,
    valuationDate: raw.valuationDate,
    notes: str(raw.notes),
    source: str(raw.source),
    createdAt: isoDateTimeOr(raw.createdAt, nowIso),
    updatedAt: isoDateTimeOr(raw.updatedAt, nowIso),
  }
  const legacy = str(raw.legacyOwnership).trim()
  if (legacy) asset.legacyOwnership = legacy
  return asset
}

function parseLiabilityV2(raw: unknown, index: number, ctx: Ctx, issues: Issue[]): Liability | null {
  const fail = (field: IssueField, name?: string) => {
    issues.push({ severity: 'error', kind: 'liability', index, name, field })
    return null
  }
  if (!isRecord(raw)) return fail('record')
  const name = str(raw.name).trim()
  if (!name) return fail('name')
  if (!isCurrency(raw.currency)) return fail('currency', name)
  const amount = toNumber(raw.amount)
  if (amount === null || amount < 0) return fail('amount', name)
  if (!isISODate(raw.valuationDate)) return fail('date', name)
  const nowIso = ctx.now.toISOString()
  const liability: Liability = {
    id: str(raw.id),
    name,
    currency: raw.currency,
    amount: roundCents(amount),
    valuationDate: raw.valuationDate,
    notes: str(raw.notes),
    createdAt: isoDateTimeOr(raw.createdAt, nowIso),
    updatedAt: isoDateTimeOr(raw.updatedAt, nowIso),
  }
  const link = str(raw.linkedAssetId)
  if (link) liability.linkedAssetId = link
  return liability
}

function parseTotals(raw: unknown): SnapshotTotals | null {
  if (!isRecord(raw)) return null
  const nums = ['assets', 'liabilities', 'netWorth', 'liquidity'].map((k) => toNumber(raw[k]))
  if (nums.some((n) => n === null)) return null
  const [assets, liabilities, netWorth, liquidity] = nums as number[]
  const rawCats = isRecord(raw.byCategory) ? raw.byCategory : {}
  const byCategory = Object.fromEntries(
    ASSET_CATEGORIES.map((c) => [c, toNumber(rawCats[c]) ?? 0]),
  ) as Record<AssetCategory, number>
  return { assets: assets!, liabilities: liabilities!, netWorth: netWorth!, liquidity: liquidity!, byCategory }
}

function parseSnapshotV2(raw: unknown, index: number, ctx: Ctx, issues: Issue[]): Snapshot | null {
  const fail = () => {
    issues.push({ severity: 'error', kind: 'snapshot', index, field: 'snapshot' })
    return null
  }
  if (!isRecord(raw) || !isISODateTime(raw.createdAt) || !isCurrency(raw.currency)) return fail()
  const totals = parseTotals(raw.totals)
  if (!totals) return fail()
  const rate = raw.eurUsdRate === null || raw.eurUsdRate === undefined ? null : toNumber(raw.eurUsdRate)
  if (rate !== null && !isValidRate(rate)) return fail()
  const inner: Issue[] = []
  const assets = (Array.isArray(raw.assets) ? raw.assets : []).map((a, i) => parseAssetV2(a, i, ctx, inner, 'snapshot'))
  const liabilities = (Array.isArray(raw.liabilities) ? raw.liabilities : []).map((l, i) =>
    parseLiabilityV2(l, i, ctx, inner),
  )
  // A snapshot is a historical record: if any of its items is unreadable we do not alter it.
  if (inner.length > 0) return fail()
  return {
    id: str(raw.id),
    createdAt: new Date(raw.createdAt).toISOString(),
    note: str(raw.note),
    currency: raw.currency,
    eurUsdRate: rate,
    totals,
    assets: assets as Asset[],
    liabilities: liabilities as Liability[],
  }
}

function parseSettings(raw: unknown, issues: Issue[]): Settings {
  const r = isRecord(raw) ? raw : {}
  const displayCurrency: Currency = isCurrency(r.displayCurrency) ? r.displayCurrency : 'EUR'
  const rateRaw = r.eurUsdRate === null || r.eurUsdRate === undefined ? null : toNumber(r.eurUsdRate)
  let eurUsdRate: number | null = null
  if (rateRaw !== null) {
    if (isValidRate(rateRaw)) eurUsdRate = rateRaw
    else issues.push({ severity: 'warning', kind: 'settings', index: 0, field: 'settings' })
  }
  const eurUsdRateDate = eurUsdRate !== null && isISODate(r.eurUsdRateDate) ? r.eurUsdRateDate : null
  return { displayCurrency, eurUsdRate, eurUsdRateDate }
}

export function parseWorkspaceV2(raw: unknown, ctx: Ctx = defaultCtx()): { workspace: Workspace; issues: Issue[] } {
  const issues: Issue[] = []
  const r = isRecord(raw) ? raw : {}
  const assets = (Array.isArray(r.assets) ? r.assets : [])
    .map((a, i) => parseAssetV2(a, i, ctx, issues))
    .filter((a): a is Asset => a !== null)
  const liabilities = (Array.isArray(r.liabilities) ? r.liabilities : [])
    .map((l, i) => parseLiabilityV2(l, i, ctx, issues))
    .filter((l): l is Liability => l !== null)
  const snapshots = (Array.isArray(r.snapshots) ? r.snapshots : [])
    .map((s, i) => parseSnapshotV2(s, i, ctx, issues))
    .filter((s): s is Snapshot => s !== null)
  const settings = parseSettings(r.settings, issues)

  uniqueIds(assets, ctx)
  uniqueIds(liabilities, ctx)
  uniqueIds(snapshots, ctx)
  const assetIds = new Set(assets.map((a) => a.id))
  liabilities.forEach((l, index) => {
    if (l.linkedAssetId && !assetIds.has(l.linkedAssetId)) {
      delete l.linkedAssetId
      issues.push({ severity: 'warning', kind: 'liability', index, name: l.name, field: 'link' })
    }
  })
  snapshots.forEach(deepFreeze)
  return { workspace: { assets, liabilities, snapshots, settings }, issues }
}

// ---------------------------------------------------------------------------
// v1 → v2
// ---------------------------------------------------------------------------

export function migrateLegacy(
  raw: { assets: unknown[]; displayCurrency?: unknown; exchangeRate?: unknown },
  ctx: Ctx = defaultCtx(),
): { workspace: Workspace; issues: Issue[] } {
  const issues: Issue[] = []
  const displayCurrency: Currency = isCurrency(raw.displayCurrency) ? raw.displayCurrency : 'EUR'
  const rate = toNumber(raw.exchangeRate)
  const nowIso = ctx.now.toISOString()

  const assets: Asset[] = []
  raw.assets.forEach((item, index) => {
    const fail = (field: IssueField, name?: string) =>
      issues.push({ severity: 'error', kind: 'asset', index, name, field })
    if (!isRecord(item)) return fail('record')
    const name = str(item.name).trim()
    if (!name) return fail('name')
    const amount = toNumber(item.value ?? item.amount)
    if (amount === null || amount < 0) return fail('amount', name)
    let category = typeof item.category === 'string' ? parseCategoryAlias(item.category) : null
    if (!category) {
      category = 'personal'
      issues.push({ severity: 'warning', kind: 'asset', index, name, field: 'category' })
    }
    // v1 rendered assets without a currency in the current display currency.
    const currency: Currency = isCurrency(item.currency) ? item.currency : displayCurrency
    const updatedAt = isoDateTimeOr(item.updatedAt, nowIso)
    const ownership = str(item.ownership).trim()
    const asset: Asset = {
      id: str(item.id),
      name,
      category,
      currency,
      amount: roundCents(amount),
      valueBasis: 'share',
      ownershipPercent: 100,
      valuationDate: todayISODate(new Date(updatedAt)),
      notes: str(item.notes),
      source: str(item.source),
      createdAt: isoDateTimeOr(item.createdAt, updatedAt),
      updatedAt,
    }
    if (ownership && ownership !== '-') asset.legacyOwnership = ownership
    assets.push(asset)
  })
  uniqueIds(assets, ctx)

  return {
    workspace: {
      assets,
      liabilities: [],
      snapshots: [],
      settings: {
        displayCurrency,
        eurUsdRate: isValidRate(rate) ? rate : null,
        eurUsdRateDate: null,
      },
    },
    issues,
  }
}

// ---------------------------------------------------------------------------
// Document detection
// ---------------------------------------------------------------------------

export const APP_ID = '3asywealth'

export interface DocumentV2 {
  app: typeof APP_ID
  schemaVersion: number
  kind: 'storage' | 'backup'
  savedAt: string
  data: Workspace
}

export function toDocument(workspace: Workspace, kind: DocumentV2['kind'], now = new Date()): DocumentV2 {
  return { app: APP_ID, schemaVersion: SCHEMA_VERSION, kind, savedAt: now.toISOString(), data: workspace }
}

/** Read any supported document shape: v2 storage/backup, v1 persisted store, v1 export or bare array. */
export function readDocument(json: unknown, ctx: Ctx = defaultCtx()): ReadResult {
  if (Array.isArray(json)) {
    return { ok: true, ...migrateLegacy({ assets: json }, ctx), source: 'v1-array' }
  }
  if (!isRecord(json)) return { ok: false, error: 'unrecognized' }

  if (json.app === APP_ID && typeof json.schemaVersion === 'number') {
    if (json.schemaVersion > SCHEMA_VERSION) return { ok: false, error: 'newerVersion' }
    if (!isRecord(json.data)) return { ok: false, error: 'unrecognized' }
    return { ok: true, ...parseWorkspaceV2(json.data, ctx), source: 'v2' }
  }

  // zustand persist v1: { state: { assets, displayCurrency, exchangeRate }, version: 0 }
  if (isRecord(json.state) && Array.isArray(json.state.assets)) {
    const s = json.state
    return {
      ok: true,
      ...migrateLegacy({ assets: s.assets as unknown[], displayCurrency: s.displayCurrency, exchangeRate: s.exchangeRate }, ctx),
      source: 'v1-storage',
    }
  }

  // v1 JSON export: { assets, summary, version: '1.0.0', displayCurrency, exchangeRate }
  if (Array.isArray(json.assets)) {
    return {
      ok: true,
      ...migrateLegacy({ assets: json.assets, displayCurrency: json.displayCurrency, exchangeRate: json.exchangeRate }, ctx),
      source: 'v1-export',
    }
  }

  return { ok: false, error: 'unrecognized' }
}
