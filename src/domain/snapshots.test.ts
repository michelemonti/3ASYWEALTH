import { describe, expect, it } from 'vitest'
import { createSnapshot, diffSnapshots, snapshotTotalsIn } from './snapshots'
import { acceptanceWorkspace, asset, fixedNow, workspace } from '@/test/fixtures'

describe('snapshots', () => {
  it('stores totals, rate and a deep frozen copy of the data', () => {
    const ws = acceptanceWorkspace()
    const r = createSnapshot(ws, { id: 's1', now: fixedNow, note: '  primo  ' })
    if (!r.ok) throw new Error('expected ok')
    expect(r.snapshot.totals.netWorth).toBe(90000)
    expect(r.snapshot.createdAt).toBe(fixedNow.toISOString())
    expect(r.snapshot.note).toBe('primo')
    expect(Object.isFrozen(r.snapshot)).toBe(true)
    expect(Object.isFrozen(r.snapshot.assets[0])).toBe(true)
    expect(() => {
      ;(r.snapshot.assets[0] as { amount: number }).amount = 1
    }).toThrow()
  })

  it('later edits to the live data do not change the snapshot', () => {
    const ws = acceptanceWorkspace()
    const r = createSnapshot(ws, { id: 's1', now: fixedNow })
    if (!r.ok) throw new Error('expected ok')
    ws.assets[0]!.amount = 1
    expect(r.snapshot.assets[0]!.amount).toBe(300000)
  })

  it('is refused when empty or when a rate is missing', () => {
    expect(createSnapshot(workspace(), { id: 'x', now: fixedNow })).toEqual({ ok: false, reason: 'empty' })
    const usd = workspace({ assets: [asset({ name: 'x', amount: 1, currency: 'USD' })] })
    expect(createSnapshot(usd, { id: 'x', now: fixedNow })).toEqual({ ok: false, reason: 'missingRate' })
  })

  it('is shown in another currency with its own recorded rate, not today’s', () => {
    const ws = workspace({
      assets: [asset({ name: 'x', amount: 1000 })],
      settings: { displayCurrency: 'EUR', eurUsdRate: 1.2, eurUsdRateDate: null },
    })
    const r = createSnapshot(ws, { id: 's', now: fixedNow })
    if (!r.ok) throw new Error('expected ok')
    expect(snapshotTotalsIn(r.snapshot, 'USD')?.assets).toBe(1200)
    expect(snapshotTotalsIn(r.snapshot, 'EUR')?.assets).toBe(1000)
  })

  it('diff compares two snapshots in one currency', () => {
    const a = createSnapshot(acceptanceWorkspace(), { id: 'a', now: fixedNow })
    const ws2 = acceptanceWorkspace()
    ws2.liabilities[0]!.amount = 70000
    const b = createSnapshot(ws2, { id: 'b', now: new Date('2026-04-15T10:00:00Z') })
    if (!a.ok || !b.ok) throw new Error('expected ok')
    expect(diffSnapshots(a.snapshot, b.snapshot, 'EUR')).toEqual({ assets: 0, liabilities: -10000, netWorth: 10000 })
  })

  it('cannot be converted without a recorded rate', () => {
    const r = createSnapshot(workspace({ assets: [asset({ name: 'x', amount: 1 })] }), { id: 's', now: fixedNow })
    if (!r.ok) throw new Error('expected ok')
    expect(snapshotTotalsIn(r.snapshot, 'USD')).toBeNull()
  })
})
