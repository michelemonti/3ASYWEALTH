import { describe, expect, it } from 'vitest'
import { summarize } from '@/domain/calc'
import { buildReportModel, toPdfText } from './report'
import { acceptanceWorkspace, asset, fixedNow, workspace } from '@/test/fixtures'

describe('report model', () => {
  it('uses exactly the same figures as every other view', () => {
    const ws = acceptanceWorkspace()
    ws.assets.push(asset({ name: 'Broker', category: 'investments', currency: 'USD', amount: 110 }))
    ws.settings = { displayCurrency: 'EUR', eurUsdRate: 1.1, eurUsdRateDate: '2026-03-01' }
    const s = summarize(ws)
    const model = buildReportModel(ws, fixedNow)
    expect(model.totals).toEqual(s.totals)
    expect(model.totals).toEqual({ assets: 170100, liabilities: 80000, netWorth: 90100, liquidity: 20000 })
    expect(model.assets.reduce((acc, a) => acc + (a.value ?? 0), 0)).toBe(s.totals.assets)
    expect(model.assets[0]).toMatchObject({ name: 'Casa', ownershipPercent: 50, value: 150000, amount: 300000 })
    expect(model.liabilities[0]).toMatchObject({ name: 'Mutuo', linkedTo: 'Casa', value: 80000 })
  })

  it('reports in USD when that is the display currency (100 € + 110 $ = 220 $)', () => {
    const ws = workspace({
      assets: [asset({ name: 'eur', amount: 100 }), asset({ name: 'usd', amount: 110, currency: 'USD' })],
      settings: { displayCurrency: 'USD', eurUsdRate: 1.1, eurUsdRateDate: null },
    })
    expect(buildReportModel(ws, fixedNow).totals.assets).toBe(220)
  })
})

describe('toPdfText', () => {
  it('keeps user text as inert text and degrades unsupported glyphs', () => {
    expect(toPdfText('<img src=x onerror=alert(1)>')).toBe('<img src=x onerror=alert(1)>')
    expect(toPdfText('Casa € àè')).toBe('Casa € àè')
    expect(toPdfText('1\u202F234 €')).toBe('1 234 €')
    expect(toPdfText('🏠 东京')).toBe('? ??')
  })
})
