import { ArrowRight, FlaskConical, Plus, Sparkles } from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Composition, AssetsVsDebts } from '@/components/Composition'
import { Money } from '@/components/Money'
import { PageHeader } from '@/components/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { SnapshotButton } from '@/components/SnapshotButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { topAssets } from '@/domain/calc'
import type { DemoLabelKey } from '@/domain/demo'
import { sortSnapshots, snapshotTotalsIn } from '@/domain/snapshots'
import { roundCents } from '@/domain/numbers'
import { useFormat } from '@/hooks/useFormat'
import { useSummary } from '@/hooks/useSummary'
import { CATEGORY_META } from '@/lib/categories'
import { cn } from '@/lib/utils'
import { useIsDemo, useWealth, useWorkspace } from '@/stores/wealthStore'
import { useUi } from '@/stores/uiStore'

const WhatIfDialog = lazy(() => import('@/components/WhatIfDialog'))

function Welcome() {
  const { t } = useTranslation()
  const openAdd = useUi((s) => s.openAdd)
  const startDemo = useWealth((s) => s.startDemo)
  usePageTitle('')
  return (
    <section className="mx-auto grid max-w-3xl gap-8 py-6 sm:py-14">
      <div className="grid gap-4">
        <p className="text-sm font-medium text-primary">{t('welcome.kicker')}</p>
        <h1 className="text-4xl font-semibold leading-[1.05] sm:text-6xl">{t('welcome.title')}</h1>
        <p className="max-w-xl text-lg text-muted-foreground">{t('welcome.body')}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={() => openAdd()}>
          <Plus aria-hidden />
          {t('welcome.start')}
        </Button>
        <Button size="lg" variant="outline" onClick={() => startDemo((k: DemoLabelKey) => t(`demo.items.${k}`))}>
          <FlaskConical aria-hidden />
          {t('welcome.demo')}
        </Button>
      </div>
      <ul className="grid gap-4 border-t pt-8 text-sm sm:grid-cols-3">
        {(['one', 'two', 'three'] as const).map((k) => (
          <li key={k} className="grid gap-1">
            <span className="font-medium">{t(`welcome.points.${k}.title`)}</span>
            <span className="text-muted-foreground">{t(`welcome.points.${k}.body`)}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">
        {t('welcome.restore')}{' '}
        <Link to="/data#import" className="font-medium text-primary underline-offset-4 hover:underline">
          {t('welcome.restoreLink')}
        </Link>
      </p>
    </section>
  )
}

function Stat({ label, value, hint, className }: { label: string; value: number; hint: string; className?: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold', className)}>
        <Money value={value} />
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Card>
  )
}

function Dashboard() {
  const { t } = useTranslation()
  const f = useFormat()
  const summary = useSummary()
  const ws = useWorkspace()
  const openAdd = useUi((s) => s.openAdd)
  const [whatIf, setWhatIf] = useState(false)
  const top = topAssets(summary, 5)

  const lastSnapshot = useMemo(() => {
    const sorted = sortSnapshots(ws.snapshots)
    return sorted[sorted.length - 1] ?? null
  }, [ws.snapshots])
  const lastTotals = lastSnapshot ? snapshotTotalsIn(lastSnapshot, summary.currency) : null
  const sinceLast = lastTotals ? roundCents(summary.totals.netWorth - lastTotals.netWorth) : null

  return (
    <>
      <PageHeader
        title={t('nav.overview')}
        actions={
          <>
            <Button variant="outline" onClick={() => openAdd()}>
              <Plus aria-hidden />
              {t('common.add')}
            </Button>
            <SnapshotButton />
            <Button onClick={() => setWhatIf(true)}>
              <Sparkles aria-hidden />
              {t('whatIf.open')}
            </Button>
          </>
        }
      />

      <section aria-labelledby="net-worth" className="mb-6 rounded-2xl border bg-card p-6 sm:p-8">
        <h2 id="net-worth" className="text-sm font-medium text-muted-foreground">
          {t('summary.netWorth')}
        </h2>
        <p className={cn('mt-2 text-5xl font-semibold tracking-tight sm:text-6xl', summary.totals.netWorth < 0 && 'text-negative')}>
          <Money value={summary.totals.netWorth} />
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {summary.lastUpdated && t('summary.lastUpdated', { date: f.date(summary.lastUpdated, 'long') })}
          {summary.oldestValuation && <> · {t('summary.oldestValuation', { date: f.date(summary.oldestValuation) })}</>}
        </p>
        {summary.totals.netWorth < 0 && <p className="mt-2 text-sm text-muted-foreground">{t('summary.negativeHint')}</p>}
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label={t('summary.assets')} value={summary.totals.assets} hint={t('summary.items', { count: summary.assets.length })} />
        <Stat
          label={t('summary.liabilities')}
          value={summary.totals.liabilities}
          hint={t('summary.items', { count: summary.liabilities.length })}
          className={summary.totals.liabilities > 0 ? 'text-debt' : undefined}
        />
        <Stat label={t('summary.liquidity')} value={summary.totals.liquidity} hint={t('summary.liquidityHint')} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('summary.composition')}</CardTitle>
            <CardDescription>{t('summary.compositionHint')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-8">
            <Composition summary={summary} />
            <AssetsVsDebts summary={summary} />
          </CardContent>
        </Card>

        <div className="grid content-start gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('summary.topAssets')}</CardTitle>
            </CardHeader>
            <CardContent>
              {top.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('summary.noAssets')}</p>
              ) : (
                <ol className="grid grid-cols-1 gap-3">
                  {top.map(({ item, value }) => (
                    <li key={item.id} className="flex items-center gap-3 text-sm">
                      <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', CATEGORY_META[item.category].dot)} aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{item.name}</span>
                      <Money value={value} className="font-medium" />
                    </li>
                  ))}
                </ol>
              )}
              <Button variant="link" asChild className="mt-3 h-auto px-0">
                <Link to="/holdings">
                  {t('summary.seeAll')} <ArrowRight aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('history.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {lastSnapshot ? (
                <>
                  <p className="text-muted-foreground">{t('summary.lastSnapshot', { date: f.date(lastSnapshot.createdAt, 'long') })}</p>
                  {sinceLast !== null && (
                    <p className="mt-2 text-lg font-semibold">
                      {sinceLast === 0 ? t('summary.noChange') : <Money value={sinceLast} signed tone />}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">{t('summary.sinceLastHint')}</p>
                </>
              ) : (
                <p className="text-muted-foreground">{t('summary.noSnapshot')}</p>
              )}
              <Button variant="link" asChild className="mt-3 h-auto px-0">
                <Link to="/history">
                  {t('summary.openHistory')} <ArrowRight aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {whatIf && (
        <Suspense fallback={null}>
          <WhatIfDialog open={whatIf} onOpenChange={setWhatIf} />
        </Suspense>
      )}
    </>
  )
}

export default function Overview() {
  const ws = useWorkspace()
  const isDemo = useIsDemo()
  const blocked = useWealth((s) => s.persistence.status === 'blocked')
  const isEmpty = ws.assets.length + ws.liabilities.length + ws.snapshots.length === 0
  if (blocked && isEmpty) return null
  if (isEmpty && !isDemo) return <Welcome />
  return <Dashboard />
}
