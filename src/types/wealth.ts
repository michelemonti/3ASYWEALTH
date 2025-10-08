/**
 * Wealth Types
 * 
 * Type definitions for wealth tracking features
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

// =============================================================================
// ASSET CATEGORIES
// =============================================================================

export type AssetCategory = 
  | 'shareholdings'       // Shareholdings/Equity/Partecipazioni
  | 'realestate'          // Real Estate/Immobili
  | 'personalassets'      // Personal Assets/Beni personali
  | 'cash'                // Cash/Liquidity/Liquidità

// =============================================================================
// ASSET INTERFACE
// =============================================================================

export interface Asset {
  id: string
  name: string                    // Asset / Company name
  category: AssetCategory
  ownership: string               // Ownership percentage or quantity
  value: number                   // Value in EUR
  source: string                  // Valuation source/basis
  notes?: string                  // Additional notes/compensation
  createdAt: Date
  updatedAt: Date
  userId?: string                 // For multi-user support (optional)
}

// =============================================================================
// SUMMARY INTERFACES
// =============================================================================

export interface CategorySummary {
  category: AssetCategory
  total: number
  count: number
  percentage: number
}

export interface WealthSummary {
  totalWealth: number
  categories: CategorySummary[]
  lastUpdated: Date
  assetCount: number
}

// =============================================================================
// IMPORT/EXPORT INTERFACES
// =============================================================================

export interface ImportRow {
  'Asset / Società': string
  'Quota Michele Monti': string
  'Valore (€)': string
  'Fonte / Base di stima': string
  'Note / Compensi': string
  'Categoria': string
}

export interface ExportData {
  assets: Asset[]
  summary: WealthSummary
  exportDate: Date
  version: string
}

// =============================================================================
// CATEGORY METADATA
// =============================================================================

export interface CategoryMetadata {
  label: string
  icon: string
  color: string
  description: string
}

export const CATEGORY_METADATA: Record<AssetCategory, CategoryMetadata> = {
  'shareholdings': {
    label: 'Holdings',
    icon: 'Building2',
    color: 'blue',
    description: 'Shares and equity holdings'
  },
  'realestate': {
    label: 'Real Estate',
    icon: 'Home',
    color: 'green',
    description: 'Real estate properties'
  },
  'personalassets': {
    label: 'Personal Assets',
    icon: 'Gem',
    color: 'purple',
    description: 'Personal valuable assets'
  },
  'cash': {
    label: 'Liquidity',
    icon: 'Wallet',
    color: 'amber',
    description: 'Cash and liquid assets'
  }
}
