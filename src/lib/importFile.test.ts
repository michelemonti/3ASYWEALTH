import { describe, expect, it } from 'vitest'
import { findDuplicates, readImportText, replacementWorkspace, serializeBackup, type ImportOptions } from './importFile'
import { createSnapshot } from '@/domain/snapshots'
import { summarize } from '@/domain/calc'
import { acceptanceWorkspace, asset, fixedNow, workspace } from '@/test/fixtures'

const opts: ImportOptions = { defaultCurrency: 'EUR', decimalHint: ',', dateOrder: 'dmy', now: fixedNow }

describe('JSON backup', () => {
  it('round-trips assets, debts, snapshots and settings exactly', () => {
    const ws = acceptanceWorkspace()
    ws.assets.push(asset({ name: 'Broker', category: 'investments', currency: 'USD', amount: 2200, legacyOwnership: '100%' }))
    ws.settings = { displayCurrency: 'USD', eurUsdRate: 1.1, eurUsdRateDate: '2026-03-01' }
    const snap = createSnapshot(ws, { id: 'snap-1', now: fixedNow, note: 'marzo' })
    if (!snap.ok) throw new Error('snapshot')
    ws.snapshots = [snap.snapshot]

    const r = readImportText(serializeBackup(ws, fixedNow), 'backup.json', opts)
    if (!r.ok) throw new Error(r.error)
    const restored = replacementWorkspace(workspace(), r.candidate)
    expect(JSON.parse(JSON.stringify(restored))).toEqual(JSON.parse(JSON.stringify(ws)))
    expect(Object.isFrozen(restored.snapshots[0])).toBe(true)
    expect(summarize(restored).totals).toEqual(summarize(ws).totals)
  })

  it('imports a v1 export including its currency and exchange rate', () => {
    const v1 = {
      assets: [
        { id: 't1', name: 'Microsoft', category: 'shareholdings', ownership: '10%', value: 216, currency: 'USD', source: '', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
        { id: 't2', name: 'Cabin', category: 'realestate', ownership: '50%', value: 300000, source: '', createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
      ],
      summary: { totalWealth: 300200 },
      exportDate: '2025-06-01T00:00:00.000Z',
      version: '1.0.0',
      displayCurrency: 'EUR',
      exchangeRate: 1.08,
    }
    const r = readImportText(JSON.stringify(v1), 'old.json', opts)
    if (!r.ok) throw new Error(r.error)
    expect(r.candidate.source).toBe('v1-export')
    expect(r.candidate.settings).toEqual({ displayCurrency: 'EUR', eurUsdRate: 1.08, eurUsdRateDate: null })
    const ws = replacementWorkspace(workspace(), r.candidate)
    expect(summarize(ws).totals.assets).toBe(300200)
    expect(ws.assets[1]).toMatchObject({ currency: 'EUR', legacyOwnership: '50%', valueBasis: 'share' })
  })

  it('reports malformed files without changing anything', () => {
    expect(readImportText('{oops', 'x.json', opts)).toEqual({ ok: false, error: 'invalidJson' })
    expect(readImportText('{"hello":1}', 'x.json', opts)).toEqual({ ok: false, error: 'unrecognized' })
    expect(readImportText('{"app":"3asywealth","schemaVersion":3,"data":{}}', 'x.json', opts)).toEqual({
      ok: false,
      error: 'newerVersion',
    })
    expect(readImportText('[]', 'x.json', opts)).toEqual({ ok: false, error: 'empty' })
  })

  it('reports invalid records per item instead of dropping them silently', () => {
    const doc = {
      app: '3asywealth',
      schemaVersion: 2,
      data: {
        assets: [
          { id: 'a', name: 'ok', category: 'cash', currency: 'EUR', amount: 1, valueBasis: 'share', ownershipPercent: 100, valuationDate: '2026-01-01' },
          { id: 'b', name: 'bad pct', category: 'cash', currency: 'EUR', amount: 1, valueBasis: 'whole', ownershipPercent: 0, valuationDate: '2026-01-01' },
          { id: 'c', name: 'bad date', category: 'cash', currency: 'EUR', amount: 1, valueBasis: 'share', valuationDate: '2026-02-30' },
        ],
        liabilities: [{ id: 'l', name: 'neg', currency: 'EUR', amount: -1, valuationDate: '2026-01-01' }],
        snapshots: [{ id: 's', createdAt: 'yesterday' }],
        settings: { displayCurrency: 'USD', eurUsdRate: -3 },
      },
    }
    const r = readImportText(JSON.stringify(doc), 'x.json', opts)
    if (!r.ok) throw new Error(r.error)
    expect(r.candidate.assets.map((a) => a.id)).toEqual(['a'])
    expect(r.candidate.jsonIssues.map((i) => `${i.severity}:${i.kind}:${i.field}`)).toEqual([
      'error:asset:percent',
      'error:asset:date',
      'error:liability:amount',
      'error:snapshot:snapshot',
      'warning:settings:settings',
    ])
    expect(r.candidate.settings).toEqual({ displayCurrency: 'USD', eurUsdRate: null, eurUsdRateDate: null })
  })
})

describe('import planning', () => {
  it('detects likely duplicates so the user can decide', () => {
    const current = acceptanceWorkspace()
    const r = readImportText(serializeBackup(acceptanceWorkspace()), 'b.json', opts)
    if (!r.ok) throw new Error(r.error)
    expect(findDuplicates(current, r.candidate).size).toBe(3)
  })

  it('CSV replace keeps history and settings; JSON replace restores everything', () => {
    const current = acceptanceWorkspace()
    const snap = createSnapshot(current, { id: 'keep', now: fixedNow })
    if (!snap.ok) throw new Error('snap')
    current.snapshots = [snap.snapshot]
    current.settings.eurUsdRate = 1.3
    const csv = readImportText('Name,Category,Amount\nConto,cash,5', 'x.csv', opts)
    if (!csv.ok) throw new Error(csv.error)
    const replaced = replacementWorkspace(current, csv.candidate)
    expect(replaced.snapshots).toEqual(current.snapshots)
    expect(replaced.settings.eurUsdRate).toBe(1.3)
    expect(replaced.assets).toHaveLength(1)
  })
})
