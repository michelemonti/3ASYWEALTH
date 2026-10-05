import { useTranslation } from 'react-i18next'
import type { Issue } from '@/domain/validate'

/** Human-readable list of records that could not be read, so nothing disappears silently. */
export function IssueList({ issues, max = 8 }: { issues: Issue[]; max?: number }) {
  const { t } = useTranslation()
  return (
    <ul className="mt-1 grid gap-0.5 text-sm">
      {issues.slice(0, max).map((i, n) => (
        <li key={n} className={i.severity === 'error' ? 'text-destructive' : 'text-warning'}>
          {t(`issues.kind.${i.kind}`)} {i.kind !== 'settings' && `#${i.index + 1}`}
          {i.name ? ` «${i.name}»` : ''}: {t(`issues.field.${i.field}`)}
          {i.severity === 'error' ? ` — ${t('issues.skipped')}` : ''}
        </li>
      ))}
      {issues.length > max && <li className="text-muted-foreground">{t('issues.more', { count: issues.length - max })}</li>}
    </ul>
  )
}
