import { describe, expect, it } from 'vitest'
import { createWealthStore, type AssetInput } from './wealthStore'
import { DATA_KEY, MemoryKV, listBackups, readRaw } from '@/lib/storage'
import { readDocument } from '@/domain/validate'
import { summarize } from '@/domain/calc'
import { fixedNow, sequentialIds } from '@/test/fixtures'

const cash = (name: string, amount: number): AssetInput => ({
  name,
  category: 'cash',
  currency: 'EUR',
  amount,
  valueBasis: 'share',
  ownershipPercent: 100,
  valuationDate: '2026-03-15',
  notes: '',
  source: '',
})

function setup() {
  const kv = new MemoryKV()
  const store = createWealthStore({ kv, now: () => fixedNow, newId: sequentialIds() })
  return { kv, store, s: () => store.getState() }
}

const persisted = (kv: MemoryKV) => {
  const r = readDocument(JSON.parse(readRaw(kv, DATA_KEY)!))
  if (!r.ok) throw new Error('unreadable')
  return r.workspace
}

describe('wealth store', () => {
  it('persists personal edits as a versioned document', () => {
    const { kv, s } = setup()
    s().addAsset(cash('Conto', 1000))
    const doc = JSON.parse(readRaw(kv, DATA_KEY)!)
    expect(doc).toMatchObject({ app: '3asywealth', schemaVersion: 2, kind: 'storage' })
    expect(persisted(kv).assets[0]).toMatchObject({ name: 'Conto', amount: 1000 })
  })

  it('demo mode never touches personal data, in memory or in storage', () => {
    const { kv, s } = setup()
    s().addAsset(cash('Mio conto', 1234))
    const before = readRaw(kv, DATA_KEY)
    const personalBefore = s().personal

    s().startDemo((k) => `demo:${k}`)
    expect(s().demo?.assets.length).toBeGreaterThan(0)
    s().addAsset(cash('Demo extra', 1))
    s().setDisplayCurrency('USD')
    s().saveSnapshot()
    s().deleteAsset(s().demo!.assets[0]!.id)

    expect(s().personal).toBe(personalBefore)
    expect(readRaw(kv, DATA_KEY)).toBe(before)

    s().exitDemo()
    expect(s().demo).toBeNull()
    expect(s().personal.assets.map((a) => a.name)).toEqual(['Mio conto'])
  })

  it('demo data reproduces the acceptance figures for home and company', () => {
    const { s } = setup()
    s().startDemo((k) => k)
    const sum = summarize(s().demo!)
    expect(sum.assets.find((a) => a.item.name === 'home')?.value).toBe(150000)
    expect(sum.assets.find((a) => a.item.name === 'company')?.value).toBe(50000)
    expect(sum.missingRate).toBe(0)
  })

  it('reports storage failures instead of pretending the save worked', () => {
    const { kv, s } = setup()
    s().addAsset(cash('a', 1))
    expect(s().persistence).toEqual({ status: 'ok' })
    kv.quotaBytes = 10
    s().addAsset(cash('b', 2))
    expect(s().persistence).toEqual({ status: 'error', reason: 'quota' })
    kv.quotaBytes = Infinity
    s().addAsset(cash('c', 3))
    expect(s().persistence).toEqual({ status: 'ok' })
  })

  it('reports unavailable storage', () => {
    const store = createWealthStore({ kv: null, now: () => fixedNow })
    expect(store.getState().persistence).toEqual({ status: 'error', reason: 'unavailable' })
  })

  it('ignores ownershipPercent for amounts that already are the personal share', () => {
    const { s } = setup()
    const id = s().addAsset({ ...cash('x', 100), ownershipPercent: 40 })
    expect(s().personal.assets.find((a) => a.id === id)?.ownershipPercent).toBe(100)
  })

  it('duplicates and restores deleted items with their links', () => {
    const { s } = setup()
    const home = s().addAsset({ ...cash('Casa', 300000), category: 'realestate', valueBasis: 'whole', ownershipPercent: 50 })
    const debt = s().addLiability({ name: 'Mutuo', currency: 'EUR', amount: 80000, linkedAssetId: home, valuationDate: '2026-03-15', notes: '' })
    const copy = s().duplicateAsset(home, '(copia)')!
    expect(s().personal.assets.find((a) => a.id === copy)).toMatchObject({ name: 'Casa (copia)', ownershipPercent: 50 })

    const deleted = s().deleteAsset(home)!
    expect(s().personal.liabilities.find((l) => l.id === debt)?.linkedAssetId).toBeUndefined()
    s().restoreAsset(deleted)
    expect(s().personal.assets[0]?.id).toBe(home)
    expect(s().personal.liabilities.find((l) => l.id === debt)?.linkedAssetId).toBe(home)
  })

  it('snapshots stay unchanged after edits and display currency changes', () => {
    const { s } = setup()
    const id = s().addAsset(cash('Conto', 1000))
    s().setRate(1.1)
    const r = s().saveSnapshot('marzo')
    if (!r.ok) throw new Error('snapshot failed')
    s().updateAsset(id, cash('Conto', 5000))
    s().setDisplayCurrency('USD')
    s().setRate(2)
    const stored = s().personal.snapshots[0]!
    expect(stored).toBe(r.snapshot)
    expect(stored.totals.netWorth).toBe(1000)
    expect(stored.currency).toBe('EUR')
    expect(stored.eurUsdRate).toBe(1.1)
    expect(stored.assets[0]?.amount).toBe(1000)
  })

  it('replace creates a recoverable backup first', () => {
    const { kv, s } = setup()
    s().addAsset(cash('Vecchio', 10))
    const result = s().replacePersonal(
      { assets: [], liabilities: [], snapshots: [], settings: s().personal.settings },
      'beforeReplace',
    )
    if (!result.ok) throw new Error('expected ok')
    const backup = readDocument(JSON.parse(readRaw(kv, result.backupKey!)!))
    expect(backup.ok && backup.workspace.assets[0]?.name).toBe('Vecchio')
    expect(s().personal.assets).toHaveLength(0)
  })

  it('refuses a destructive action when the backup cannot be written, unless forced', () => {
    const { kv, s } = setup()
    s().addAsset(cash('Importante', 10))
    kv.quotaBytes = (readRaw(kv, DATA_KEY)?.length ?? 0) + DATA_KEY.length + 5
    expect(s().clearPersonal()).toEqual({ ok: false, reason: 'backupFailed' })
    expect(s().personal.assets).toHaveLength(1)
    expect(s().clearPersonal(true)).toEqual({ ok: true, backupKey: null })
    expect(s().personal.assets).toHaveLength(0)
  })

  it('merge keeps every item, renaming colliding ids and remapping links', () => {
    const { s } = setup()
    const existing = s().addAsset(cash('Casa', 1))
    s().mergeIntoPersonal(
      {
        assets: [{ ...s().personal.assets[0]!, name: 'Casa importata' }],
        liabilities: [
          { id: 'L', name: 'Mutuo', currency: 'EUR', amount: 5, linkedAssetId: existing, valuationDate: '2026-01-01', notes: '', createdAt: '', updatedAt: '' },
        ],
        snapshots: [],
      },
      1.2,
    )
    const ws = s().personal
    expect(ws.assets).toHaveLength(2)
    expect(new Set(ws.assets.map((a) => a.id)).size).toBe(2)
    const imported = ws.assets.find((a) => a.name === 'Casa importata')!
    expect(ws.liabilities[0]?.linkedAssetId).toBe(imported.id)
    expect(ws.settings.eurUsdRate).toBe(1.2)
  })

  it('keeps at most a few automatic backups', () => {
    const { kv, s } = setup()
    for (let i = 0; i < 8; i++) {
      s().addAsset(cash(`x${i}`, i + 1))
      s().clearPersonal()
    }
    expect(listBackups(kv).filter((b) => b.reason === 'beforeClear').length).toBeLessThanOrEqual(5)
  })

  it('a second tab reloads newer data instead of overwriting it', () => {
    const kv = new MemoryKV()
    const tabA = createWealthStore({ kv, now: () => fixedNow, newId: sequentialIds('a') })
    const tabB = createWealthStore({ kv, now: () => fixedNow, newId: sequentialIds('b') })
    tabA.getState().addAsset(cash('Brokerage', 50000))
    // the browser fires a storage event in tab B
    expect(tabB.getState().syncFromStorage()).toBe(true)
    tabB.getState().setDisplayCurrency('USD')
    expect(persisted(kv).assets.map((a) => a.name)).toEqual(['Brokerage'])
    expect(persisted(kv).settings.displayCurrency).toBe('USD')
  })
})

