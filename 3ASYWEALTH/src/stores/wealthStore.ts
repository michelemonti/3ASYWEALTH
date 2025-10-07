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
         * 🎭 Load demo data (Miky Monti example)
         */
        loadDemoData: () => {
          const demoAssets: Asset[] = [
            {
              id: crypto.randomUUID(),
              name: 'Studio Pedrini S.R.L. (+ Juno Design)',
              category: 'Partecipazioni',
              ownership: '6.33%',
              value: 158250,
              source: 'EV gruppo 2,4M (Deloitte 2023)',
              notes: 'Nessun compenso attuale',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Juno Design S.R.L.',
              category: 'Partecipazioni',
              ownership: 'inclusa in SP (100% controllata)',
              value: 0,
              source: '1.5M Inclusa in SP',
              notes: 'C.D.A. compenso 70k €/anno lordi',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: '3FESTO S.R.L.',
              category: 'Partecipazioni',
              ownership: '34.6%',
              value: 87000,
              source: 'EV stimato 250k €',
              notes: 'A.U. compenso 5k €/anno lordi',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: '5J S.R.L.',
              category: 'Partecipazioni',
              ownership: '8%',
              value: 48000,
              source: 'Valore immobili 600k €',
              notes: 'Società immobiliare familiare',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Ditta individuale',
              category: 'Partecipazioni',
              ownership: '100%',
              value: 5000,
              source: 'Fatturato lordo annuo',
              notes: 'Attività accessoria',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Immobile – Via Guercino (Casalecchio)',
              category: 'Immobili',
              ownership: '100%',
              value: 250000,
              source: 'Valore di mercato oct2025',
              notes: 'Proprietà piena',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Immobile – Via Curiel (Casalecchio)',
              category: 'Immobili',
              ownership: '50%',
              value: 170000,
              source: 'Valore di mercato oct2025',
              notes: 'Proprietà al 50%',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Crypto + stock',
              category: 'Beni personali',
              ownership: '-',
              value: 20000,
              source: 'Portafoglio personale oct2025',
              notes: '',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: 'Orologi collezione',
              category: 'Beni personali',
              ownership: '-',
              value: 15000,
              source: 'Valutazione personale oct2025',
              notes: '',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: crypto.randomUUID(),
              name: "Opere d'arte",
              category: 'Beni personali',
              ownership: '-',
              value: 5000,
              source: 'Stima prudenziale',
              notes: '',
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
