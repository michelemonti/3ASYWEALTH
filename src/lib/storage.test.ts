import { describe, expect, it } from 'vitest'
import { DATA_KEY, LEGACY_KEY, MemoryKV, listBackups, loadWorkspace, readRaw } from './storage'
import { createWealthStore } from '@/stores/wealthStore'
import { summarize } from '@/domain/calc'
import { fixedNow, sequentialIds } from '@/test/fixtures'

/** Exactly what v1 (zustand persist, name "wealth-storage") wrote to localStorage. */
const legacyAssets = [
  {
    id: 'old-1',
    name: 'Tech Startup SRL',
    category: 'shareholdings',
    ownership: '10%',
    value: 50000,
    currency: 'EUR',
    source: '2025 Valuation',
    notes: 'Angel round',
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2025-11-05T08:00:00.000Z',
  },
  {
    id: 'old-2',
    name: 'Brokerage',
    category: 'cash',
    ownership: '100%',
    value: 21600,
    currency: 'USD',
    source: '',
    createdAt: '2025-10-01T08:00:00.000Z',
    updatedAt: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'old-3',
    name: 'Flat',
    category: 'realestate',
    ownership: '50%',
    value: 180000,
    // v1 assets created before the currency feature had no currency field
    source: 'Market value',
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-09-01T08:00:00.000Z',
  },
  {
    id: 'old-4',
    name: 'Watch',
    category: 'personalassets',
    ownership: '-',
    value: 4000,
    currency: 'EUR',
    source: '',
    createdAt: '2025-09-01T08:00:00.000Z',
    updatedAt: '2025-09-01T08:00:00.000Z',
  },
]
const legacyState = { state: { assets: legacyAssets, displayCurrency: 'EUR', exchangeRate: 1.08 }, version: 0 }

/** The v1 total formula, reproduced to prove totals are preserved. */
function v1Total(state: typeof legacyState.state) {
  const conv = (v: number, from: string, to: string, r: number) => (from === to ? v : from === 'EUR' ? v * r : v / r)
  return state.assets.reduce(
    (sum, a) => sum + conv(a.value, a.currency ?? state.displayCurrency, state.displayCurrency, state.exchangeRate),
    0,
  )
}

