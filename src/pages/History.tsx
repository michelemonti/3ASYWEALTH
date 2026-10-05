import { Eye, Trash2 } from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { HistoryPoint } from '@/components/HistoryChart'
import { Money } from '@/components/Money'
import { PageHeader } from '@/components/PageHeader'
import { SnapshotButton } from '@/components/SnapshotButton'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { summarize } from '@/domain/calc'
import { diffSnapshots, snapshotTotalsIn, sortSnapshots } from '@/domain/snapshots'
import type { Snapshot } from '@/domain/types'
import { useFormat } from '@/hooks/useFormat'
import { CATEGORY_META } from '@/lib/categories'
import { cn } from '@/lib/utils'
import { useSettings, useWealth, useWorkspace } from '@/stores/wealthStore'

const HistoryChart = lazy(() => import('@/components/HistoryChart'))

function SnapshotDetail({ snapshot, onClose }: { snapshot: Snapshot; onClose: () => void }) {
  const { t } = useTranslation()
  const f = useFormat()
  const s = useMemo(
    () =>
      summarize({
        assets: snapshot.assets,
        liabilities: snapshot.liabilities,
        settings: { displayCurrency: snapshot.currency, eurUsdRate: snapshot.eurUsdRate },
      }),
    [snapshot],
  )
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t('common.close')} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('history.detailTitle', { date: f.dateTime(snapshot.createdAt) })}</DialogTitle>
          <DialogDescription>
            {snapshot.note && <span className="block">“{snapshot.note}”</span>}
            {t('history.detailCurrency', { currency: snapshot.currency })}
            {snapshot.eurUsdRate !== null && ` · 1 EUR = ${f.number(snapshot.eurUsdRate)} USD`}
          </DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-3 gap-3 rounded-lg bg-muted/60 p-3 text-sm">
          {(['assets', 'liabilities', 'netWorth'] as const).map((k) => (
            <div key={k}>
              <dt className="text-muted-foreground">{t(`summary.${k}`)}</dt>
              <dd className="font-semibold">
                <Money value={snapshot.totals[k]} currency={snapshot.currency} />
              </dd>
            </div>
          ))}
        </dl>
        <table className="w-full text-sm">
          <caption className="sr-only">{t('history.detailCaption')}</caption>
          <tbody>
            {s.assets.map((a) => (
              <tr key={a.item.id} className="border-b last:border-0">
                <th scope="row" className="py-2 text-left font-normal">
                  <span className="inline-flex items-center gap-2">
                    <span className={cn('h-2.5 w-2.5 rounded-full', CATEGORY_META[a.item.category].dot)} aria-hidden />
                    {a.item.name}
                  </span>
                </th>
                <td className="py-2 text-right">
                  <Money value={a.value} currency={snapshot.currency} cents />
                </td>
              </tr>
            ))}
            {s.liabilities.map((l) => (
              <tr key={l.item.id} className="border-b last:border-0">
                <th scope="row" className="py-2 text-left font-normal">
                  {l.item.name} <span className="text-xs text-muted-foreground">({t('liabilities.label')})</span>
                </th>
                <td className="py-2 text-right text-debt">
                  <Money value={l.value === null ? null : -l.value} currency={snapshot.currency} cents />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground">{t('history.immutable')}</p>
      </DialogContent>
    </Dialog>
  )
}

export default function History() {
  const { t } = useTranslation()
  const f = useFormat()
  const ws = useWorkspace()
  const { displayCurrency } = useSettings()
  const deleteSnapshot = useWealth((s) => s.deleteSnapshot)
  const [detail, setDetail] = useState<Snapshot | null>(null)
  const [toDelete, setToDelete] = useState<Snapshot | null>(null)

  const sorted = useMemo(() => sortSnapshots(ws.snapshots), [ws.snapshots])
  const points: HistoryPoint[] = useMemo(
    () =>
      sorted.flatMap((s) => {
        const totals = snapshotTotalsIn(s, displayCurrency)
        return totals ? [{ id: s.id, date: s.createdAt, netWorth: totals.netWorth, assets: totals.assets, liabilities: totals.liabilities }] : []
      }),
    [sorted, displayCurrency],
  )
  const notConvertible = sorted.length - points.length

  return (
    <>
      <PageHeader title={t('nav.history')} description={t('history.description')} actions={<SnapshotButton variant="default" />} />

      {sorted.length === 0 ? (
        <Card className="grid place-items-center gap-3 border-dashed px-6 py-14 text-center">
          <p className="text-lg font-medium">{t('history.emptyTitle')}</p>
          <p className="max-w-md text-sm text-muted-foreground">{t('history.emptyBody')}</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {points.length >= 2 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('history.trend')}</CardTitle>
                <CardDescription>{t('history.trendHint', { currency: displayCurrency })}</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="h-72 animate-pulse rounded-lg bg-muted" />}>
                  <HistoryChart points={points} />
                </Suspense>
              </CardContent>
            </Card>
          )}
          {notConvertible > 0 && <p className="text-sm text-warning">{t('history.notConvertible', { count: notConvertible })}</p>}

          <Card>
            <ol className="divide-y">
              {[...sorted].reverse().map((s, i, arr) => {
                const previous = arr[i + 1]
                const totals = snapshotTotalsIn(s, displayCurrency)
                const diff = previous ? diffSnapshots(previous, s, displayCurrency) : null
                return (
                  <li key={s.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{f.dateTime(s.createdAt)}</p>
                      {s.note && <p className="truncate text-sm text-muted-foreground">“{s.note}”</p>}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('summary.assets')} <Money value={totals?.assets ?? s.totals.assets} currency={totals ? displayCurrency : s.currency} /> ·{' '}
                        {t('summary.liabilities')}{' '}
                        <Money value={totals?.liabilities ?? s.totals.liabilities} currency={totals ? displayCurrency : s.currency} />
                        {s.currency !== displayCurrency && totals && <> · {t('history.convertedNote', { currency: s.currency })}</>}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-lg font-semibold">
                        <Money value={totals?.netWorth ?? s.totals.netWorth} currency={totals ? displayCurrency : s.currency} />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {diff ? (
                          <>
                            <Money value={diff.netWorth} signed tone /> {t('history.vsPrevious')}
                          </>
                        ) : previous ? (
                          t('history.diffUnavailable')
                        ) : (
                          t('history.first')
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setDetail(s)} aria-label={t('history.view', { date: f.dateTime(s.createdAt) })}>
                        <Eye aria-hidden />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setToDelete(s)} aria-label={t('history.delete', { date: f.dateTime(s.createdAt) })}>
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ol>
          </Card>
        </div>
      )}

      <Card className="mt-6 bg-muted/40">
        <CardContent className="grid gap-2 pt-5 text-sm text-muted-foreground sm:pt-6">
          <p className="font-medium text-foreground">{t('history.conventionTitle')}</p>
          <p>{t('history.conventionCurrency')}</p>
          <p>{t('history.conventionReturn')}</p>
        </CardContent>
      </Card>

      {detail && <SnapshotDetail snapshot={detail} onClose={() => setDetail(null)} />}
      <AlertDialog open={toDelete !== null} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('history.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('history.deleteBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) deleteSnapshot(toDelete.id)
                setToDelete(null)
                toast.success(t('history.deleted'))
              }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
