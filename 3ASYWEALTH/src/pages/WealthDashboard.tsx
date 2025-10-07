/**
 * 💰 Wealth Dashboard
 * 
 * Main dashboard for wealth tracking with tabs for table and summary views
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

import { useState, useRef } from 'react'
import { useWealthStore } from '@/stores/wealthStore'
import { AssetsTable } from './AssetsTable'
import { WealthSummary } from './WealthSummary'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const { assets, importAssets, clearAssets, loadDemoData, getSummary } = useWealthStore()
  const [showClearDialog, setShowClearDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv')

  const handleExportCSV = () => {
    if (assets.length === 0) {
      toast.error('Nessun asset da esportare')
      return
    }

    downloadCSV(assets, `wealth-${new Date().toISOString().split('T')[0]}.csv`)
    toast.success('Dati esportati in CSV')
  }

  const handleExportJSON = () => {
    if (assets.length === 0) {
      toast.error('Nessun asset da esportare')
      return
    }

    const summary = getSummary()
    downloadJSON(assets, summary, `wealth-${new Date().toISOString().split('T')[0]}.json`)
    toast.success('Dati esportati in JSON')
  }

  const handleImportClick = (format: 'csv' | 'json') => {
    setImportFormat(format)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      let importedAssets
      
      if (importFormat === 'csv') {
        importedAssets = await importCSVFile(file)
        toast.success(`${importedAssets.length} asset importati da CSV`)
      } else {
        importedAssets = await importJSONFile(file)
        toast.success(`${importedAssets.length} asset importati da JSON`)
      }

      if (importedAssets.length > 0) {
        importAssets(importedAssets)
      } else {
        toast.warning('Nessun asset trovato nel file')
      }
    } catch (error) {
      toast.error('Errore durante l\'importazione: ' + (error as Error).message)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleLoadDemo = () => {
    loadDemoData()
    toast.success('Dati demo caricati (Miky Monti)')
  }

  const handleClearData = () => {
    clearAssets()
    setShowClearDialog(false)
    toast.success('Tutti i dati sono stati cancellati')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                💰 3ASYWEALTH
              </h1>
              <p className="text-gray-600 mt-1">
                Gestione e monitoraggio del patrimonio personale
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Esporta
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Formato Export</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <FileText className="w-4 h-4 mr-2" />
                    Esporta CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportJSON}>
                    <FileJson className="w-4 h-4 mr-2" />
                    Esporta JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Import Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Importa
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Formato Import</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleImportClick('csv')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Importa da CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleImportClick('json')}>
                    <FileJson className="w-4 h-4 mr-2" />
                    Importa da JSON
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
                  <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLoadDemo}>
                    <Database className="w-4 h-4 mr-2" />
                    Carica Dati Demo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowClearDialog(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancella Tutti i Dati
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Stats Bar */}
          {assets.length > 0 && (
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
              <span>
                <strong>{assets.length}</strong> asset totali
              </span>
              <span>
                <strong>
                  {new Intl.NumberFormat('it-IT', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                  }).format(getSummary().totalWealth)}
                </strong>
                {' '}patrimonio totale
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="table" className="py-6">
        <div className="container mx-auto px-4">
          <TabsList className="mb-6">
            <TabsTrigger value="table" className="px-6">
              📋 Tabella Asset
            </TabsTrigger>
            <TabsTrigger value="summary" className="px-6">
              📊 Sintesi & Grafici
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-0">
            <AssetsTable />
          </TabsContent>

          <TabsContent value="summary" className="mt-0">
            <WealthSummary />
          </TabsContent>
        </div>
      </Tabs>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={importFormat === 'csv' ? '.csv' : '.json'}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Clear Data Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione cancellerà permanentemente tutti i tuoi asset.
              Questa operazione non può essere annullata.
              <br /><br />
              <strong>Consiglio:</strong> Esporta i tuoi dati prima di procedere.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearData}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancella Tutto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
