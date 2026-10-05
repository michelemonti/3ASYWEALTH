import { useTranslation } from 'react-i18next'
import type { Summary } from '@/domain/calc'
import { useFormat } from '@/hooks/useFormat'
import { CATEGORY_META } from '@/lib/categories'
import { cn } from '@/lib/utils'
import { Money } from './Money'

/** Stacked bar of asset categories (share of total assets) plus a legend. */
export function Composition({ summary }: { summary: Summary }) {
  const { t } = useTranslation()
  const f = useFormat()
  const cats = summary.byCategory.filter((c) => c.total > 0)
  if (cats.length === 0) return <p className="text-sm text-muted-foreground">{t('summary.noAssets')}</p>
  return (
    <div className="grid grid-cols-1 gap-5">
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted" role="img" aria-label={t('summary.compositionAria')}>
        {cats.map((c) => (
          <div
            key={c.category}
            className={cn('h-full first:rounded-l-full last:rounded-r-full', CATEGORY_META[c.category].dot)}
            style={{ width: `${c.shareOfAssets}%` }}
            title={`${t(`categories.${c.category}.label`)} ${f.percent(c.shareOfAssets)}`}
          />
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-2.5">
        {summary.byCategory.map((c) => {
          const meta = CATEGORY_META[c.category]
          return (
            <li key={c.category} className="flex items-center gap-3 text-sm">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', meta.dot)} aria-hidden />
              <span className="min-w-0 flex-1 truncate">
                {t(`categories.${c.category}.label`)}{' '}
                <span className="text-muted-foreground">· {t('summary.items', { count: c.count })}</span>
              </span>
              <Money value={c.total} className="font-medium" />
              <span className="num w-14 text-right text-muted-foreground">{f.percent(c.shareOfAssets)}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Assets and debts side by side, scaled to the larger of the two (works for negative net worth). */
export function AssetsVsDebts({ summary }: { summary: Summary }) {
  const { t } = useTranslation()
  const { assets, liabilities } = summary.totals
  const max = Math.max(assets, liabilities, 1)
  const rows = [
    { key: 'assets', value: assets, className: 'bg-foreground/80' },
    { key: 'liabilities', value: liabilities, className: 'bg-debt' },
  ] as const
  return (
    <div className="grid gap-3">
      {rows.map((r) => (
        <div key={r.key} className="grid gap-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t(`summary.${r.key}`)}</span>
            <Money value={r.value} className="font-medium" />
          </div>
          <div className="h-2.5 rounded-full bg-muted">
            <div className={cn('h-full rounded-full', r.className)} style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
