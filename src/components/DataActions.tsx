/**
 * Data Actions Component
 * 
 * Dropdown menu for import/export/demo data operations
 * Uses toast notifications and confirmation dialogs for professional UX
 * 
 * @author Michele Miky Monti
 * @version 2.0.0
 */

import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Download, 
  Upload, 
  Database, 
  FileText, 
  ChevronDown,
  Trash2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import { 
  importCSVFile, 
  importJSONFile, 
  downloadCSV, 
  downloadJSON 
} from '@/lib/importExport'

type ConfirmAction = 'demo' | 'clear' | null

export function DataActions() {
  const { t } = useTranslation()
  const { assets, getSummary, importAssets, loadDemoData, clearAssets } = useWealthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = useRef<HTMLInputElement>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

  const handleImportCSV = () => {
    fileInputRef.current?.click()
  }

  const handleImportJSON = () => {
    jsonInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const loadingToast = toast.loading(t('dataActions.import.loading', 'Importing...'))

    try {
      const importedAssets = await importCSVFile(file)
      
      if (importedAssets.length === 0) {
        toast.dismiss(loadingToast)
        toast.error(t('dataActions.import.empty', 'No valid assets found in file'))
        return
      }

      importAssets(importedAssets)
      toast.dismiss(loadingToast)
      toast.success(t('dataActions.import.success', { count: importedAssets.length }), {
        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      })
    } catch (error) {
      console.error('Import error:', error)
      toast.dismiss(loadingToast)
      toast.error(t('dataActions.import.error'))
    }

    event.target.value = ''
  }

  const handleJSONChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const loadingToast = toast.loading(t('dataActions.import.loading', 'Importing...'))

    try {
      const importedAssets = await importJSONFile(file)
      
      if (importedAssets.length === 0) {
        toast.dismiss(loadingToast)
        toast.error(t('dataActions.import.empty', 'No valid assets found in file'))
        return
      }

      importAssets(importedAssets)
      toast.dismiss(loadingToast)
      toast.success(t('dataActions.import.success', { count: importedAssets.length }), {
        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      })
    } catch (error) {
      console.error('Import error:', error)
      toast.dismiss(loadingToast)
      toast.error(t('dataActions.import.error'))
    }

    event.target.value = ''
  }

  const handleExportCSV = () => {
    if (assets.length === 0) {
      toast.warning(t('dataActions.export.empty', 'No assets to export'))
      return
    }
    
    downloadCSV(assets, `3asywealth-export-${new Date().toISOString().split('T')[0]}.csv`)
    toast.success(t('dataActions.export.success', 'Export completed'))
  }

  const handleExportJSON = () => {
    if (assets.length === 0) {
      toast.warning(t('dataActions.export.empty', 'No assets to export'))
      return
    }
    
    downloadJSON(assets, getSummary(), `3asywealth-export-${new Date().toISOString().split('T')[0]}.json`)
    toast.success(t('dataActions.export.success', 'Export completed'))
  }

  const handleLoadDemo = () => {
    if (assets.length > 0) {
      setConfirmAction('demo')
    } else {
      executeDemoLoad()
    }
  }

  const executeDemoLoad = () => {
    loadDemoData()
    toast.success(t('dataActions.demo.success'), {
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    })
    setConfirmAction(null)
  }

  const handleClearAll = () => {
    if (assets.length === 0) {
      toast.info(t('dataActions.clear.empty', 'No data to clear'))
      return
    }
    setConfirmAction('clear')
  }

  const executeClear = () => {
    clearAssets()
    toast.success(t('dataActions.clear.success'), {
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    })
    setConfirmAction(null)
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
          {/* Import Section */}
          <DropdownMenuItem onClick={handleImportCSV} className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            {t('dataActions.import.csv')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImportJSON} className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            {t('dataActions.import.json')}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Export Section */}
          <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
            <Download className="w-4 h-4 mr-2" />
            {t('dataActions.export.csv')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer">
            <Download className="w-4 h-4 mr-2" />
            {t('dataActions.export.json')}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Demo Data */}
          <DropdownMenuItem onClick={handleLoadDemo} className="cursor-pointer">
            <FileText className="w-4 h-4 mr-2" />
            {t('dataActions.demo.load')}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Danger Zone */}
          <DropdownMenuItem 
            onClick={handleClearAll} 
            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('dataActions.clear.title')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {confirmAction === 'clear' 
                ? t('dataActions.clear.title')
                : t('dataActions.demo.confirmTitle', 'Load Demo Data')
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'clear'
                ? t('dataActions.clear.confirm')
                : t('dataActions.demo.confirm')
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction === 'clear' ? executeClear : executeDemoLoad}
              className={confirmAction === 'clear' 
                ? 'bg-destructive hover:bg-destructive/90' 
                : 'bg-primary hover:bg-primary/90'
              }
            >
              {confirmAction === 'clear'
                ? t('dataActions.clear.confirm_button', 'Delete All')
                : t('dataActions.demo.confirm_button', 'Load Demo')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Import CSV file"
      />
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json"
        onChange={handleJSONChange}
        className="hidden"
        aria-label="Import JSON file"
      />
    </>
  )
}