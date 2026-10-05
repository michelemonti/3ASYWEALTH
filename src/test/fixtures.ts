import type { Asset, Liability, Workspace } from '@/domain/types'

let counter = 0
export const fixedNow = new Date('2026-03-15T10:00:00.000Z')

export function asset(partial: Partial<Asset> & Pick<Asset, 'name' | 'amount'>): Asset {
  counter += 1
  return {
    id: `a${counter}`,
    category: 'cash',
    currency: 'EUR',
    valueBasis: 'share',
    ownershipPercent: 100,
    valuationDate: '2026-03-01',
    notes: '',
    source: '',
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
    ...partial,
  }
}

export function liability(partial: Partial<Liability> & Pick<Liability, 'name' | 'amount'>): Liability {
  counter += 1
  return {
    id: `l${counter}`,
    currency: 'EUR',
    valuationDate: '2026-03-01',
    notes: '',
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-03-01T09:00:00.000Z',
    ...partial,
  }
}

export function workspace(partial: Partial<Workspace> = {}): Workspace {
  return {
    assets: [],
    liabilities: [],
    snapshots: [],
    settings: { displayCurrency: 'EUR', eurUsdRate: null, eurUsdRateDate: null },
    ...partial,
  }
}

/** The acceptance example: 50% of a 300k home, 80k personal mortgage, 20k cash. */
export function acceptanceWorkspace(): Workspace {
  const home = asset({ name: 'Casa', category: 'realestate', amount: 300000, valueBasis: 'whole', ownershipPercent: 50 })
  return workspace({
    assets: [home, asset({ name: 'Conto', category: 'cash', amount: 20000 })],
    liabilities: [liability({ name: 'Mutuo', amount: 80000, linkedAssetId: home.id })],
  })
}

export function sequentialIds(prefix = 'id') {
  let n = 0
  return () => `${prefix}-${++n}`
}
