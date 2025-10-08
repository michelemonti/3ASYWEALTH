/**
 * Import/Export Utilities
 * 
 * Helpers for importing and exporting wealth data
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

import type { Asset, AssetCategory, ExportData, WealthSummary } from '@/types/wealth'

// =============================================================================
// CSV IMPORT
// =============================================================================

/**
 * Parse category string to AssetCategory (supports multiple languages)
 */
export const parseCategory = (value: string): AssetCategory => {
  const normalized = value.toLowerCase().trim()
  
  // Map multilingual category names to English keys
  const categoryMap: Record<string, AssetCategory> = {
    // English
    'shareholdings': 'shareholdings',
    'holdings': 'shareholdings',
    'shares': 'shareholdings',
    'equity': 'shareholdings',
    'realestate': 'realestate',
    'real estate': 'realestate',
    'property': 'realestate',
    'personalassets': 'personalassets',
    'personal assets': 'personalassets',
    'assets': 'personalassets',
    'cash': 'cash',
    'liquidity': 'cash',
    'liquid': 'cash',
    // Italian
    'partecipazioni': 'shareholdings',
    'immobili': 'realestate',
    'beni personali': 'personalassets',
    'liquidità': 'cash',
    // Spanish
    'participaciones': 'shareholdings',
    'bienes raíces': 'realestate',
    'activos personales': 'personalassets',
    'liquidez': 'cash',
  }
  
  return categoryMap[normalized] || 'personalassets'
}

/**
 * Parse CSV file to assets
 */
export function parseCSV(csvText: string): Asset[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []

  // Skip header
  const dataLines = lines.slice(1)
  const assets: Asset[] = []

  for (const line of dataLines) {
    // Simple CSV parser (handles basic cases)
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    
    if (values.length < 6) continue

    const [name, ownership, valueStr, source, notes, category] = values

    // Parse value
    const value = parseFloat(valueStr.replace(/[^\d.-]/g, '')) || 0

    // Parse category with multilingual support
    const assetCategory = parseCategory(category)

    assets.push({
      id: crypto.randomUUID(),
      name: name || 'Unnamed Asset',
      category: assetCategory,
      ownership: ownership || '-',
      value,
      source: source || '',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  return assets
}

/**
 * Handle CSV file import
 */
export async function importCSVFile(file: File): Promise<Asset[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const assets = parseCSV(text)
        resolve(assets)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsText(file)
  })
}

// =============================================================================
// CSV EXPORT
// =============================================================================

/**
 * Convert assets to CSV format
 */
export function assetsToCSV(assets: Asset[]): string {
  const headers = [
    'Asset / Società',
    'Quota Michele Monti',
    'Valore (€)',
    'Fonte / Base di stima',
    'Note / Compensi',
    'Categoria'
  ]

  const rows = assets.map(asset => [
    asset.name,
    asset.ownership,
    asset.value.toString(),
    asset.source,
    asset.notes || '',
    asset.category
  ])

  const csvLines = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ]

  return csvLines.join('\n')
}

/**
 * Download CSV file
 */
export function downloadCSV(assets: Asset[], filename = 'wealth-export.csv') {
  const csv = assetsToCSV(assets)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// =============================================================================
// JSON IMPORT
// =============================================================================

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const parseDate = (value: unknown): Date => {
  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  return new Date()
}

type RawAsset = Record<string, unknown>

/**
 * Parse JSON file to assets
 */
export function parseJSON(jsonText: string): Asset[] {
  try {
    const data = JSON.parse(jsonText)
    
    // Handle different JSON formats
    let assets: RawAsset[] = []

    if (Array.isArray(data)) {
      assets = data.filter((item): item is RawAsset => isRecord(item))
    } else if (isRecord(data) && Array.isArray(data.assets)) {
      assets = data.assets.filter((item): item is RawAsset => isRecord(item))
    } else {
      throw new Error('Invalid JSON format')
    }

    return assets.map((asset) => {
      const id = typeof asset.id === 'string' && asset.id.length > 0 ? asset.id : crypto.randomUUID()
      const name = typeof asset.name === 'string' && asset.name.trim().length > 0 ? asset.name : 'Unnamed Asset'
      const ownership = typeof asset.ownership === 'string' && asset.ownership.length > 0 ? asset.ownership : '-'
      const source = typeof asset.source === 'string' ? asset.source : ''
      const notes = typeof asset.notes === 'string' ? asset.notes : undefined
      const userId = typeof asset.userId === 'string' ? asset.userId : undefined
      const value = typeof asset.value === 'number'
        ? asset.value
        : parseFloat(String(asset.value ?? '0')) || 0

      // Parse category with type safety
      const categoryValue = typeof asset.category === 'string' ? asset.category : ''
      const category = parseCategory(categoryValue)

      return {
        id,
        name,
        category,
        ownership,
        value,
        source,
        notes,
        createdAt: parseDate(asset.createdAt),
        updatedAt: parseDate(asset.updatedAt),
        userId,
      }
    })
  } catch (error) {
    throw new Error('JSON parsing error: ' + (error as Error).message)
  }
}

/**
 * Handle JSON file import
 */
export async function importJSONFile(file: File): Promise<Asset[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const assets = parseJSON(text)
        resolve(assets)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsText(file)
  })
}

// =============================================================================
// JSON EXPORT
// =============================================================================

/**
 * Convert assets to JSON with metadata
 */
export function assetsToJSON(assets: Asset[], summary: WealthSummary): ExportData {
  return {
    assets,
    summary,
    exportDate: new Date(),
    version: '1.0.0'
  }
}

/**
 * Download JSON file
 */
export function downloadJSON(assets: Asset[], summary: WealthSummary, filename = 'wealth-export.json') {
  const data = assetsToJSON(assets, summary)
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
