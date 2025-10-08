/**
 * Data Actions Component
 * 
 * Dropdown menu for import/export/demo data operations
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useWealthStore } from '@/stores/wealthStore'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Download, 
  Upload, 
  Database, 
  FileText, 
  FileJson,
  ChevronDown,
  Trash2
} from 'lucide-react'
import { 
  importCSVFile, 
  importJSONFile, 
  downloadCSV, 
  downloadJSON 
} from '@/lib/importExport'

export function DataActions() {
  const { t } = useTranslation()
  const { assets, getSummary, importAssets, loadDemoData, clearAssets } = useWealthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = useRef<HTMLInputElement>(null)

  const handleImportCSV = () => {
    fileInputRef.current?.click()
  }

  const handleImportJSON = () => {
    jsonInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const importedAssets = await importCSVFile(file)
      importAssets(importedAssets)
      alert(t('dataActions.import.success', { count: importedAssets.length }))
    } catch (error) {
      console.error('Import error:', error)
      alert(t('dataActions.import.error'))
    }

    // Reset input
    event.target.value = ''
  }

  const handleJSONChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const importedAssets = await importJSONFile(file)
      importAssets(importedAssets)
      alert(t('dataActions.import.success', { count: importedAssets.length }))
    } catch (error) {
      console.error('Import error:', error)
      alert(t('dataActions.import.error'))
    }

    // Reset input
    event.target.value = ''
  }

  const handleExportCSV = () => {
    downloadCSV(assets, 'wealth-export.csv')
  }

  const handleExportJSON = () => {
    downloadJSON(assets, getSummary(), 'wealth-export.json')
  }

  const handleLoadDemo = () => {
    if (assets.length > 0) {
      if (!confirm(t('dataActions.demo.confirm'))) {
        return
      }
    }
    loadDemoData()
    alert(t('dataActions.demo.success'))
  }

  const handleClearAll = () => {
    if (assets.length === 0) {
      return // Non fare nulla se non ci sono dati
    }
    
    if (confirm(t('dataActions.clear.confirm'))) {
      clearAssets()
      alert(t('dataActions.clear.success'))
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Database className="w-4 h-4" />
            {t('dataActions.title')}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleImportCSV} className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            {t('dataActions.import.csv')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImportJSON} className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            {t('dataActions.import.json')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
            <Download className="w-4 h-4 mr-2" />
            {t('dataActions.export.csv')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer">
            <Download className="w-4 h-4 mr-2" />
            {t('dataActions.export.json')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLoadDemo} className="cursor-pointer">
            <FileText className="w-4 h-4 mr-2" />
            {t('dataActions.demo.load')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleClearAll} className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" />
            {t('dataActions.clear.title')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json"
        onChange={handleJSONChange}
        className="hidden"
      />
    </>
  )
}