describe('v1 → v2 migration', () => {
  it('backs up the original, preserves totals, keeps ownership text as legacy info', () => {
    const kv = new MemoryKV()
    const raw = JSON.stringify(legacyState)
    kv.setItem(LEGACY_KEY, raw)

    const result = loadWorkspace(kv, fixedNow)
    if (result.status !== 'migrated') throw new Error(`unexpected ${result.status}`)

    // Backup with the exact original bytes
    expect(result.backupKey).toMatch(/^3asywealth:backup:migration:/)
    expect(readRaw(kv, result.backupKey!)).toBe(raw)
    expect(readRaw(kv, LEGACY_KEY)).toBeNull()
    expect(readRaw(kv, DATA_KEY)).not.toBeNull()

    const ws = result.workspace
    expect(summarize(ws).totals.assets).toBeCloseTo(v1Total(legacyState.state), 2)
    expect(summarize(ws).totals.assets).toBe(254000)
    expect(ws.settings).toEqual({ displayCurrency: 'EUR', eurUsdRate: 1.08, eurUsdRateDate: null })

    const startup = ws.assets.find((a) => a.id === 'old-1')!
    expect(startup).toMatchObject({
      category: 'business',
      valueBasis: 'share',
      ownershipPercent: 100,
      amount: 50000,
      legacyOwnership: '10%',
      valuationDate: '2025-11-05',
    })
    expect(ws.assets.find((a) => a.id === 'old-3')?.currency).toBe('EUR')
    expect(ws.assets.find((a) => a.id === 'old-4')?.legacyOwnership).toBeUndefined()
    expect(ws.assets.find((a) => a.id === 'old-4')?.category).toBe('personal')
  })

  it('is idempotent: the second load reads v2 and does not migrate again', () => {
    const kv = new MemoryKV()
    kv.setItem(LEGACY_KEY, JSON.stringify(legacyState))
    const first = loadWorkspace(kv, fixedNow)
    const second = loadWorkspace(kv, fixedNow)
    expect(second.status).toBe('loaded')
    if (first.status !== 'migrated' || second.status !== 'loaded') return
    expect(second.workspace).toEqual(first.workspace)
    expect(listBackups(kv).filter((b) => b.reason === 'migration')).toHaveLength(1)
  })

  it('keeps the v1 key when storage is full and reports the failed save', () => {
    const kv = new MemoryKV()
    const raw = JSON.stringify(legacyState)
    kv.setItem(LEGACY_KEY, raw)
    kv.quotaBytes = raw.length + LEGACY_KEY.length + 10

    const result = loadWorkspace(kv, fixedNow)
    if (result.status !== 'migrated') throw new Error('expected migrated')
    expect(result.saved).toEqual({ ok: false, reason: 'quota' })
    expect(result.backupKey).toBe(LEGACY_KEY)
    expect(readRaw(kv, LEGACY_KEY)).toBe(raw)

    const store = createWealthStore({ kv, now: () => fixedNow }, result)
    expect(store.getState().persistence).toEqual({ status: 'error', reason: 'quota' })
    expect(store.getState().notice?.kind).toBe('migrated')
  })

  it('never overwrites unreadable data and lets the user move it to a backup', () => {
    const kv = new MemoryKV()
    kv.setItem(DATA_KEY, '{not json')
    const store = createWealthStore({ kv, now: () => fixedNow, newId: sequentialIds() })
    expect(store.getState().persistence).toEqual({ status: 'blocked', error: 'unreadable', key: DATA_KEY })

    store.getState().addAsset({
      name: 'x',
      category: 'cash',
      currency: 'EUR',
      amount: 1,
      valueBasis: 'share',
      ownershipPercent: 100,
      valuationDate: '2026-03-15',
      notes: '',
      source: '',
    })
    expect(readRaw(kv, DATA_KEY)).toBe('{not json')

    expect(store.getState().resolveBlocked()).toBe(true)
    const backup = listBackups(kv).find((b) => b.reason === 'unreadable')!
    expect(readRaw(kv, backup.key)).toBe('{not json')
    expect(store.getState().persistence.status).toBe('ok')
    expect(JSON.parse(readRaw(kv, DATA_KEY)!).data.assets).toHaveLength(1)
  })

  it('refuses documents from a newer app version', () => {
    const kv = new MemoryKV()
    kv.setItem(DATA_KEY, JSON.stringify({ app: '3asywealth', schemaVersion: 99, data: {} }))
    expect(loadWorkspace(kv, fixedNow)).toEqual({ status: 'failed', error: 'newerVersion', key: DATA_KEY })
  })

  it('backs up the stored document when some records are invalid', () => {
    const kv = new MemoryKV()
    const doc = {
      app: '3asywealth',
      schemaVersion: 2,
      kind: 'storage',
      savedAt: fixedNow.toISOString(),
      data: {
        assets: [
          {
            id: 'ok',
            name: 'ok',
            category: 'cash',
            currency: 'EUR',
            amount: 10,
            valueBasis: 'share',
            ownershipPercent: 100,
            valuationDate: '2026-01-01',
          },
          { id: 'bad', name: 'bad', category: 'cash', currency: 'EUR', amount: 'lots', valueBasis: 'share', valuationDate: '2026-01-01' },
        ],
        liabilities: [],
        snapshots: [],
        settings: { displayCurrency: 'EUR', eurUsdRate: null, eurUsdRateDate: null },
      },
    }
    kv.setItem(DATA_KEY, JSON.stringify(doc))
    const result = loadWorkspace(kv, fixedNow)
    if (result.status !== 'loaded') throw new Error('expected loaded')
    expect(result.workspace.assets.map((a) => a.id)).toEqual(['ok'])
    expect(result.issues).toEqual([{ severity: 'error', kind: 'asset', index: 1, name: 'bad', field: 'amount' }])
    expect(readRaw(kv, result.backupKey!)).toBe(JSON.stringify(doc))
  })

  const docWithBadRecord = () =>
    JSON.stringify({
      app: '3asywealth',
      schemaVersion: 2,
      kind: 'storage',
      savedAt: fixedNow.toISOString(),
      data: {
        assets: [
          { id: 'ok', name: 'ok', category: 'cash', currency: 'EUR', amount: 10, valueBasis: 'share', ownershipPercent: 100, valuationDate: '2026-01-01' },
          { id: 'bad', name: 'bad', category: 'cash', currency: 'EUR', amount: 1, valueBasis: 'share', valuationDate: 'xx' },
        ],
        liabilities: [],
        snapshots: [],
        settings: { displayCurrency: 'EUR', eurUsdRate: null, eurUsdRateDate: null },
      },
    })

  it('keeps the copy of unreadable records through later automatic backups and reloads', () => {
    const kv = new MemoryKV()
    const raw = docWithBadRecord()
    kv.setItem(DATA_KEY, raw)
    loadWorkspace(kv, fixedNow)
    loadWorkspace(kv, fixedNow) // reload before any save: no duplicate copy
    const store = createWealthStore({ kv, now: () => fixedNow, newId: sequentialIds() })
    for (let i = 0; i < 7; i++) store.getState().replacePersonal(store.getState().personal, 'beforeReplace')
    const invalid = listBackups(kv).filter((b) => b.reason === 'invalidData')
    expect(invalid).toHaveLength(1)
    expect(readRaw(kv, invalid[0]!.key)).toBe(raw)
  })

  it('does not save over unreadable records when their backup cannot be written', () => {
    const kv = new MemoryKV()
    const raw = docWithBadRecord()
    kv.setItem(DATA_KEY, raw)
    kv.quotaBytes = raw.length * 1.5
    const store = createWealthStore({ kv, now: () => fixedNow, newId: sequentialIds() })
    expect(store.getState().persistence).toEqual({ status: 'blocked', error: 'invalidNoBackup', key: DATA_KEY })
    expect(store.getState().personal.assets.map((a) => a.id)).toEqual(['ok'])
    store.getState().setDisplayCurrency('USD')
    expect(readRaw(kv, DATA_KEY)).toBe(raw)
  })
})

