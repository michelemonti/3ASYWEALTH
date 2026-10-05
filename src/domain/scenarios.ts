/**
 * "E se…?" — three tiny, local what-if simulations. They work on a Summary and
 * return before/after totals without touching the real data.
 *
 * Accounting conventions:
 * - purchase: cash moves into a new asset of the same value; any part not paid in
 *   cash must be an explicit new debt. Net worth is unchanged.
 * - revalue: the attributed value of one asset changes by a percentage. Only this
 *   changes net worth.
 * - repay: principal repayment lowers cash and debt by the same amount. Net worth
 *   is unchanged.
 */

import { roundCents } from './numbers'
import type { Summary } from './calc'

export type Scenario =
  | { kind: 'purchase'; price: number; financed: number }
  | { kind: 'revalue'; assetId: string; changePercent: number }
  | { kind: 'repay'; liabilityId: string; amount: number }

export interface ScenarioTotals {
  liquidity: number
  assets: number
  liabilities: number
  netWorth: number
}

export type ScenarioError =
  | { code: 'missingRate' }
  | { code: 'invalidAmount' }
  | { code: 'notFound' }
  | { code: 'financedExceedsPrice' }
  | { code: 'insufficientLiquidity'; shortfall: number }
  | { code: 'exceedsDebt'; outstanding: number }

export type ScenarioResult =
  | { ok: true; before: ScenarioTotals; after: ScenarioTotals; delta: ScenarioTotals }
  | { ok: false; error: ScenarioError }

const finiteNonNegative = (n: number) => Number.isFinite(n) && n >= 0

export function runScenario(summary: Summary, scenario: Scenario): ScenarioResult {
  if (summary.missingRate > 0) return { ok: false, error: { code: 'missingRate' } }

  const before: ScenarioTotals = { ...summary.totals }
  const after: ScenarioTotals = { ...before }

  switch (scenario.kind) {
    case 'purchase': {
      const { price, financed } = scenario
      if (!finiteNonNegative(price) || price === 0 || !finiteNonNegative(financed)) {
        return { ok: false, error: { code: 'invalidAmount' } }
      }
      if (financed > price) return { ok: false, error: { code: 'financedExceedsPrice' } }
      const cash = roundCents(price - financed)
      if (cash > before.liquidity) {
        return { ok: false, error: { code: 'insufficientLiquidity', shortfall: roundCents(cash - before.liquidity) } }
      }
      after.liquidity = roundCents(before.liquidity - cash)
      after.assets = roundCents(before.assets - cash + price)
      after.liabilities = roundCents(before.liabilities + financed)
      break
    }
    case 'revalue': {
      const { assetId, changePercent } = scenario
      if (!Number.isFinite(changePercent) || changePercent < -100) {
        return { ok: false, error: { code: 'invalidAmount' } }
      }
      const valued = summary.assets.find((a) => a.item.id === assetId)
      if (!valued || valued.value === null) return { ok: false, error: { code: 'notFound' } }
      const next = roundCents(valued.value * (1 + changePercent / 100))
      const diff = roundCents(next - valued.value)
      after.assets = roundCents(before.assets + diff)
      if (valued.item.category === 'cash') after.liquidity = roundCents(before.liquidity + diff)
      break
    }
    case 'repay': {
      const { liabilityId, amount } = scenario
      if (!finiteNonNegative(amount) || amount === 0) return { ok: false, error: { code: 'invalidAmount' } }
      const valued = summary.liabilities.find((l) => l.item.id === liabilityId)
      if (!valued || valued.value === null) return { ok: false, error: { code: 'notFound' } }
      if (amount > valued.value) return { ok: false, error: { code: 'exceedsDebt', outstanding: valued.value } }
      if (amount > before.liquidity) {
        return { ok: false, error: { code: 'insufficientLiquidity', shortfall: roundCents(amount - before.liquidity) } }
      }
      after.liquidity = roundCents(before.liquidity - amount)
      after.assets = roundCents(before.assets - amount)
      after.liabilities = roundCents(before.liabilities - amount)
      break
    }
  }

  after.netWorth = roundCents(after.assets - after.liabilities)
  const delta: ScenarioTotals = {
    liquidity: roundCents(after.liquidity - before.liquidity),
    assets: roundCents(after.assets - before.assets),
    liabilities: roundCents(after.liabilities - before.liabilities),
    netWorth: roundCents(after.netWorth - before.netWorth),
  }
  return { ok: true, before, after, delta }
}
