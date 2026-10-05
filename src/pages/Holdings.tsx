import { ArrowDown, ArrowUp, ArrowUpDown, Copy, MoreHorizontal, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Money } from '@/components/Money'
import { PageHeader } from '@/components/PageHeader'
import { Segmented } from '@/components/Segmented'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ValuedAsset, ValuedLiability } from '@/domain/calc'
import { roundCents } from '@/domain/numbers'
import { ASSET_CATEGORIES, type AssetCategory } from '@/domain/types'
import { useFormat } from '@/hooks/useFormat'
import { useSummary } from '@/hooks/useSummary'
import { CATEGORY_META, DEBT_META } from '@/lib/categories'
import { cn } from '@/lib/utils'
import { useWealth, useWorkspace } from '@/stores/wealthStore'
import { useUi } from '@/stores/uiStore'

type Tab = 'assets' | 'liabilities'
type SortKey = 'name' | 'value' | 'date'
type Sort = { key: SortKey; dir: 'asc' | 'desc' }

function RowActions({ name, onEdit, onDuplicate, onDelete }: { name: string; onEdit: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const { t } = useTranslation()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={t('holdings.actionsFor', { name })}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onEdit} className="gap-2">
          <Pencil className="h-4 w-4" aria-hidden />
          {t('common.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDuplicate} className="gap-2">
          <Copy className="h-4 w-4" aria-hidden />
          {t('common.duplicate')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDelete} className="gap-2 text-destructive focus:text-destructive">
          <Trash2 className="h-4 w-4" aria-hidden />
          {t('common.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SortHeader({ label, k, sort, setSort, align = 'left' }: { label: string; k: SortKey; sort: Sort; setSort: (s: Sort) => void; align?: 'left' | 'right' }) {
  const active = sort.key === k
  const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown
  return (
    <th scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={cn('px-4 py-3 font-medium', align === 'right' && 'text-right')}>
      <button
        type="button"
        onClick={() => setSort({ key: k, dir: active && sort.dir === 'asc' ? 'desc' : active ? 'asc' : k === 'name' ? 'asc' : 'desc' })}
        className={cn('inline-flex items-center gap-1 rounded hover:text-foreground', align === 'right' && 'flex-row-reverse')}
      >
        {label}
        <Icon className={cn('h-3.5 w-3.5', !active && 'opacity-40')} aria-hidden />
      </button>
    </th>
  )
}

function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <Card className="grid place-items-center gap-3 border-dashed px-6 py-14 text-center">
      <p className="max-w-sm text-sm text-muted-foreground">{children}</p>
      {action}
    </Card>
  )
}

export default function Holdings() {
  const { t } = useTranslation()
  const f = useFormat()
  const ws = useWorkspace()
  const summary = useSummary()
  const openAdd = useUi((s) => s.openAdd)
  const openEdit = useUi((s) => s.openEdit)
  const deleteAsset = useWealth((s) => s.deleteAsset)
  const restoreAsset = useWealth((s) => s.restoreAsset)
  const duplicateAsset = useWealth((s) => s.duplicateAsset)
  const deleteLiability = useWealth((s) => s.deleteLiability)
  const restoreLiability = useWealth((s) => s.restoreLiability)
  const duplicateLiability = useWealth((s) => s.duplicateLiability)

  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'liabilities' ? 'liabilities' : 'assets'
  const setTab = (next: Tab) => setParams(next === 'assets' ? {} : { tab: next }, { replace: true })
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<AssetCategory | 'all'>('all')
  const [sort, setSort] = useState<Sort>({ key: 'value', dir: 'desc' })

  const q = query.trim().toLocaleLowerCase()
  const matches = (...fields: Array<string | undefined>) => !q || fields.some((x) => x?.toLocaleLowerCase().includes(q))
  const assetName = (id?: string) => (id ? ws.assets.find((a) => a.id === id)?.name : undefined)

  const compare = <T extends { item: { name: string; valuationDate: string }; value: number | null }>(a: T, b: T) => {
    const dir = sort.dir === 'asc' ? 1 : -1
    if (sort.key === 'name') return dir * a.item.name.localeCompare(b.item.name, f.locale)
    if (sort.key === 'date') return dir * a.item.valuationDate.localeCompare(b.item.valuationDate)
    return dir * ((a.value ?? -Infinity) - (b.value ?? -Infinity))
  }

  const assets = useMemo(
    () =>
      summary.assets
        .filter((a) => category === 'all' || a.item.category === category)
        .filter((a) => matches(a.item.name, a.item.notes, a.item.source, t(`categories.${a.item.category}.label`)))
        .sort(compare),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [summary, category, q, sort, f.locale, t],
  )
  const liabilities = useMemo(
    () => summary.liabilities.filter((l) => matches(l.item.name, l.item.notes, assetName(l.item.linkedAssetId))).sort(compare),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [summary, q, sort, f.locale],
  )
  const rows = tab === 'assets' ? assets : liabilities
  const filteredTotal = roundCents(rows.reduce((acc, r) => acc + (r.value ?? 0), 0))
  const isFiltered = Boolean(q) || (tab === 'assets' && category !== 'all')

  const removeAsset = (a: ValuedAsset) => {
    const deleted = deleteAsset(a.item.id)
    if (deleted)
      toast(t('holdings.deleted', { name: a.item.name }), { action: { label: t('common.undo'), onClick: () => restoreAsset(deleted) } })
  }
  const removeLiability = (l: ValuedLiability) => {
    const deleted = deleteLiability(l.item.id)
    if (deleted)
      toast(t('holdings.deleted', { name: l.item.name }), { action: { label: t('common.undo'), onClick: () => restoreLiability(deleted) } })
  }
  const copySuffix = t('holdings.copySuffix')

  const original = (a: ValuedAsset) => {
    const base = f.money(a.item.amount, { currency: a.item.currency, cents: true })
    return a.item.valueBasis === 'whole' ? `${base} × ${f.percent(a.item.ownershipPercent, 4)}` : base
  }

  return (
    <>
      <PageHeader
        title={t('nav.holdings')}
        description={
          <>
            {t('summary.assets')} <Money value={summary.totals.assets} className="font-medium text-foreground" /> · {t('summary.liabilities')}{' '}
            <Money value={summary.totals.liabilities} className="font-medium text-foreground" /> · {t('summary.netWorth')}{' '}
            <Money value={summary.totals.netWorth} className="font-medium text-foreground" />
          </>
        }
        actions={
          <Button onClick={() => openAdd(tab === 'liabilities' ? { kind: 'liability' } : {})}>
            <Plus aria-hidden />
            {tab === 'liabilities' ? t('holdings.addLiability') : t('common.add')}
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Segmented
          label={t('nav.holdings')}
          value={tab}
          onChange={setTab}
          options={[
            { value: 'assets', label: `${t('summary.assets')} (${ws.assets.length})` },
            { value: 'liabilities', label: `${t('summary.liabilities')} (${ws.liabilities.length})` },
          ]}
        />
        <div className="flex flex-1 flex-col gap-2 sm:flex-row lg:justify-end">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('holdings.search')}
              aria-label={t('holdings.search')}
              className="pl-9"
            />
          </div>
          {tab === 'assets' && (
            <Select value={category} onValueChange={(v) => setCategory(v as AssetCategory | 'all')}>
              <SelectTrigger className="sm:w-52" aria-label={t('holdings.filterCategory')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('holdings.allCategories')}</SelectItem>
                {ASSET_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`categories.${c}.label`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={`${sort.key}_${sort.dir}`} onValueChange={(v) => {
            const [key, dir] = v.split('_') as [SortKey, Sort['dir']]
            setSort({ key, dir })
          }}>
            <SelectTrigger className="sm:w-48 md:hidden" aria-label={t('holdings.sortBy')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['value_desc', 'value_asc', 'name_asc', 'name_desc', 'date_desc', 'date_asc'] as const).map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`holdings.sort.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isFiltered && (
        <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground" aria-live="polite">
          {t('holdings.showing', { count: rows.length, total: tab === 'assets' ? ws.assets.length : ws.liabilities.length })}
          <button
            type="button"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            onClick={() => {
              setQuery('')
              setCategory('all')
            }}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            {t('holdings.clearFilters')}
          </button>
        </div>
      )}

      {rows.length === 0 ? (
        isFiltered ? (
          <EmptyState>{t('holdings.noResults')}</EmptyState>
        ) : (
          <EmptyState
            action={
              <Button onClick={() => openAdd(tab === 'liabilities' ? { kind: 'liability' } : {})}>
                <Plus aria-hidden />
                {tab === 'liabilities' ? t('holdings.addLiability') : t('holdings.addAsset')}
              </Button>
            }
          >
            {tab === 'assets' ? t('holdings.emptyAssets') : t('holdings.emptyLiabilities')}
          </EmptyState>
        )
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <caption className="sr-only">{tab === 'assets' ? t('summary.assets') : t('summary.liabilities')}</caption>
              <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <SortHeader label={t('holdings.col.name')} k="name" sort={sort} setSort={setSort} />
                  <th scope="col" className="px-4 py-3 font-medium">
                    {tab === 'assets' ? t('holdings.col.category') : t('holdings.col.linked')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    {tab === 'assets' ? t('holdings.col.entered') : t('holdings.col.original')}
                  </th>
                  <SortHeader label={tab === 'assets' ? t('holdings.col.yours') : t('holdings.col.owed')} k="value" sort={sort} setSort={setSort} align="right" />
                  <SortHeader label={tab === 'assets' ? t('holdings.col.date') : t('holdings.col.balanceDate')} k="date" sort={sort} setSort={setSort} align="right" />
                  <th scope="col" className="w-14 px-2 py-3">
                    <span className="sr-only">{t('holdings.col.actions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tab === 'assets'
                  ? assets.map((a) => {
                      const meta = CATEGORY_META[a.item.category]
                      return (
                        <tr key={a.item.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="max-w-[18rem] px-4 py-3">
                            <button type="button" className="text-left font-medium hover:underline" onClick={() => openEdit('asset', a.item.id)}>
                              {a.item.name}
                            </button>
                            {a.item.legacyOwnership && (
                              <span className="ml-2 rounded bg-warning-soft px-1.5 py-0.5 text-[11px] font-medium text-warning">
                                {t('holdings.toReview')}
                              </span>
                            )}
                            {a.item.notes && <p className="truncate text-xs text-muted-foreground">{a.item.notes}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-2">
                              <span className={cn('h-2.5 w-2.5 rounded-full', meta.dot)} aria-hidden />
                              {t(`categories.${a.item.category}.label`)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            <span className="num">{original(a)}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            <Money value={a.value} cents />
                          </td>
                          <td className="num px-4 py-3 text-right text-muted-foreground">{f.date(a.item.valuationDate)}</td>
                          <td className="px-2 py-2 text-right">
                            <RowActions
                              name={a.item.name}
                              onEdit={() => openEdit('asset', a.item.id)}
                              onDuplicate={() => duplicateAsset(a.item.id, copySuffix)}
                              onDelete={() => removeAsset(a)}
                            />
                          </td>
                        </tr>
                      )
                    })
                  : liabilities.map((l) => (
                      <tr key={l.item.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="max-w-[18rem] px-4 py-3">
                          <button type="button" className="text-left font-medium hover:underline" onClick={() => openEdit('liability', l.item.id)}>
                            {l.item.name}
                          </button>
                          {l.item.notes && <p className="truncate text-xs text-muted-foreground">{l.item.notes}</p>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{assetName(l.item.linkedAssetId) ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          <Money value={l.item.amount} currency={l.item.currency} cents />
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-debt">
                          <Money value={l.value} cents />
                        </td>
                        <td className="num px-4 py-3 text-right text-muted-foreground">{f.date(l.item.valuationDate)}</td>
                        <td className="px-2 py-2 text-right">
                          <RowActions
                            name={l.item.name}
                            onEdit={() => openEdit('liability', l.item.id)}
                            onDuplicate={() => duplicateLiability(l.item.id, copySuffix)}
                            onDelete={() => removeLiability(l)}
                          />
                        </td>
                      </tr>
                    ))}
              </tbody>
              <tfoot className="border-t bg-muted/50">
                <tr>
                  <th scope="row" colSpan={3} className="px-4 py-3 text-left font-medium">
                    {isFiltered ? t('holdings.totalFiltered') : t('holdings.total')}
                  </th>
                  <td className={cn('px-4 py-3 text-right font-semibold', tab === 'liabilities' && 'text-debt')}>
                    <Money value={filteredTotal} cents />
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </Card>

          {/* Mobile list */}
          <ul className="grid grid-cols-1 gap-2 md:hidden">
            {tab === 'assets'
              ? assets.map((a) => (
                  <li key={a.item.id} className="flex items-center gap-1 rounded-xl border bg-card">
                    <button type="button" className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left" onClick={() => openEdit('asset', a.item.id)}>
                      <span className={cn('h-8 w-1 shrink-0 rounded-full', CATEGORY_META[a.item.category].dot)} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{a.item.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {t(`categories.${a.item.category}.label`)}
                          {a.item.valueBasis === 'whole' && ` · ${f.percent(a.item.ownershipPercent, 4)}`} · {f.date(a.item.valuationDate)}
                        </span>
                      </span>
                      <Money value={a.value} className="font-semibold" />
                    </button>
                    <RowActions
                      name={a.item.name}
                      onEdit={() => openEdit('asset', a.item.id)}
                      onDuplicate={() => duplicateAsset(a.item.id, copySuffix)}
                      onDelete={() => removeAsset(a)}
                    />
                  </li>
                ))
              : liabilities.map((l) => (
                  <li key={l.item.id} className="flex items-center gap-1 rounded-xl border bg-card">
                    <button type="button" className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left" onClick={() => openEdit('liability', l.item.id)}>
                      <span className={cn('h-8 w-1 shrink-0 rounded-full', DEBT_META.dot)} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{l.item.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {assetName(l.item.linkedAssetId) ? `${assetName(l.item.linkedAssetId)} · ` : ''}
                          {f.date(l.item.valuationDate)}
                        </span>
                      </span>
                      <Money value={l.value} className="font-semibold text-debt" />
                    </button>
                    <RowActions
                      name={l.item.name}
                      onEdit={() => openEdit('liability', l.item.id)}
                      onDuplicate={() => duplicateLiability(l.item.id, copySuffix)}
                      onDelete={() => removeLiability(l)}
                    />
                  </li>
                ))}
            <li className="flex justify-between px-3 pt-2 text-sm">
              <span className="text-muted-foreground">{isFiltered ? t('holdings.totalFiltered') : t('holdings.total')}</span>
              <Money value={filteredTotal} className={cn('font-semibold', tab === 'liabilities' && 'text-debt')} />
            </li>
          </ul>
        </>
      )}
    </>
  )
}
