/**
 * Assets Table Page
 * 
 * CRUD interface for managing wealth assets
 * 
 * @author Michele Miky Monti
 * @version 2.0.0
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useWealthStore } from '@/stores/wealthStore'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DataActions } from '@/components/DataActions'
import { PrivacyBadge } from '@/components/PrivacyBadge'
import { Plus, Pencil, Trash2, Building2, Home, Gem, Wallet, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { CATEGORY_METADATA, type AssetCategory } from '@/types/wealth'

const categoryIcons = {
  Building2,
  Home,
  Gem,
  Wallet,
}

export function AssetsTable() {
  const { t } = useTranslation()
  const { assets, addAsset, updateAsset, deleteAsset } = useWealthStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<AssetCategory | 'all'>('all')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Helper to get translated category label
  const getCategoryLabel = (category: AssetCategory) => t(`categories.${category}`)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'shareholdings' as AssetCategory,
    ownership: '',
    value: '',
    source: '',
    notes: '',
  })

  // Form validation
  const [formErrors, setFormErrors] = useState<{ name?: boolean; value?: boolean }>({})

  const validateForm = () => {
    const errors: { name?: boolean; value?: boolean } = {}
    
    if (!formData.name.trim()) {
      errors.name = true
    }
    
    if (!formData.value || parseFloat(formData.value) <= 0) {
      errors.value = true
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error(t('assetsTable.form.validation_error', 'Please fill in all required fields'))
      return
    }

    const assetData = {
      name: formData.name.trim(),
      category: formData.category,
      ownership: formData.ownership.trim(),
      value: parseFloat(formData.value),
      source: formData.source.trim(),
      notes: formData.notes.trim(),
    }

    if (editingAsset) {
      updateAsset(editingAsset, assetData)
      toast.success(t('assetsTable.form.updated', 'Asset updated successfully'), {
        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      })
      setEditingAsset(null)
    } else {
      addAsset(assetData)
      toast.success(t('assetsTable.form.added', 'Asset added successfully'), {
        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      })
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
      setFormErrors({})
      setEditingAsset(assetId)
      setIsAddDialogOpen(true)
    }
  }

  const handleDelete = (assetId: string) => {
    setDeleteConfirmId(assetId)
  }

  const executeDelete = () => {
    if (deleteConfirmId) {
      deleteAsset(deleteConfirmId)
      toast.success(t('assetsTable.delete.success', 'Asset deleted'), {
        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      })
      setDeleteConfirmId(null)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'shareholdings',
      ownership: '',
      value: '',
      source: '',
      notes: '',
    })
    setFormErrors({})
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-foreground">{t('assetsTable.title')}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t('assetsTable.empty.subtitle')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <PrivacyBadge />
              <DataActions />
              <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                setIsAddDialogOpen(open)
                if (!open) resetForm()
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('assetsTable.add')}
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAsset ? t('assetsTable.form.title_edit') : t('assetsTable.form.title_add')}
                  </DialogTitle>
                  <DialogDescription>
                    {t('assetsTable.form.name_placeholder')}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">{t('assetsTable.form.name')} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        if (formErrors.name && e.target.value.trim()) {
                          setFormErrors({ ...formErrors, name: false })
                        }
                      }}
                      placeholder={t('assetsTable.form.name_placeholder')}
                      className={formErrors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {formErrors.name && (
                      <p className="text-xs text-destructive">{t('assetsTable.form.name_required', 'Name is required')}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">{t('assetsTable.form.category')} *</Label>
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
                          {Object.keys(CATEGORY_METADATA).map((key) => (
                            <SelectItem key={key} value={key}>
                              {getCategoryLabel(key as AssetCategory)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="ownership">{t('assetsTable.form.ownership')}</Label>
                      <Input
                        id="ownership"
                        value={formData.ownership}
                        onChange={(e) => setFormData({ ...formData, ownership: e.target.value })}
                        placeholder={t('assetsTable.form.ownership_placeholder')}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="value">{t('assetsTable.form.value')} *</Label>
                    <Input
                      id="value"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => {
                        setFormData({ ...formData, value: e.target.value })
                        if (formErrors.value && parseFloat(e.target.value) > 0) {
                          setFormErrors({ ...formErrors, value: false })
                        }
                      }}
                      placeholder={t('assetsTable.form.value_placeholder')}
                      className={formErrors.value ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {formErrors.value && (
                      <p className="text-xs text-destructive">{t('assetsTable.form.value_required', 'A valid value is required')}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="source">{t('assetsTable.form.source')}</Label>
                    <Input
                      id="source"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      placeholder={t('assetsTable.form.source_placeholder')}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">{t('assetsTable.form.notes')}</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={t('assetsTable.form.notes_placeholder')}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsAddDialogOpen(false)
                    resetForm()
                  }}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingAsset ? t('assetsTable.form.save') : t('assetsTable.form.add')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
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
                <SelectValue placeholder={t('assetsTable.filter.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('assetsTable.filter.all')}</SelectItem>
                {Object.keys(CATEGORY_METADATA).map((key) => (
                  <SelectItem key={key} value={key}>
                    {getCategoryLabel(key as AssetCategory)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">{t('assetsTable.empty.title')}</p>
              <p className="text-sm">{t('assetsTable.empty.button')}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('assetsTable.table.name')}</TableHead>
                    <TableHead>{t('assetsTable.table.category')}</TableHead>
                    <TableHead>{t('assetsTable.table.ownership')}</TableHead>
                    <TableHead className="text-right">{t('assetsTable.table.value')}</TableHead>
                    <TableHead>{t('assetsTable.table.source')}</TableHead>
                    <TableHead className="w-[100px]">{t('assetsTable.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => {
                    const metadata = CATEGORY_METADATA[asset.category]
                    if (!metadata) return null // Skip invalid categories
                    const IconComponent = categoryIcons[metadata.icon as keyof typeof categoryIcons]
                    
                    return (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <IconComponent className="w-3 h-3" />
                            {getCategoryLabel(asset.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>{asset.ownership}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(asset.value)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {asset.source}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(asset.id)}
                              className="hover:bg-accent"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(asset.id)}
                              className="hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {t('assetsTable.delete.title', 'Delete Asset')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('assetsTable.delete.confirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
    </div>
  )
}
