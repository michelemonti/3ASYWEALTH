import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { parseAmount, parseDecimal } from '@/domain/numbers'
import { runScenario, type Scenario, type ScenarioResult } from '@/domain/scenarios'
import { useFormat } from '@/hooks/useFormat'
import { useSummary } from '@/hooks/useSummary'
import { cn } from '@/lib/utils'
import { Money } from './Money'
import { Segmented } from './Segmented'

type Kind = Scenario['kind']

function AmountInput({ id, label, value, onChange, hint }: { id: string; label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} inputMode="decimal" autoComplete="off" className="num" value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export default function WhatIfDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useTranslation()
  const f = useFormat()
  const summary = useSummary()
  const uid = useId()
  const [kind, setKind] = useState<Kind>('purchase')
  const [price, setPrice] = useState('')
  const [financed, setFinanced] = useState('')
  const [assetId, setAssetId] = useState(summary.assets[0]?.item.id ?? '')
  const [change, setChange] = useState('')
  const [liabilityId, setLiabilityId] = useState(summary.liabilities[0]?.item.id ?? '')
  const [repay, setRepay] = useState('')

  const outcome = useMemo((): { result: ScenarioResult } | { invalid: true } | null => {
    const amount = (s: string, allowEmpty = false) => {
      if (allowEmpty && !s.trim()) return 0
      const r = parseAmount(s, f.decimal)
      return 'value' in r ? r.value : null
    }
    let scenario: Scenario
    if (kind === 'purchase') {
      if (!price.trim()) return null
      const p = amount(price)
      const fin = amount(financed, true)
      if (p === null || fin === null) return { invalid: true }
      scenario = { kind, price: p, financed: fin }
    } else if (kind === 'revalue') {
      if (!change.trim() || !assetId) return null
      const pct = parseDecimal(change.replace(/%$/, ''), f.decimal)
      if (pct === null) return { invalid: true }
      scenario = { kind, assetId, changePercent: pct }
    } else {
      if (!repay.trim() || !liabilityId) return null
      const a = amount(repay)
      if (a === null) return { invalid: true }
      scenario = { kind, liabilityId, amount: a }
    }
    return { result: runScenario(summary, scenario) }
  }, [kind, price, financed, change, assetId, repay, liabilityId, summary, f.decimal])

  const rows = ['liquidity', 'assets', 'liabilities', 'netWorth'] as const

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t('common.close')} className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('whatIf.title')}</DialogTitle>
          <DialogDescription>{t('whatIf.description')}</DialogDescription>
        </DialogHeader>

        <Segmented
          label={t('whatIf.title')}
          value={kind}
          onChange={setKind}
          className="w-full"
          options={[
            { value: 'purchase', label: t('whatIf.purchase.tab') },
            { value: 'revalue', label: t('whatIf.revalue.tab') },
            { value: 'repay', label: t('whatIf.repay.tab') },
          ]}
        />

        <div className="grid gap-4">
          {kind === 'purchase' && (
            <>
              <p className="text-sm text-muted-foreground">{t('whatIf.purchase.explain')}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <AmountInput id={`${uid}-price`} label={t('whatIf.purchase.price', { currency: f.currency })} value={price} onChange={setPrice} />
                <AmountInput
                  id={`${uid}-fin`}
                  label={t('whatIf.purchase.financed', { currency: f.currency })}
                  value={financed}
                  onChange={setFinanced}
                  hint={t('whatIf.purchase.financedHint')}
                />
              </div>
            </>
          )}
          {kind === 'revalue' &&
            (summary.assets.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('whatIf.revalue.none')}</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">{t('whatIf.revalue.explain')}</p>
                <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
                  <div className="grid gap-1.5">
                    <Label htmlFor={`${uid}-asset`}>{t('whatIf.revalue.asset')}</Label>
                    <Select value={assetId} onValueChange={setAssetId}>
                      <SelectTrigger id={`${uid}-asset`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {summary.assets.map((a) => (
                          <SelectItem key={a.item.id} value={a.item.id}>
                            {a.item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <AmountInput id={`${uid}-pct`} label={t('whatIf.revalue.change')} value={change} onChange={setChange} hint={t('whatIf.revalue.changeHint')} />
                </div>
              </>
            ))}
          {kind === 'repay' &&
            (summary.liabilities.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('whatIf.repay.none')}</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">{t('whatIf.repay.explain')}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor={`${uid}-debt`}>{t('whatIf.repay.debt')}</Label>
                    <Select value={liabilityId} onValueChange={setLiabilityId}>
                      <SelectTrigger id={`${uid}-debt`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {summary.liabilities.map((l) => (
                          <SelectItem key={l.item.id} value={l.item.id}>
                            {l.item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <AmountInput id={`${uid}-repay`} label={t('whatIf.repay.amount', { currency: f.currency })} value={repay} onChange={setRepay} />
                </div>
              </>
            ))}
        </div>

        <div aria-live="polite" className="min-h-[3rem]">
          {outcome && 'invalid' in outcome && <p className="text-sm text-destructive">{t('whatIf.errors.invalidAmount')}</p>}
          {outcome && 'result' in outcome && !outcome.result.ok && (
            <p className="rounded-lg border border-warning/40 bg-warning-soft p-3 text-sm">
              {t(`whatIf.errors.${outcome.result.error.code}`, {
                shortfall: 'shortfall' in outcome.result.error ? f.money(outcome.result.error.shortfall) : '',
                outstanding: 'outstanding' in outcome.result.error ? f.money(outcome.result.error.outstanding) : '',
              })}
            </p>
          )}
          {outcome && 'result' in outcome && outcome.result.ok && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">{t('whatIf.tableCaption')}</caption>
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="py-2 font-medium" />
                    <th scope="col" className="py-2 text-right font-medium">{t('whatIf.before')}</th>
                    <th scope="col" className="py-2 text-right font-medium">{t('whatIf.after')}</th>
                    <th scope="col" className="py-2 text-right font-medium">{t('whatIf.delta')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const res = outcome.result as Extract<ScenarioResult, { ok: true }>
                    return (
                      <tr key={r} className={cn('border-t', r === 'netWorth' && 'font-semibold')}>
                        <th scope="row" className="py-2 text-left font-normal">
                          {t(`summary.${r}`)}
                        </th>
                        <td className="py-2 text-right">
                          <Money value={res.before[r]} />
                        </td>
                        <td className="py-2 text-right">
                          <Money value={res.after[r]} />
                        </td>
                        <td className="py-2 text-right text-muted-foreground">
                          {res.delta[r] === 0 ? '—' : <Money value={res.delta[r]} signed />}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-muted-foreground">{t('whatIf.footnote')}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
