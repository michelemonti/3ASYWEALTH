/**
 * Wealth Dashboard
 * 
 * Main dashboard for wealth tracking with tabs for table and summary views
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWealthStore } from '@/stores/wealthStore'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/Navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  Trash2, 
  Database,
  FileText,
  FileJson,
  MoreVertical 
} from 'lucide-react'
import { downloadCSV, downloadJSON, importCSVFile, importJSONFile } from '@/lib/importExport'
import { toast } from 'sonner'

export function WealthDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { assets, importAssets, clearAssets, loadDemoData } = useWealthStore()
  const [showClearDialog, setShowClearDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calculate total wealth with useMemo
  const totalWealth = useMemo(() => {
    return assets.reduce((sum, asset) => sum + asset.value, 0)
  }, [assets])

  const handleExportCSV = () => {
    if (assets.length === 0) {
      toast.error(t('assetsTable.notifications.import_error'))
      return
    }

    downloadCSV(assets, `wealth-${new Date().toISOString().split('T')[0]}.csv`)
    toast.success(t('assetsTable.notifications.added'))
  }

  const handleExportJSON = () => {
    if (assets.length === 0) {
      toast.error(t('assetsTable.notifications.import_error'))
      return
    }

    // Calculate summary for export
    const summary = {
      totalWealth,
      assetCount: assets.length,
      categories: [],
      lastUpdated: new Date(),
    }
    downloadJSON(assets, summary, `wealth-${new Date().toISOString().split('T')[0]}.json`)
    toast.success(t('assetsTable.notifications.added'))
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      let importedAssets
      
      // Auto-detect format from file extension
      const fileName = file.name.toLowerCase()
      const actualFormat = fileName.endsWith('.json') ? 'json' : 'csv'
      
      if (actualFormat === 'csv') {
        importedAssets = await importCSVFile(file)
        toast.success(t('assetsTable.notifications.import_success', { count: importedAssets.length }))
      } else {
        importedAssets = await importJSONFile(file)
        toast.success(t('assetsTable.notifications.import_success', { count: importedAssets.length }))
      }

      if (importedAssets.length > 0) {
        importAssets(importedAssets)
      } else {
        toast.warning(t('assetsTable.notifications.import_error'))
      }
    } catch (error) {
      toast.error(t('assetsTable.notifications.import_error'))
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleLoadDemo = () => {
    loadDemoData()
    toast.success(t('assetsTable.notifications.demo_loaded'))
  }

  const handleClearData = () => {
    clearAssets()
    setShowClearDialog(false)
    toast.success(t('assetsTable.notifications.clear_success'))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('dashboard.title')}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3">
              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    {t('dashboard.menu.export_csv').split(' ')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('dashboard.menu.export_csv').split(' ')[0]}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <FileText className="w-4 h-4 mr-2" />
                    {t('dashboard.menu.export_csv')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportJSON}>
                    <FileJson className="w-4 h-4 mr-2" />
                    {t('dashboard.menu.export_json')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Import Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    {t('dashboard.menu.import')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('dashboard.menu.import')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleImportClick}>
                    <Upload className="w-4 h-4 mr-2" />
                    {t('dashboard.menu.import')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* More Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('common.add')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLoadDemo}>
                    <Database className="w-4 h-4 mr-2" />
                    {t('dashboard.menu.demo')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowClearDialog(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('dashboard.menu.clear')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Dashboard Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Wealth Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {t('dashboard.total_wealth')}
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                }).format(totalWealth)}
              </p>
            </div>

            {/* Asset Count Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {t('dashboard.asset_count')}
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {assets.length}
              </p>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-sm font-medium text-gray-500 mb-4">
                {t('dashboard.quick_actions')}
              </h3>
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate('/assets')} className="w-full">
                  {t('dashboard.view_assets')}
                </Button>
                <Button variant="outline" onClick={() => navigate('/summary')} className="w-full">
                  {t('dashboard.view_summary')}
                </Button>
              </div>
            </div>
          </div>
        </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Clear Data Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('assetsTable.delete.confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('assetsTable.notifications.clear_confirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearData}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('dashboard.menu.clear')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
