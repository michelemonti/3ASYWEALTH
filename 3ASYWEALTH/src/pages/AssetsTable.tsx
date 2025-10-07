/**
 * 📊 Assets Table Page
 * 
 * CRUD interface for managing wealth assets
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

import { useState } from 'react'
import { useWealthStore } from '@/stores/wealthStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2, Building2, Home, Gem, Wallet } from 'lucide-react'
import { CATEGORY_METADATA, type AssetCategory } from '@/types/wealth'

const categoryIcons = {
  Building2,
  Home,
  Gem,
  Wallet,
}

export function AssetsTable() {
  const { assets, addAsset, updateAsset, deleteAsset } = useWealthStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<AssetCategory | 'all'>('all')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Partecipazioni' as AssetCategory,
    ownership: '',
    value: '',
    source: '',
    notes: '',
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.value) {
      alert('Nome e Valore sono obbligatori')
      return
    }

    const assetData = {
      name: formData.name,
      category: formData.category,
      ownership: formData.ownership,
      value: parseFloat(formData.value),
      source: formData.source,
      notes: formData.notes,
    }

    if (editingAsset) {
      updateAsset(editingAsset, assetData)
      setEditingAsset(null)
    } else {
      addAsset(assetData)
    }

    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEdit = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId)
    if (asset) {
      setFormData({
        name: asset.name,
        category: asset.category,
        ownership: asset.ownership,
        value: asset.value.toString(),
        source: asset.source,
        notes: asset.notes || '',
      })
      setEditingAsset(assetId)
      setIsAddDialogOpen(true)
    }
  }

  const handleDelete = (assetId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo asset?')) {
      deleteAsset(assetId)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Partecipazioni',
      ownership: '',
      value: '',
      source: '',
      notes: '',
    })
    setEditingAsset(null)
  }

  const filteredAssets = filterCategory === 'all' 
    ? assets 
    : assets.filter((a) => a.category === filterCategory)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">I Tuoi Asset</CardTitle>
              <CardDescription>
                Gestisci il tuo patrimonio: aggiungi, modifica ed elimina asset
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAsset ? 'Modifica Asset' : 'Nuovo Asset'}
                  </DialogTitle>
                  <DialogDescription>
                    Inserisci i dettagli dell'asset
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome Asset / Società *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="es. Studio Pedrini S.R.L."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value as AssetCategory })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_METADATA).map(([key, meta]) => (
                            <SelectItem key={key} value={key}>
                              {meta.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="ownership">Quota / Quantità</Label>
                      <Input
                        id="ownership"
                        value={formData.ownership}
                        onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                        placeholder="es. 25% o 100%"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="value">Valore (€) *</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="es. 100000"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="source">Fonte / Base di Stima</Label>
                    <Input
                      id="source"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      placeholder="es. Perizia, Valutazione di mercato"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Note / Compensi</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Note aggiuntive..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsAddDialogOpen(false)
                    resetForm()
                  }}>
                    Annulla
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingAsset ? 'Salva Modifiche' : 'Aggiungi'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filter */}
          <div className="mb-4">
            <Select
              value={filterCategory}
              onValueChange={(value) => setFilterCategory(value as AssetCategory | 'all')}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtra per categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                {Object.entries(CATEGORY_METADATA).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>
                    {meta.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Nessun asset trovato</p>
              <p className="text-sm">Aggiungi il tuo primo asset per iniziare</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset / Società</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Quota</TableHead>
                    <TableHead className="text-right">Valore</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead className="w-[100px]">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => {
                    const metadata = CATEGORY_METADATA[asset.category]
                    const IconComponent = categoryIcons[metadata.icon as keyof typeof categoryIcons]
                    
                    return (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <IconComponent className="w-3 h-3" />
                            {metadata.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{asset.ownership}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(asset.value)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {asset.source}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(asset.id)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(asset.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
