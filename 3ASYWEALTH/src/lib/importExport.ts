/**
 * 📥 Import/Export Utilities
 * 
 * Helpers for importing and exporting wealth data
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

import type { Asset, AssetCategory, ExportData } from '@/types/wealth'

// =============================================================================
// 📥 CSV IMPORT
// =============================================================================

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

    // Validate category
    const validCategories: AssetCategory[] = ['Partecipazioni', 'Immobili', 'Beni personali', 'Liquidità']
    const assetCategory = validCategories.find(c => c.toLowerCase() === category.toLowerCase()) || 'Beni personali'

    assets.push({
      id: crypto.randomUUID(),
      name: name || 'Asset senza nome',
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
    
    reader.onerror = () => reject(new Error('Errore nella lettura del file'))
    reader.readAsText(file)
  })
}

// =============================================================================
// 📤 CSV EXPORT
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
// 📥 JSON IMPORT
// =============================================================================

/**
 * Parse JSON file to assets
 */
export function parseJSON(jsonText: string): Asset[] {
  try {
    const data = JSON.parse(jsonText)
    
    // Handle different JSON formats
    let assets: any[] = []
    
    if (Array.isArray(data)) {
      assets = data
    } else if (data.assets && Array.isArray(data.assets)) {
      assets = data.assets
    } else {
      throw new Error('Formato JSON non valido')
    }

    return assets.map(asset => ({
      id: asset.id || crypto.randomUUID(),
      name: asset.name || 'Asset senza nome',
      category: asset.category || 'Beni personali',
      ownership: asset.ownership || '-',
      value: parseFloat(asset.value) || 0,
      source: asset.source || '',
      notes: asset.notes || '',
      createdAt: asset.createdAt ? new Date(asset.createdAt) : new Date(),
      updatedAt: asset.updatedAt ? new Date(asset.updatedAt) : new Date(),
      userId: asset.userId,
    }))
  } catch (error) {
    throw new Error('Errore nel parsing JSON: ' + (error as Error).message)
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
    
    reader.onerror = () => reject(new Error('Errore nella lettura del file'))
    reader.readAsText(file)
  })
}

// =============================================================================
// 📤 JSON EXPORT
// =============================================================================

/**
 * Convert assets to JSON with metadata
 */
export function assetsToJSON(assets: Asset[], summary: any): ExportData {
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
export function downloadJSON(assets: Asset[], summary: any, filename = 'wealth-export.json') {
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
