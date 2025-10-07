/**
 * 💰 Wealth Store (Zustand)
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
// 🔧 STORE INTERFACE
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
// 🎯 STORE IMPLEMENTATION
// =============================================================================

export const useWealthStore = create<WealthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ====== INITIAL STATE ======
        assets: [],
        isLoading: false,
        error: null,

        // ====== CRUD ACTIONS ======

        /**
         * ➕ Add new asset
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
         * ✏️ Update existing asset
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
         * 🗑️ Delete asset
         */
        deleteAsset: (id) => {
          set((state) => ({
            assets: state.assets.filter((asset) => asset.id !== id),
            error: null,
          }))
        },

        /**
         * 🧹 Clear all assets
         */
        clearAssets: () => {
          set({ assets: [], error: null })
        },

        // ====== IMPORT/EXPORT ACTIONS ======

        /**
         * 📥 Import assets (replaces existing)
         */
        importAssets: (assets) => {
          set({ assets, error: null })
        },

        /**
         * 🎭 Load demo data (Generic example dataset)
         */
        loadDemoData: () => {
          const demoAssets: Asset[] = [
            {
              id: crypto.randomUUID(),
              name: 'Startup Tech SRL',
              category: 'Partecipazioni',
              ownership: '10%',
              value: 50000,
              source: 'Valutazione 2025',
              notes: 'Investimento angel round 2023',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Immobiliare Italia SPA',
              category: 'Partecipazioni',
              ownership: '5%',
              value: 30000,
              source: 'Valore di mercato',
              notes: 'REIT quotato',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Fondo Investimento',
              category: 'Partecipazioni',
              ownership: '100%',
              value: 75000,
              source: 'NAV attuale',
              notes: 'Fondo azionario bilanciato',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Casa Principale',
              category: 'Immobili',
              ownership: '100%',
              value: 250000,
              source: 'Perizia bancaria 2025',
              notes: 'Acquistata nel 2020',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Appartamento Milano',
              category: 'Immobili',
              ownership: '50%',
              value: 180000,
              source: 'Valore di mercato',
              notes: 'In comproprietà',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Portfolio Crypto',
              category: 'Beni personali',
              ownership: '100%',
              value: 25000,
              source: 'Valore attuale exchange',
              notes: 'BTC, ETH, diversi altcoin',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Auto Collezione',
              category: 'Beni personali',
              ownership: '100%',
              value: 45000,
              source: 'Valutazione perito 2025',
              notes: "Classica anni '80",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Conto Corrente',
              category: 'Liquidità',
              ownership: '100%',
              value: 35000,
              source: 'Saldo attuale',
              notes: 'Liquidità immediata',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Deposito Vincolato',
              category: 'Liquidità',
              ownership: '100%',
              value: 50000,
              source: 'Valore nominale + interessi',
              notes: 'Scadenza 2026',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]

          set({ assets: demoAssets, error: null })
        },

        // ====== COMPUTED GETTERS ======

        /**
         * 📊 Get wealth summary with categories
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
         * 🏷️ Get assets filtered by category
         */
        getAssetsByCategory: (category) => {
          return get().assets.filter((asset) => asset.category === category)
        },

        /**
         * ⚠️ Set error message
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
// 🎣 CONVENIENCE SELECTORS
// =============================================================================

export const useAssets = () => useWealthStore((state) => state.assets)
export const useWealthSummary = () => useWealthStore((state) => state.getSummary())
export const useWealthError = () => useWealthStore((state) => state.error)
