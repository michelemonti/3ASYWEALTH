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
import type { Asset, AssetCategory, WealthSummary, CategorySummary } from '../types/wealth'

// =============================================================================
// STORE INTERFACE
// =============================================================================

interface WealthStore {
  // State
  assets: Asset[]
  isLoading: boolean
  error: string | null

  // Actions - CRUD
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateAsset: (id: string, updates: Partial<Asset>) => void
  deleteAsset: (id: string) => void
  clearAssets: () => void

  // Actions - Import/Export
  importAssets: (assets: Asset[]) => void
  loadDemoData: () => void

  // Computed
  getSummary: () => WealthSummary
  getAssetsByCategory: (category: AssetCategory) => Asset[]
  
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
          const demoAssets: Asset[] = [
            {
              id: crypto.randomUUID(),
              name: 'Tech Startup SRL',
              category: 'shareholdings',
              ownership: '10%',
              value: 50000,
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
              source: 'Face value + interest',
              notes: 'Maturity 2026',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]

          set({ assets: demoAssets, error: null })
        },

        // Computed getters

        /**
         * Get wealth summary with categories
         */
        getSummary: () => {
          const { assets } = get()
          
          if (assets.length === 0) {
            return {
              totalWealth: 0,
              categories: [],
              lastUpdated: new Date(),
              assetCount: 0,
            }
          }

          const totalWealth = assets.reduce((sum, asset) => sum + asset.value, 0)

          const categoryMap = new Map<AssetCategory, { total: number; count: number }>()

          assets.forEach((asset) => {
            const existing = categoryMap.get(asset.category) || { total: 0, count: 0 }
            categoryMap.set(asset.category, {
              total: existing.total + asset.value,
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
