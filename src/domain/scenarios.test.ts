import { describe, expect, it } from 'vitest'
import { summarize } from './calc'
import { runScenario } from './scenarios'
import { acceptanceWorkspace, asset, workspace } from '@/test/fixtures'

const s = summarize(acceptanceWorkspace()) // assets 170k (cash 20k), debts 80k, net 90k

describe('runScenario', () => {
  it('purchase paid in cash moves value from liquidity to a new asset; net unchanged', () => {
    const r = runScenario(s, { kind: 'purchase', price: 15000, financed: 0 })
    expect(r.ok && r.after).toEqual({ liquidity: 5000, assets: 170000, liabilities: 80000, netWorth: 90000 })
  })

  it('purchase beyond liquidity is refused without explicit financing', () => {
    const r = runScenario(s, { kind: 'purchase', price: 50000, financed: 0 })
    expect(r).toEqual({ ok: false, error: { code: 'insufficientLiquidity', shortfall: 30000 } })
  })

  it('purchase with explicit financing adds the same amount to debts; net unchanged', () => {
    const r = runScenario(s, { kind: 'purchase', price: 50000, financed: 30000 })
    expect(r.ok && r.after).toEqual({ liquidity: 0, assets: 200000, liabilities: 110000, netWorth: 90000 })
    expect(runScenario(s, { kind: 'purchase', price: 50000, financed: 60000 })).toEqual({
      ok: false,
      error: { code: 'financedExceedsPrice' },
    })
  })

  it('revaluation changes only that asset and the net worth', () => {
    const home = s.assets.find((a) => a.item.name === 'Casa')!
    const r = runScenario(s, { kind: 'revalue', assetId: home.item.id, changePercent: -10 })
    expect(r.ok && r.delta).toEqual({ liquidity: 0, assets: -15000, liabilities: 0, netWorth: -15000 })
  })

  it('revaluing a cash asset also moves liquidity', () => {
    const cash = s.assets.find((a) => a.item.category === 'cash')!
    const r = runScenario(s, { kind: 'revalue', assetId: cash.item.id, changePercent: 10 })
    expect(r.ok && r.delta.liquidity).toBe(2000)
  })

  it('repaying principal lowers cash and debt by the same amount; net unchanged', () => {
    const debt = s.liabilities[0]!
    const r = runScenario(s, { kind: 'repay', liabilityId: debt.item.id, amount: 10000 })
    expect(r.ok && r.after).toEqual({ liquidity: 10000, assets: 160000, liabilities: 70000, netWorth: 90000 })
  })

  it('repayment cannot exceed the debt or the available cash', () => {
    const debt = s.liabilities[0]!
    expect(runScenario(s, { kind: 'repay', liabilityId: debt.item.id, amount: 90000 })).toEqual({
      ok: false,
      error: { code: 'exceedsDebt', outstanding: 80000 },
    })
    expect(runScenario(s, { kind: 'repay', liabilityId: debt.item.id, amount: 25000 })).toEqual({
      ok: false,
      error: { code: 'insufficientLiquidity', shortfall: 5000 },
    })
  })

  it('never alters the source summary', () => {
    const snapshot = structuredClone(s.totals)
    runScenario(s, { kind: 'purchase', price: 1000, financed: 0 })
    expect(s.totals).toEqual(snapshot)
  })

  it('refuses to simulate with unconvertible items', () => {
    const ws = workspace({ assets: [asset({ name: 'x', amount: 1, currency: 'USD' })] })
    expect(runScenario(summarize(ws), { kind: 'purchase', price: 1, financed: 0 })).toEqual({
      ok: false,
      error: { code: 'missingRate' },
    })
  })
})
