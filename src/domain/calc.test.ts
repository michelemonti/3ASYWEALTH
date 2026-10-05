import { describe, expect, it } from 'vitest'
import { convert, needsRate, personalAmount, summarize, topAssets } from './calc'
import { acceptanceWorkspace, asset, liability, workspace } from '@/test/fixtures'

describe('summarize — acceptance examples', () => {
  it('home 300k at 50%, personal debt 80k, cash 20k → assets 170k, debts 80k, net 90k', () => {
    const s = summarize(acceptanceWorkspace())
    expect(s.totals).toEqual({ assets: 170000, liabilities: 80000, netWorth: 90000, liquidity: 20000 })
  })

  it('linking a debt to an asset never subtracts it twice', () => {
    const ws = acceptanceWorkspace()
    const unlinked = { ...ws, liabilities: ws.liabilities.map(({ linkedAssetId: _x, ...l }) => l) }
    expect(summarize(ws).totals).toEqual(summarize(unlinked).totals)
  })

  it('10% of a company valued 500k is 50k; an amount already referring to my share stays 50k', () => {
    const whole = asset({ name: 'Srl', category: 'business', amount: 500000, valueBasis: 'whole', ownershipPercent: 10 })
    const share = asset({ name: 'Srl', category: 'business', amount: 50000, valueBasis: 'share', ownershipPercent: 10 })
    expect(summarize(workspace({ assets: [whole] })).totals.assets).toBe(50000)
    // ownershipPercent must be ignored for `share` — no double application.
    expect(summarize(workspace({ assets: [share] })).totals.assets).toBe(50000)
    expect(personalAmount(share)).toBe(50000)
  })
})

describe('summarize — mixed currencies', () => {
  const ws = workspace({
    assets: [asset({ name: 'EUR', amount: 100, currency: 'EUR' }), asset({ name: 'USD', amount: 110, currency: 'USD' })],
    settings: { displayCurrency: 'EUR', eurUsdRate: 1.1, eurUsdRateDate: '2026-03-01' },
  })

  it('with 1 EUR = 1.10 USD, 100 € + 110 $ = 200 € or 220 $', () => {
    expect(summarize(ws, 'EUR').totals.assets).toBe(200)
    expect(summarize(ws, 'USD').totals.assets).toBe(220)
  })

  it('changing the display currency never changes stored amounts', () => {
    const before = structuredClone(ws.assets)
    summarize(ws, 'USD')
    expect(ws.assets).toEqual(before)
  })

  it('reports items it cannot convert instead of counting them as zero', () => {
    const noRate = { ...ws, settings: { ...ws.settings, eurUsdRate: null } }
    const s = summarize(noRate)
    expect(s.missingRate).toBe(1)
    expect(s.assets.find((a) => a.item.name === 'USD')?.value).toBeNull()
    expect(needsRate(noRate, 'EUR')).toBe(true)
    expect(needsRate(noRate, 'USD')).toBe(true)
  })

  it('convert refuses invalid rates', () => {
    expect(convert(10, 'EUR', 'USD', 0)).toBeNull()
    expect(convert(10, 'EUR', 'USD', Number.NaN)).toBeNull()
    expect(convert(10, 'EUR', 'EUR', null)).toBe(10)
  })
})

describe('summarize — structure', () => {
  it('handles negative net worth and keeps allocations relative to total assets', () => {
    const ws = workspace({
      assets: [
        asset({ name: 'Conto', category: 'cash', amount: 10000 }),
        asset({ name: 'Auto', category: 'personal', amount: 30000 }),
      ],
      liabilities: [liability({ name: 'Prestito', amount: 55000 })],
    })
    const s = summarize(ws)
    expect(s.totals.netWorth).toBe(-15000)
    const shares = Object.fromEntries(s.byCategory.map((c) => [c.category, c.shareOfAssets]))
    expect(shares).toEqual({ personal: 75, cash: 25 })
  })

  it('liquidity is only the cash category — not homes or company stakes', () => {
    const s = summarize(acceptanceWorkspace())
    expect(s.totals.liquidity).toBe(20000)
  })

  it('rows always add up to the totals (per-item rounding)', () => {
    const ws = workspace({
      assets: [1, 2, 3].map((i) => asset({ name: `x${i}`, amount: 100, currency: 'USD' })),
      settings: { displayCurrency: 'EUR', eurUsdRate: 3, eurUsdRateDate: null },
    })
    const s = summarize(ws)
    const rows = s.assets.reduce((acc, a) => acc + (a.value ?? 0), 0)
    expect(s.totals.assets).toBe(Math.round(rows * 100) / 100)
    expect(s.assets[0]?.value).toBe(33.33)
  })

  it('reports the real last update and oldest valuation instead of "now"', () => {
    const ws = workspace({
      assets: [
        asset({ name: 'a', amount: 1, updatedAt: '2026-01-02T00:00:00.000Z', valuationDate: '2025-12-31' }),
        asset({ name: 'b', amount: 1, updatedAt: '2026-02-03T00:00:00.000Z', valuationDate: '2026-02-01' }),
      ],
    })
    const s = summarize(ws)
    expect(s.lastUpdated).toBe('2026-02-03T00:00:00.000Z')
    expect(s.oldestValuation).toBe('2025-12-31')
    expect(summarize(workspace()).lastUpdated).toBeNull()
  })

  it('topAssets sorts by attributed value', () => {
    const s = summarize(acceptanceWorkspace())
    expect(topAssets(s).map((a) => a.item.name)).toEqual(['Casa', 'Conto'])
  })
})
