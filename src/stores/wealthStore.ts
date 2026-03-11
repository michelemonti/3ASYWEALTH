/**
 * Wealth Store (Zustand)
 * 
 * Global state management for wealth tracking.
 * Persists assets and calculations across page reloads.
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Asset, AssetCategory, Currency, WealthSummary, CategorySummary } from '../types/wealth'

// =============================================================================
// CURRENCY CONVERSION
// =============================================================================

const DEFAULT_EUR_USD_RATE = 1.08

export function convertValue(
  value: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  eurToUsdRate: number
): number {
  if (fromCurrency === toCurrency) return value
  if (fromCurrency === 'EUR' && toCurrency === 'USD') return value * eurToUsdRate
  return value / eurToUsdRate // USD → EUR
}

// =============================================================================
// STORE INTERFACE
// =============================================================================

interface WealthStore {
  // State
  assets: Asset[]
  isLoading: boolean
  error: string | null
  displayCurrency: Currency
  exchangeRate: number // EUR → USD rate

  // Actions - CRUD
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateAsset: (id: string, updates: Partial<Asset>) => void
  deleteAsset: (id: string) => void
  clearAssets: () => void

  // Actions - Import/Export
  importAssets: (assets: Asset[]) => void
  loadDemoData: () => void

  // Actions - Currency
  setDisplayCurrency: (currency: Currency) => void
  setExchangeRate: (rate: number) => void

  // Computed
  getSummary: () => WealthSummary
  getAssetsByCategory: (category: AssetCategory) => Asset[]
  getDisplayValue: (asset: Asset) => number
  
  // Utility
  setError: (error: string | null) => void
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useWealthStore = create<WealthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        assets: [],
        isLoading: false,
        error: null,
        displayCurrency: 'EUR',
        exchangeRate: DEFAULT_EUR_USD_RATE,

        // CRUD actions

        /**
         * Add new asset
         */
        addAsset: (assetData) => {
          const newAsset: Asset = {
            ...assetData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          set((state) => ({
            assets: [...state.assets, newAsset],
            error: null,
          }))
        },

        /**
         * Update existing asset
         */
        updateAsset: (id, updates) => {
          set((state) => ({
            assets: state.assets.map((asset) =>
              asset.id === id
                ? { ...asset, ...updates, updatedAt: new Date() }
                : asset
            ),
            error: null,
          }))
        },

        /**
         * Delete asset
         */
        deleteAsset: (id) => {
          set((state) => ({
            assets: state.assets.filter((asset) => asset.id !== id),
            error: null,
          }))
        },

        /**
         * Clear all assets
         */
        clearAssets: () => {
          set({ assets: [], error: null })
        },

        // Import/Export actions

        /**
         * Import assets (replaces existing)
         */
        importAssets: (assets) => {
          set({ assets, error: null })
        },

        /**
         * Load demo data (Generic example dataset)
         */
        loadDemoData: () => {
          const { displayCurrency } = get()
          const demoAssets: Asset[] = [
            {
              id: crypto.randomUUID(),
              name: 'Tech Startup SRL',
              category: 'shareholdings',
              ownership: '10%',
              value: 50000,
              currency: displayCurrency,
              source: '2025 Valuation',
              notes: 'Angel round investment 2023',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Real Estate Fund',
              category: 'shareholdings',
              ownership: '5%',
              value: 30000,
              currency: displayCurrency,
              source: 'Market value',
              notes: 'Publicly traded REIT',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Investment Fund',
              category: 'shareholdings',
              ownership: '100%',
              value: 75000,
              currency: displayCurrency,
              source: 'Current NAV',
              notes: 'Balanced equity fund',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Main Residence',
              category: 'realestate',
              ownership: '100%',
              value: 250000,
              currency: displayCurrency,
              source: 'Bank appraisal 2025',
              notes: 'Purchased in 2020',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'City Apartment',
              category: 'realestate',
              ownership: '50%',
              value: 180000,
              currency: displayCurrency,
              source: 'Market value',
              notes: 'Co-ownership',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Crypto Portfolio',
              category: 'personalassets',
              ownership: '100%',
              value: 25000,
              currency: displayCurrency,
              source: 'Current exchange value',
              notes: 'BTC, ETH, various altcoins',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Collectible Car',
              category: 'personalassets',
              ownership: '100%',
              value: 45000,
              currency: displayCurrency,
              source: 'Expert appraisal 2025',
              notes: "Classic 1980s",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Checking Account',
              category: 'cash',
              ownership: '100%',
              value: 35000,
              currency: displayCurrency,
              source: 'Current balance',
              notes: 'Immediate liquidity',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Time Deposit',
              category: 'cash',
              ownership: '100%',
              value: 50000,
              currency: displayCurrency,
              source: 'Face value + interest',
              notes: 'Maturity 2026',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]

          set({ assets: demoAssets, error: null })
        },

        // Currency actions

        setDisplayCurrency: (currency) => {
          set({ displayCurrency: currency })
        },

        setExchangeRate: (rate) => {
          set({ exchangeRate: rate })
        },

        // Computed getters

        /**
         * Get wealth summary with categories
         */
        getSummary: () => {
          const { assets, displayCurrency, exchangeRate } = get()
          
          if (assets.length === 0) {
            return {
              totalWealth: 0,
              categories: [],
              lastUpdated: new Date(),
              assetCount: 0,
            }
          }

          const toDisplay = (asset: Asset) =>
            convertValue(asset.value, asset.currency ?? displayCurrency, displayCurrency, exchangeRate)

          const totalWealth = assets.reduce((sum, asset) => sum + toDisplay(asset), 0)

          const categoryMap = new Map<AssetCategory, { total: number; count: number }>()

          assets.forEach((asset) => {
            const existing = categoryMap.get(asset.category) || { total: 0, count: 0 }
            categoryMap.set(asset.category, {
              total: existing.total + toDisplay(asset),
              count: existing.count + 1,
            })
          })

          const categories: CategorySummary[] = Array.from(categoryMap.entries()).map(
            ([category, data]) => ({
              category,
              total: data.total,
              count: data.count,
              percentage: totalWealth > 0 ? (data.total / totalWealth) * 100 : 0,
            })
          )

          // Sort by total value descending
          categories.sort((a, b) => b.total - a.total)

          return {
            totalWealth,
            categories,
            lastUpdated: new Date(),
            assetCount: assets.length,
          }
        },

        /**
         * Get assets filtered by category
         */
        getAssetsByCategory: (category) => {
          return get().assets.filter((asset) => asset.category === category)
        },

        getDisplayValue: (asset) => {
          const { displayCurrency, exchangeRate } = get()
          return convertValue(asset.value, asset.currency ?? displayCurrency, displayCurrency, exchangeRate)
        },

        /**
         * Set error message
         */
        setError: (error) => {
          set({ error })
        },
      }),
      {
        name: 'wealth-storage',
        partialize: (state) => ({
          assets: state.assets,
          displayCurrency: state.displayCurrency,
          exchangeRate: state.exchangeRate,
        }),
      }
    ),
    {
      name: 'WealthStore',
      enabled: import.meta.env.DEV,
    }
  )
)

// =============================================================================
// CONVENIENCE SELECTORS
// =============================================================================

export const useAssets = () => useWealthStore((state) => state.assets)
export const useWealthSummary = () => useWealthStore((state) => state.getSummary())
export const useWealthError = () => useWealthStore((state) => state.error)
export const useDisplayCurrency = () => useWealthStore((state) => state.displayCurrency)
export const useExchangeRate = () => useWealthStore((state) => state.exchangeRate)
