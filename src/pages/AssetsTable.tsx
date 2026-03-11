/**
 * Assets Table Page
 * 
 * CRUD interface for managing wealth assets
 * With search, sortable columns, undo delete, and table totals
 * 
 * @author Michele Miky Monti
 * @version 3.0.0
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useWealthStore } from '@/stores/wealthStore'
import { useCurrency } from '@/hooks/useCurrency'
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
  TableFooter,
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
import { 
  Plus, Pencil, Trash2, Building2, Home, Gem, Wallet, 
  AlertTriangle, CheckCircle2, Search, ArrowUpDown, 
  ArrowUp, ArrowDown, X, TrendingUp
} from 'lucide-react'
import { CATEGORY_METADATA, type AssetCategory, type Currency } from '@/types/wealth'

const categoryIcons = {
  Building2,
  Home,
  Gem,
  Wallet,
}

type SortField = 'name' | 'value' | 'category' | 'updatedAt'
type SortDirection = 'asc' | 'desc'

export default function AssetsTable() {
  const { t } = useTranslation()
  const { format: formatCurrency, symbol: currencySymbol } = useCurrency()
  const { assets, addAsset, updateAsset, deleteAsset, importAssets, getDisplayValue, displayCurrency } = useWealthStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<AssetCategory | 'all'>('all')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const getCategoryLabel = (category: AssetCategory) => t(`categories.${category}`)

  const [formData, setFormData] = useState({
    name: '',
    category: 'shareholdings' as AssetCategory,
    ownership: '',
    value: '',
    currency: displayCurrency as Currency,
    source: '',
    notes: '',
  })

  const [formErrors, setFormErrors] = useState<{ name?: boolean; value?: boolean }>({})

  const validateForm = () => {
    const errors: { name?: boolean; value?: boolean } = {}
    if (!formData.name.trim()) errors.name = true
    if (!formData.value || parseFloat(formData.value) <= 0) errors.value = true
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
      currency: formData.currency,
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
        currency: asset.currency ?? displayCurrency,
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
    if (!deleteConfirmId) return
    const deletedAsset = assets.find(a => a.id === deleteConfirmId)
    if (!deletedAsset) return
    
    deleteAsset(deleteConfirmId)
    setDeleteConfirmId(null)
    
    toast.success(t('assetsTable.delete.success', 'Asset deleted'), {
      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      action: {
        label: t('common.undo', 'Undo'),
        onClick: () => {
          importAssets([...useWealthStore.getState().assets, deletedAsset])
          toast.success(t('assetsTable.delete.undone', 'Deletion undone'), {
            icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />,
          })
        },
      },
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'shareholdings',
      ownership: '',
      value: '',
      currency: displayCurrency,
      source: '',
      notes: '',
    })
    setFormErrors({})
    setEditingAsset(null)
  }

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-40" />
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-primary" /> 
      : <ArrowDown className="w-3.5 h-3.5 ml-1 text-primary" />
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filteredAndSortedAssets = useMemo(() => {
    let result = assets

    if (filterCategory !== 'all') {
      result = result.filter(a => a.category === filterCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(a => 
        a.name.toLowerCase().includes(query) ||
        a.ownership.toLowerCase().includes(query) ||
        a.source.toLowerCase().includes(query) ||
        (a.notes && a.notes.toLowerCase().includes(query)) ||
        getCategoryLabel(a.category).toLowerCase().includes(query)
      )
    }

    result = [...result].sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1
      switch (sortField) {
        case 'name':
          return dir * a.name.localeCompare(b.name)
        case 'value':
          return dir * (getDisplayValue(a) - getDisplayValue(b))
        case 'category':
          return dir * getCategoryLabel(a.category).localeCompare(getCategoryLabel(b.category))
        case 'updatedAt': {
          const aDate = a.updatedAt instanceof Date ? a.updatedAt.getTime() : new Date(a.updatedAt).getTime()
          const bDate = b.updatedAt instanceof Date ? b.updatedAt.getTime() : new Date(b.updatedAt).getTime()
          return dir * (aDate - bDate)
        }
        default:
          return 0
      }
    })

    return result
  }, [assets, filterCategory, searchQuery, sortField, sortDirection])

  const totalValue = useMemo(() => 
    filteredAndSortedAssets.reduce((sum, a) => sum + getDisplayValue(a), 0)
  , [filteredAndSortedAssets, getDisplayValue])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('assetsTable.add')}
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                      <p className="text-xs text-destructive">{t('assetsTable.form.name_required')}</p>
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
                    <div className="flex gap-2">
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
                        className={`flex-1 ${formErrors.value ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      />
                      <Select
                        value={formData.currency}
                        onValueChange={(v) => setFormData({ ...formData, currency: v as Currency })}
                      >
                        <SelectTrigger className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">€ EUR</SelectItem>
                          <SelectItem value="USD">$ USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formErrors.value && (
                      <p className="text-xs text-destructive">{t('assetsTable.form.value_required')}</p>
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
                  <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {editingAsset ? t('assetsTable.form.save') : t('assetsTable.form.add')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('assetsTable.search.placeholder', 'Search assets...')}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Select
              value={filterCategory}
              onValueChange={(value) => setFilterCategory(value as AssetCategory | 'all')}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
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

          {/* Active filter indicator */}
          {(searchQuery || filterCategory !== 'all') && filteredAndSortedAssets.length > 0 && (
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <span>
                {t('assetsTable.search.showing', {
                  count: filteredAndSortedAssets.length,
                  total: assets.length,
                  defaultValue: `Showing ${filteredAndSortedAssets.length} of ${assets.length} assets`
                })}
              </span>
              <button
                onClick={() => { setSearchQuery(''); setFilterCategory('all') }}
                className="text-primary hover:underline text-xs"
              >
                {t('assetsTable.search.clearFilters', 'Clear filters')}
              </button>
            </div>
          )}

          {/* Table */}
          {filteredAndSortedAssets.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              {assets.length === 0 ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground mb-2">{t('assetsTable.empty.title')}</p>
                  <p className="text-sm text-muted-foreground mb-6">{t('assetsTable.empty.button')}</p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('assetsTable.add')}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    {t('assetsTable.search.noResults', 'No assets match your search')}
                  </p>
                  <Button variant="ghost" onClick={() => { setSearchQuery(''); setFilterCategory('all') }}>
                    {t('assetsTable.filter.all')}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>
                      <button 
                        onClick={() => handleSort('name')}
                        className="flex items-center font-medium hover:text-foreground transition-colors"
                      >
                        {t('assetsTable.table.name')}
                        <SortIcon field="name" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button 
                        onClick={() => handleSort('category')}
                        className="flex items-center font-medium hover:text-foreground transition-colors"
                      >
                        {t('assetsTable.table.category')}
                        <SortIcon field="category" />
                      </button>
                    </TableHead>
                    <TableHead>{t('assetsTable.table.ownership')}</TableHead>
                    <TableHead className="text-right">
                      <button 
                        onClick={() => handleSort('value')}
                        className="flex items-center font-medium hover:text-foreground transition-colors ml-auto"
                      >
                        {t('assetsTable.table.value')}
                        <SortIcon field="value" />
                      </button>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">{t('assetsTable.table.source')}</TableHead>
                    <TableHead className="w-[100px]">{t('assetsTable.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedAssets.map((asset) => {
                    const metadata = CATEGORY_METADATA[asset.category]
                    if (!metadata) return null
                    const IconComponent = categoryIcons[metadata.icon as keyof typeof categoryIcons]
                    
                    return (
                      <TableRow key={asset.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div>
                            <span className="font-medium text-foreground">{asset.name}</span>
                            {asset.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{asset.notes}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="flex items-center gap-1.5 w-fit">
                            <IconComponent className="w-3 h-3" />
                            {getCategoryLabel(asset.category)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{asset.ownership}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums text-foreground">
                          {formatCurrency(getDisplayValue(asset))}
                          {asset.currency && asset.currency !== displayCurrency && (
                            <span className="block text-xs font-normal text-muted-foreground">
                              {asset.currency === 'EUR' ? '€' : '$'}{asset.value.toLocaleString()}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {asset.source}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(asset.id)}
                              className="h-10 w-10 sm:h-8 sm:w-8 p-0 hover:bg-accent"
                              aria-label={t('common.edit')}
                            >
                              <Pencil className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(asset.id)}
                              className="h-10 w-10 sm:h-8 sm:w-8 p-0 hover:bg-destructive/10"
                              aria-label={t('common.delete')}
                            >
                              <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={3}>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-foreground">
                          {t('assetsTable.total.label', 'Total Portfolio Value')}
                        </span>
                        <span className="text-muted-foreground text-sm font-normal">
                          ({t('assetsTable.total.assets', { count: filteredAndSortedAssets.length })})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-lg text-foreground">
                      {formatCurrency(totalValue)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell" />
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
      </div>
      <Footer />
    </div>
  )
}
