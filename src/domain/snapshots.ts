/**
 * Snapshots ("fotografie"): immutable, dated copies of the workspace.
 *
 * Currency convention: totals are stored in the currency that was displayed when
 * the snapshot was taken, together with the exchange rate in force at that time.
 * To show a snapshot in another currency we convert its stored totals with *its own*
 * recorded rate. Changing today's rate or display currency never rewrites the past.
 */

import { convert, snapshotTotalsFrom, summarize } from './calc'
import { roundCents } from './numbers'
import type { Currency, Snapshot, SnapshotTotals, Workspace } from './types'

export function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const v of Object.values(value as Record<string, unknown>)) deepFreeze(v)
  }
  return value
}

export type CreateSnapshotResult = { ok: true; snapshot: Snapshot } | { ok: false; reason: 'empty' | 'missingRate' }

export function createSnapshot(
  ws: Pick<Workspace, 'assets' | 'liabilities' | 'settings'>,
  { id, now, note = '' }: { id: string; now: Date; note?: string },
): CreateSnapshotResult {
  if (ws.assets.length === 0 && ws.liabilities.length === 0) return { ok: false, reason: 'empty' }
  const summary = summarize(ws)
  if (summary.missingRate > 0) return { ok: false, reason: 'missingRate' }
  const snapshot: Snapshot = {
    id,
    createdAt: now.toISOString(),
    note: note.trim(),
    currency: summary.currency,
    eurUsdRate: ws.settings.eurUsdRate,
    totals: snapshotTotalsFrom(summary),
    assets: structuredClone(ws.assets),
    liabilities: structuredClone(ws.liabilities),
  }
  return { ok: true, snapshot: deepFreeze(snapshot) }
}

/** Snapshot totals expressed in `currency` using the snapshot's own rate; null if not convertible. */
export function snapshotTotalsIn(snapshot: Snapshot, currency: Currency): SnapshotTotals | null {
  if (snapshot.currency === currency) return snapshot.totals
  const c = (n: number) => {
    const v = convert(n, snapshot.currency, currency, snapshot.eurUsdRate)
    return v === null ? null : roundCents(v)
  }
  const assets = c(snapshot.totals.assets)
  const liabilities = c(snapshot.totals.liabilities)
  const liquidity = c(snapshot.totals.liquidity)
  if (assets === null || liabilities === null || liquidity === null) return null
  const byCategory = { ...snapshot.totals.byCategory }
  for (const key of Object.keys(byCategory) as Array<keyof typeof byCategory>) {
    byCategory[key] = c(byCategory[key]) ?? 0
  }
  return { assets, liabilities, liquidity, netWorth: roundCents(assets - liabilities), byCategory }
}

export function sortSnapshots(snapshots: readonly Snapshot[]): Snapshot[] {
  return [...snapshots].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export interface SnapshotDiff {
  assets: number
  liabilities: number
  netWorth: number
}

/** Difference between two snapshots in `currency`. A change in value, not a financial return. */
export function diffSnapshots(previous: Snapshot, next: Snapshot, currency: Currency): SnapshotDiff | null {
  const a = snapshotTotalsIn(previous, currency)
  const b = snapshotTotalsIn(next, currency)
  if (!a || !b) return null
  return {
    assets: roundCents(b.assets - a.assets),
    liabilities: roundCents(b.liabilities - a.liabilities),
    netWorth: roundCents(b.netWorth - a.netWorth),
  }
}
