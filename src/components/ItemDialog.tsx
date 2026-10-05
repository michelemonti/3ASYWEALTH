import { ArrowLeft } from 'lucide-react'
import { useId, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { convert, personalAmount } from '@/domain/calc'
import { parseAmount, parsePercent, parseRate, roundCents, todayISODate, toInputString, isISODate } from '@/domain/numbers'
import { ASSET_CATEGORIES, CURRENCIES, type AssetCategory, type Currency, type ValueBasis } from '@/domain/types'
import { useFormat } from '@/hooks/useFormat'
import { CATEGORY_META, DEBT_META } from '@/lib/categories'
import { cn } from '@/lib/utils'
import { useUi } from '@/stores/uiStore'
import { wealthStore, useWorkspace } from '@/stores/wealthStore'
import { Money } from './Money'
import { RateField } from './RateDialog'

type Kind = 'asset' | 'liability'
const NONE = '__none__'
const defaultBasis = (c: AssetCategory): ValueBasis => (c === 'realestate' || c === 'business' ? 'whole' : 'share')

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

const describedBy = (id: string, error?: string, hint?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined

export default function ItemDialog() {
  const { t } = useTranslation()
  const f = useFormat()
  const ui = useUi((s) => s.item)
  const close = useUi((s) => s.closeItem)
  const openAdd = useUi((s) => s.openAdd)
  const ws = useWorkspace()
  const uid = useId()
  const fid = (name: string) => `${uid}-${name}`

  const editing = useMemo(() => {
    if (!ui.open || ui.mode !== 'edit') return null
    return ui.kind === 'asset'
      ? { kind: 'asset' as const, asset: ws.assets.find((a) => a.id === ui.id) }
      : { kind: 'liability' as const, liability: ws.liabilities.find((l) => l.id === ui.id) }
    // Only resolve the edited record once, when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initialKind: Kind | null = !ui.open ? null : ui.mode === 'edit' ? ui.kind : (ui.kind ?? null)
  const asset = editing?.kind === 'asset' ? editing.asset : undefined
  const liability = editing?.kind === 'liability' ? editing.liability : undefined
  const presetCategory = ui.open && ui.mode === 'add' ? ui.category : undefined

  const [kind, setKind] = useState<Kind | null>(initialKind === 'asset' && !presetCategory && ui.open && ui.mode === 'add' ? null : initialKind)
  const [category, setCategory] = useState<AssetCategory>(asset?.category ?? presetCategory ?? 'cash')
  const [name, setName] = useState(asset?.name ?? liability?.name ?? '')
  const [currency, setCurrency] = useState<Currency>(asset?.currency ?? liability?.currency ?? ws.settings.displayCurrency)
  const [amount, setAmount] = useState(() => {
    const v = asset?.amount ?? liability?.amount
    return v === undefined ? '' : toInputString(v, f.locale)
  })
  const [basis, setBasis] = useState<ValueBasis>(asset?.valueBasis ?? defaultBasis(presetCategory ?? 'cash'))
  const initialPercent = asset && asset.valueBasis === 'whole' ? toInputString(asset.ownershipPercent, f.locale, 4) : ''
  const [percent, setPercent] = useState(initialPercent)
  const [date, setDate] = useState(asset?.valuationDate ?? liability?.valuationDate ?? todayISODate())
  const [notes, setNotes] = useState(asset?.notes ?? liability?.notes ?? '')
  const [source, setSource] = useState(asset?.source ?? '')
  const [linked, setLinked] = useState(liability?.linkedAssetId ?? NONE)
  const [legacy, setLegacy] = useState(asset?.legacyOwnership ?? '')
  const [rate, setRate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showMore, setShowMore] = useState(Boolean(notes || source))

  const isEdit = Boolean(editing)
  const missingRecord = isEdit && !asset && !liability
  const needsRate = currency !== ws.settings.displayCurrency && ws.settings.eurUsdRate === null

  const choose = (k: Kind, c?: AssetCategory) => {
    setKind(k)
    if (c) {
      setCategory(c)
      setBasis(defaultBasis(c))
    }
  }

  const preview = useMemo(() => {
    const a = parseAmount(amount, f.decimal)
    if ('error' in a) return null
    let personal = a.value
    let pct: number | null = null
    if (kind === 'asset' && basis === 'whole') {
      const p = parsePercent(percent, f.decimal)
      if ('error' in p) return null
      pct = p.value
      personal = personalAmount({ amount: a.value, valueBasis: 'whole', ownershipPercent: p.value })
    }
    const r = needsRate ? parseRate(rate, f.decimal) : null
    const usedRate = r && 'value' in r ? r.value : ws.settings.eurUsdRate
    const display = convert(personal, currency, ws.settings.displayCurrency, usedRate)
    return {
      whole: a.value,
      pct,
      personal: roundCents(personal),
      display: display === null ? null : roundCents(display),
      converted: currency !== ws.settings.displayCurrency,
    }
  }, [amount, percent, basis, kind, currency, rate, needsRate, f.decimal, ws.settings])

  if (missingRecord) return null

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = t('form.errors.nameRequired')
    const a = parseAmount(amount, f.decimal)
    if ('error' in a) e.amount = t(`form.errors.amount.${a.error}`)
    if (kind === 'asset' && basis === 'whole') {
      const p = parsePercent(percent, f.decimal)
      if ('error' in p) e.percent = t(`form.errors.percent.${p.error}`)
    }
    if (!isISODate(date)) e.date = t('form.errors.date')
    if (needsRate) {
      const r = parseRate(rate, f.decimal)
      if ('error' in r) e.rate = t(`rate.errors.${r.error}`)
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!kind || !validate()) return
    const actions = wealthStore.getState()
    const amountValue = (parseAmount(amount, f.decimal) as { value: number }).value
    if (needsRate) actions.setRate((parseRate(rate, f.decimal) as { value: number }).value)

    if (kind === 'asset') {
      const input = {
        name: name.trim(),
        category,
        currency,
        amount: amountValue,
        valueBasis: basis,
        // Keep the stored precision unless the user actually edited the percentage.
        ownershipPercent:
          basis !== 'whole'
            ? 100
            : asset?.valueBasis === 'whole' && percent === initialPercent
              ? asset.ownershipPercent
              : (parsePercent(percent, f.decimal) as { value: number }).value,
        valuationDate: date,
        notes: notes.trim(),
        source: source.trim(),
        ...(legacy ? { legacyOwnership: legacy } : {}),
      }
      if (asset) actions.updateAsset(asset.id, input)
      else actions.addAsset(input)
    } else {
      const input = {
        name: name.trim(),
        currency,
        amount: amountValue,
        valuationDate: date,
        notes: notes.trim(),
        ...(linked !== NONE ? { linkedAssetId: linked } : {}),
      }
      if (liability) actions.updateLiability(liability.id, input)
      else actions.addLiability(input)
    }

    close()
    if (isEdit) {
      toast.success(t('form.toast.updated'))
    } else {
      toast.success(t(kind === 'asset' ? 'form.toast.addedAsset' : 'form.toast.addedLiability'), {
        action: { label: t('form.toast.addAnother'), onClick: () => openAdd() },
      })
    }
  }

  const title = isEdit
    ? t(kind === 'asset' ? 'form.editAsset' : 'form.editLiability')
    : kind === null
      ? t('form.chooseTitle')
      : t(kind === 'asset' ? 'form.addAsset' : 'form.addLiability')

  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent closeLabel={t('common.close')} className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {kind === null ? t('form.chooseHint') : kind === 'asset' ? t('form.assetHint') : t('form.liabilityHint')}
          </DialogDescription>
        </DialogHeader>

        {kind === null ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ASSET_CATEGORIES.map((c) => {
              const meta = CATEGORY_META[c]
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => choose('asset', c)}
                  className="flex items-start gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg', meta.soft, meta.text)}>
                    <meta.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-medium">{t(`categories.${c}.label`)}</span>
                    <span className="block text-xs text-muted-foreground">{t(`categories.${c}.hint`)}</span>
                  </span>
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => choose('liability')}
              className="flex items-start gap-3 rounded-xl border border-dashed bg-card p-3 text-left transition-colors hover:border-debt/60 hover:bg-debt/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg', DEBT_META.soft, DEBT_META.text)}>
                <DEBT_META.icon className="h-4 w-4" aria-hidden />
              </span>
              <span>
                <span className="block font-medium">{t('liabilities.label')}</span>
                <span className="block text-xs text-muted-foreground">{t('liabilities.hint')}</span>
              </span>
            </button>
          </div>
        ) : (
          <form
            noValidate
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            {kind === 'asset' && (
              <Field id={fid('category')} label={t('form.category')}>
                <Select
                  value={category}
                  onValueChange={(v) => {
                    setCategory(v as AssetCategory)
                    if (!isEdit && !percent) setBasis(defaultBasis(v as AssetCategory))
                  }}
                >
                  <SelectTrigger id={fid('category')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        <span className="flex items-center gap-2">
                          <span className={cn('h-2.5 w-2.5 rounded-full', CATEGORY_META[c].dot)} aria-hidden />
                          {t(`categories.${c}.label`)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field id={fid('name')} label={t('form.name')} error={errors.name}>
              <Input
                id={fid('name')}
                value={name}
                autoFocus
                autoComplete="off"
                maxLength={120}
                placeholder={kind === 'asset' ? t(`categories.${category}.placeholder`) : t('liabilities.placeholder')}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={describedBy(fid('name'), errors.name)}
              />
            </Field>

            {kind === 'asset' && (
              <fieldset className="grid gap-2">
                <legend className="mb-1.5 text-sm font-medium">{t('form.basis.legend')}</legend>
                {(['share', 'whole'] as const).map((b) => (
                  <label
                    key={b}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors',
                      basis === b ? 'border-primary bg-accent/60' : 'hover:bg-muted/60',
                    )}
                  >
                    <input
                      type="radio"
                      name={fid('basis')}
                      value={b}
                      checked={basis === b}
                      onChange={() => setBasis(b)}
                      className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
                    />
                    <span>
                      <span className="block font-medium">{t(`form.basis.${b}`)}</span>
                      <span className="block text-xs text-muted-foreground">{t(`form.basis.${b}Hint`)}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
            )}

            <div className={cn('grid gap-4', kind === 'asset' && basis === 'whole' ? 'sm:grid-cols-[1fr_auto_8rem]' : 'sm:grid-cols-[1fr_auto]')}>
              <Field
                id={fid('amount')}
                label={
                  kind === 'liability'
                    ? t('form.amountLiability')
                    : basis === 'whole'
                      ? t('form.amountWhole')
                      : t('form.amountShare')
                }
                error={errors.amount}
              >
                <Input
                  id={fid('amount')}
                  inputMode="decimal"
                  autoComplete="off"
                  className="num"
                  value={amount}
                  placeholder={f.decimal === ',' ? '12.500,00' : '12,500.00'}
                  onChange={(e) => setAmount(e.target.value)}
                  aria-invalid={errors.amount ? true : undefined}
                  aria-describedby={describedBy(fid('amount'), errors.amount)}
                />
              </Field>
              <Field id={fid('currency')} label={t('form.currency')}>
                <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                  <SelectTrigger id={fid('currency')} className="w-full sm:w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {kind === 'asset' && basis === 'whole' && (
                <Field id={fid('percent')} label={t('form.percent')} error={errors.percent}>
                  <div className="relative">
                    <Input
                      id={fid('percent')}
                      inputMode="decimal"
                      autoComplete="off"
                      className="num pr-8"
                      value={percent}
                      placeholder="50"
                      onChange={(e) => setPercent(e.target.value)}
                      aria-invalid={errors.percent ? true : undefined}
                      aria-describedby={describedBy(fid('percent'), errors.percent)}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                </Field>
              )}
            </div>

            {needsRate && (
              <div className="rounded-lg border border-warning/40 bg-warning-soft p-3">
                <p className="mb-2 text-sm">{t('form.rateNeeded', { currency: ws.settings.displayCurrency })}</p>
                <RateField id={fid('rate')} value={rate} onChange={setRate} error={errors.rate} />
              </div>
            )}

            {kind === 'liability' && (
              <Field id={fid('linked')} label={t('form.linked')} hint={t('form.linkedHint')}>
                <Select value={linked} onValueChange={setLinked}>
                  <SelectTrigger id={fid('linked')} aria-describedby={`${fid('linked')}-hint`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{t('form.linkedNone')}</SelectItem>
                    {ws.assets.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field
              id={fid('date')}
              label={kind === 'asset' ? t('form.dateAsset') : t('form.dateLiability')}
              error={errors.date}
            >
              <Input
                id={fid('date')}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full sm:w-48"
                aria-invalid={errors.date ? true : undefined}
                aria-describedby={describedBy(fid('date'), errors.date)}
              />
            </Field>

            {legacy && (
              <div className="rounded-lg border bg-muted/60 p-3 text-sm">
                <p className="font-medium">{t('form.legacy.title', { value: legacy })}</p>
                <p className="mt-1 text-muted-foreground">{t('form.legacy.body')}</p>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setLegacy('')}>
                  {t('form.legacy.confirm')}
                </Button>
              </div>
            )}

            {showMore ? (
              <div className="grid gap-4">
                <Field id={fid('notes')} label={t('form.notes')}>
                  <Textarea id={fid('notes')} value={notes} maxLength={2000} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </Field>
                {kind === 'asset' && (
                  <Field id={fid('source')} label={t('form.source')}>
                    <Input
                      id={fid('source')}
                      value={source}
                      maxLength={200}
                      placeholder={t('form.sourcePlaceholder')}
                      onChange={(e) => setSource(e.target.value)}
                    />
                  </Field>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="justify-self-start text-sm font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => setShowMore(true)}
              >
                {kind === 'asset' ? t('form.moreAsset') : t('form.moreLiability')}
              </button>
            )}

            <div
              className={cn('rounded-xl border p-4', kind === 'asset' ? 'bg-accent/50' : 'bg-debt/5')}
              aria-live="polite"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('form.preview.title')}
              </p>
              {preview ? (
                <>
                  <p className="mt-1 text-2xl font-semibold">
                    <Money
                      value={preview.display === null ? null : kind === 'asset' ? preview.display : -preview.display}
                      signed
                      cents
                      reveal
                      className={kind === 'asset' ? 'text-foreground' : 'text-debt'}
                    />
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {preview.pct !== null
                      ? t('form.preview.whole', {
                          whole: f.money(preview.whole, { currency, cents: true, reveal: true }),
                          pct: f.percent(preview.pct, 4),
                        })
                      : kind === 'asset'
                        ? t('form.preview.share')
                        : t('form.preview.liability')}
                    {preview.converted && preview.display !== null && (
                      <>
                        {' '}
                        {t('form.preview.converted', {
                          original: f.money(preview.personal, { currency, cents: true, reveal: true }),
                        })}
                      </>
                    )}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">{t('form.preview.empty')}</p>
              )}
            </div>

            <DialogFooter className="items-stretch sm:items-center">
              {!isEdit && (
                <Button type="button" variant="ghost" className="sm:mr-auto" onClick={() => setKind(null)}>
                  <ArrowLeft aria-hidden />
                  {t('common.back')}
                </Button>
              )}
              <Button type="button" variant="outline" onClick={close}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">{isEdit ? t('common.saveChanges') : t('common.add')}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
