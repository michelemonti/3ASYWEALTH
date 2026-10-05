import { AlertTriangle, Download, FlaskConical, Info, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useSummary } from '@/hooks/useSummary'
import { downloadBackup, downloadRaw } from '@/lib/downloads'
import { readRaw } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { appKV, useWealth } from '@/stores/wealthStore'
import { useUi } from '@/stores/uiStore'
import { IssueList } from './IssueList'

function Banner({
  tone,
  icon,
  children,
  actions,
}: {
  tone: 'info' | 'warning' | 'demo'
  icon: ReactNode
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <div
      role={tone === 'warning' ? 'alert' : 'status'}
      className={cn(
        'flex flex-col gap-3 rounded-xl border px-4 py-3 text-sm sm:flex-row sm:items-center',
        tone === 'warning' && 'border-warning/40 bg-warning-soft text-foreground',
        tone === 'info' && 'border-primary/25 bg-accent text-foreground',
        tone === 'demo' && 'border-dashed border-primary/40 bg-accent/60 text-foreground',
      )}
    >
      <div className="flex flex-1 items-start gap-3">
        <span className={cn('mt-0.5 shrink-0', tone === 'warning' ? 'text-warning' : 'text-primary')} aria-hidden>
          {icon}
        </span>
        <div className="grid gap-1">{children}</div>
      </div>
      {actions && <div className="flex flex-wrap gap-2 sm:shrink-0">{actions}</div>}
    </div>
  )
}

export function BlockedScreen() {
  const { t } = useTranslation()
  const persistence = useWealth((s) => s.persistence)
  const resolveBlocked = useWealth((s) => s.resolveBlocked)
  if (persistence.status !== 'blocked') return null
  const raw = readRaw(appKV, persistence.key)
  return (
    <Banner
      tone="warning"
      icon={<AlertTriangle className="h-5 w-5" />}
      actions={
        <>
          {raw !== null && (
            <Button size="sm" variant="outline" onClick={() => downloadRaw('3asywealth-original-data.json', raw)}>
              <Download aria-hidden />
              {t('blocked.download')}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              if (resolveBlocked()) toast.success(t('blocked.resolved'))
              else toast.error(t('blocked.resolveFailed'))
            }}
          >
            {t('blocked.setAside')}
          </Button>
        </>
      }
    >
      <p className="font-semibold">{t(`blocked.title.${persistence.error}`)}</p>
      <p className="text-muted-foreground">
        {persistence.error === 'invalidNoBackup' ? t('blocked.bodyInvalid') : t('blocked.body')}
      </p>
    </Banner>
  )
}

export function StatusBanners() {
  const { t } = useTranslation()
  const demo = useWealth((s) => s.demo)
  const personal = useWealth((s) => s.personal)
  const persistence = useWealth((s) => s.persistence)
  const notice = useWealth((s) => s.notice)
  const exitDemo = useWealth((s) => s.exitDemo)
  const dismissNotice = useWealth((s) => s.dismissNotice)
  const setRateOpen = useUi((s) => s.setRateOpen)
  const summary = useSummary()

  return (
    <div className="grid gap-3 empty:hidden">
      <BlockedScreen />

      {demo && (
        <Banner
          tone="demo"
          icon={<FlaskConical className="h-5 w-5" />}
          actions={
            <Button size="sm" variant="outline" onClick={exitDemo}>
              {t('demo.exit')}
            </Button>
          }
        >
          <p className="font-semibold">{t('demo.bannerTitle')}</p>
          <p className="text-muted-foreground">{t('demo.bannerBody')}</p>
        </Banner>
      )}

      {persistence.status === 'error' && (
        <Banner
          tone="warning"
          icon={<AlertTriangle className="h-5 w-5" />}
          actions={
            <Button size="sm" variant="outline" onClick={() => downloadBackup(personal)}>
              <Download aria-hidden />
              {t('data.backup.download')}
            </Button>
          }
        >
          <p className="font-semibold">{t(`persistence.${persistence.reason}.title`)}</p>
          <p className="text-muted-foreground">{t(`persistence.${persistence.reason}.body`)}</p>
        </Banner>
      )}

      {notice && (
        <Banner
          tone="info"
          icon={<Info className="h-5 w-5" />}
          actions={
            <>
              <Button size="sm" variant="outline" asChild>
                <Link to="/data#backups">{t('notice.seeBackups')}</Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={dismissNotice} aria-label={t('common.dismiss')}>
                <X aria-hidden />
              </Button>
            </>
          }
        >
          <p className="font-semibold">{t(`notice.${notice.kind}.title`)}</p>
          <p className="text-muted-foreground">{t(`notice.${notice.kind}.body`)}</p>
          {notice.issues.length > 0 && <IssueList issues={notice.issues} />}
        </Banner>
      )}

      {summary.missingRate > 0 && (
        <Banner
          tone="warning"
          icon={<AlertTriangle className="h-5 w-5" />}
          actions={
            <Button size="sm" onClick={() => setRateOpen(true)}>
              {t('rate.set')}
            </Button>
          }
        >
          <p className="font-semibold">{t('rate.missingTitle', { count: summary.missingRate })}</p>
          <p className="text-muted-foreground">{t('rate.missingBody', { currency: summary.currency })}</p>
        </Banner>
      )}
    </div>
  )
}
