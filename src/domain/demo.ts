/**
 * Entirely fictional demo data. It lives in memory only and never touches the
 * personal workspace. Names are resolved through i18n keys by the caller.
 */

import { todayISODate } from './numbers'
import type { Asset, Liability, Workspace } from './types'

export type DemoLabelKey =
  | 'checking'
  | 'savings'
  | 'etf'
  | 'usBroker'
  | 'company'
  | 'home'
  | 'bike'
  | 'mortgage'
  | 'card'
  | 'homeNote'
  | 'companyNote'
  | 'usNote'

export function createDemoWorkspace(label: (key: DemoLabelKey) => string, now = new Date()): Workspace {
  const iso = now.toISOString()
  const today = todayISODate(now)
  let n = 0
  const id = (prefix: string) => `demo-${prefix}-${++n}`

  const asset = (a: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'valuationDate' | 'notes' | 'source'> & Partial<Asset>): Asset => ({
    id: id('a'),
    notes: '',
    source: '',
    valuationDate: today,
    createdAt: iso,
    updatedAt: iso,
    ...a,
  })

  const home = asset({
    name: label('home'),
    category: 'realestate',
    currency: 'EUR',
    amount: 300000,
    valueBasis: 'whole',
    ownershipPercent: 50,
    notes: label('homeNote'),
  })

  const assets: Asset[] = [
    asset({ name: label('checking'), category: 'cash', currency: 'EUR', amount: 12400, valueBasis: 'share', ownershipPercent: 100 }),
    asset({ name: label('savings'), category: 'cash', currency: 'EUR', amount: 18000, valueBasis: 'share', ownershipPercent: 100 }),
    asset({ name: label('etf'), category: 'investments', currency: 'EUR', amount: 46500, valueBasis: 'share', ownershipPercent: 100 }),
    asset({
      name: label('usBroker'),
      category: 'investments',
      currency: 'USD',
      amount: 21000,
      valueBasis: 'share',
      ownershipPercent: 100,
      notes: label('usNote'),
    }),
    asset({
      name: label('company'),
      category: 'business',
      currency: 'EUR',
      amount: 500000,
      valueBasis: 'whole',
      ownershipPercent: 10,
      notes: label('companyNote'),
    }),
    home,
    asset({ name: label('bike'), category: 'personal', currency: 'EUR', amount: 9000, valueBasis: 'share', ownershipPercent: 100 }),
  ]

  const liability = (l: Omit<Liability, 'id' | 'createdAt' | 'updatedAt' | 'valuationDate' | 'notes'> & Partial<Liability>): Liability => ({
    id: id('l'),
    notes: '',
    valuationDate: today,
    createdAt: iso,
    updatedAt: iso,
    ...l,
  })

  const liabilities: Liability[] = [
    liability({ name: label('mortgage'), currency: 'EUR', amount: 80000, linkedAssetId: home.id }),
    liability({ name: label('card'), currency: 'EUR', amount: 1200 }),
  ]

  return {
    assets,
    liabilities,
    snapshots: [],
    settings: { displayCurrency: 'EUR', eurUsdRate: 1.1, eurUsdRateDate: today },
  }
}
