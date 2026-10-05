import { Download, FileDown, FlaskConical, FileSpreadsheet, Loader2, RotateCcw, Trash2, Upload } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ImportDialog } from '@/components/ImportDialog'
import { PageHeader } from '@/components/PageHeader'
import { RateField } from '@/components/RateDialog'
import { Segmented } from '@/components/Segmented'
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
import { parseRate, toInputString } from '@/domain/numbers'
import { readDocument } from '@/domain/validate'
import type { Currency } from '@/domain/types'
import type { DemoLabelKey } from '@/domain/demo'
import { useFormat } from '@/hooks/useFormat'
import { useTheme, type Theme } from '@/hooks/useTheme'
import { LANGUAGES, setLanguage, type LanguageCode } from '@/i18n/config'
import { downloadBackup, downloadCsv, downloadRaw } from '@/lib/downloads'
import { downloadBlob, readImportFile, type ImportCandidate, type ImportReadError } from '@/lib/importFile'
import { buildReportModel } from '@/lib/report'
import { listBackups, readRaw, removeKey, type BackupEntry } from '@/lib/storage'
import { appKV, useIsDemo, useSettings, useWealth, useWorkspace } from '@/stores/wealthStore'

function Section({ id, title, description, children }: { id?: string; title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-20">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  )
}

function CurrencySection() {
  const { t } = useTranslation()
  const f = useFormat()
  const settings = useSettings()
  const setDisplayCurrency = useWealth((s) => s.setDisplayCurrency)
  const setRate = useWealth((s) => s.setRate)
  const [rate, setRateInput] = useState('')
  const [error, setError] = useState<string>()
  const id = useId()
  useEffect(() => {
    setRateInput(settings.eurUsdRate ? toInputString(settings.eurUsdRate, f.locale, 6) : '')
  }, [settings.eurUsdRate, f.locale])

  return (
    <Section title={t('data.currency.title')} description={t('data.currency.description')}>
      <div className="grid gap-1.5">
        <span className="text-sm font-medium">{t('data.currency.display')}</span>
        <Segmented<Currency>
          label={t('data.currency.display')}
          value={settings.displayCurrency}
          onChange={setDisplayCurrency}
          options={[
            { value: 'EUR', label: 'EUR €' },
            { value: 'USD', label: 'USD $' },
          ]}
        />
      </div>
      <form
        className="grid gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          const r = parseRate(rate, f.decimal)
          if ('error' in r) return setError(t(`rate.errors.${r.error}`))
          setError(undefined)
          setRate(r.value)
          toast.success(t('rate.saved'))
        }}
      >
        <div className="flex flex-wrap items-end gap-3">
          <RateField id={id} value={rate} onChange={setRateInput} error={error} />
          <Button type="submit" variant="outline">
            {t('common.save')}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('rate.description')}{' '}
          {settings.eurUsdRate
            ? settings.eurUsdRateDate
              ? t('rate.setOn', { date: f.date(settings.eurUsdRateDate) })
              : t('rate.dateUnknown')
            : t('rate.notSet')}
        </p>
      </form>
    </Section>
  )
}

function AppearanceSection() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const hidden = useWealth((s) => s.hideAmounts)
  const setHidden = useWealth((s) => s.setHideAmounts)
  return (
    <Section title={t('data.appearance.title')}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <span className="text-sm font-medium">{t('language.label')}</span>
          <Segmented<LanguageCode>
            label={t('language.label')}
            value={i18n.language as LanguageCode}
            onChange={setLanguage}
            options={LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
          />
        </div>
        <div className="grid gap-1.5">
          <span className="text-sm font-medium">{t('theme.label')}</span>
          <Segmented<Theme>
            label={t('theme.label')}
            value={theme}
            onChange={setTheme}
            options={(['light', 'dark', 'system'] as const).map((v) => ({ value: v, label: t(`theme.${v}`) }))}
          />
        </div>
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]" />
        <span>
          <span className="block font-medium">{t('hide.label')}</span>
          <span className="block text-muted-foreground">{t('hide.explain')}</span>
        </span>
      </label>
    </Section>
  )
}

function readErrorMessage(t: (k: string, o?: Record<string, unknown>) => string, e: ImportReadError): string {
  if (e.error === 'unterminatedQuote') return t('import.errors.unterminatedQuote', { line: e.line })
  if (e.error === 'missingColumns') return t('import.errors.missingColumns', { columns: e.missing.join(', ') })
  return t(`import.errors.${e.error}`)
}

function BackupSection() {
  const { t } = useTranslation()
  const f = useFormat()
  const ws = useWorkspace()
  const isDemo = useIsDemo()
  const hidden = useWealth((s) => s.hideAmounts)
  const fileRef = useRef<HTMLInputElement>(null)
  const [candidate, setCandidate] = useState<ImportCandidate | null>(null)
  const [reading, setReading] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)
  const hasData = ws.assets.length + ws.liabilities.length > 0

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setReading(true)
    try {
      const r = await readImportFile(file, { defaultCurrency: ws.settings.displayCurrency, decimalHint: f.decimal, dateOrder: f.dateOrder })
      if (r.ok) setCandidate(r.candidate)
      else toast.error(t('import.failed'), { description: readErrorMessage(t, r) })
    } catch {
      toast.error(t('import.failed'), { description: t('import.errors.unreadable') })
    } finally {
      setReading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const makePdf = async () => {
    setPdfBusy(true)
    try {
      const { generatePdf } = await import('@/lib/pdfReport')
      const blob = generatePdf(buildReportModel(ws), t, f.locale)
      downloadBlob(blob, `3asywealth${isDemo ? '-demo' : ''}-report-${new Date().toISOString().slice(0, 10)}.pdf`)
      toast.success(t('pdf.done'))
    } catch {
      toast.error(t('pdf.error'))
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <Section id="import" title={t('data.backup.title')} description={t('data.backup.description')}>
      <div className="rounded-lg border border-warning/40 bg-warning-soft p-3 text-sm">{t('data.backup.browserWarning')}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant="default" disabled={!hasData && ws.snapshots.length === 0} onClick={() => downloadBackup(ws, isDemo)}>
          <Download aria-hidden />
          {t('data.backup.download')}
        </Button>
        <Button variant="outline" disabled={isDemo || reading} onClick={() => fileRef.current?.click()}>
          {reading ? <Loader2 className="animate-spin" aria-hidden /> : <Upload aria-hidden />}
          {t('data.backup.import')}
        </Button>
        <Button variant="outline" disabled={!hasData} onClick={() => downloadCsv(ws, isDemo)}>
          <FileSpreadsheet aria-hidden />
          {t('data.backup.csv')}
        </Button>
        <Button variant="outline" disabled={!hasData || pdfBusy} onClick={makePdf}>
          {pdfBusy ? <Loader2 className="animate-spin" aria-hidden /> : <FileDown aria-hidden />}
          {t('data.backup.pdf')}
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".json,.csv,.tsv,.txt,application/json,text/csv"
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <ul className="grid gap-1 text-xs text-muted-foreground">
        <li>{t('data.backup.jsonHint')}</li>
        <li>{t('data.backup.csvHint')}</li>
        <li>{t('data.backup.pdfHint')}</li>
        {hidden && <li className="text-warning">{t('data.backup.hiddenNote')}</li>}
        {isDemo && <li className="text-warning">{t('data.backup.demoNote')}</li>}
      </ul>
      {candidate && <ImportDialog candidate={candidate} onClose={() => setCandidate(null)} />}
    </Section>
  )
}

function LocalBackupsSection() {
  const { t } = useTranslation()
  const f = useFormat()
  const isDemo = useIsDemo()
  const revision = useWealth((s) => s.backupsRevision)
  const touch = useWealth((s) => s.touchBackups)
  const replacePersonal = useWealth((s) => s.replacePersonal)
  const backups = useMemo(() => listBackups(appKV), [revision]) // eslint-disable-line react-hooks/exhaustive-deps
  const [restoring, setRestoring] = useState<BackupEntry | null>(null)
  const [deleting, setDeleting] = useState<BackupEntry | null>(null)

  const restore = (b: BackupEntry) => {
    const raw = readRaw(appKV, b.key)
    let json: unknown
    try {
      json = raw === null ? null : JSON.parse(raw)
    } catch {
      json = null
    }
    const doc = json === null ? null : readDocument(json)
    if (!doc || !doc.ok) {
      toast.error(t('data.local.restoreFailed'))
      return
    }
    const result = replacePersonal(doc.workspace, 'beforeRestore')
    if (!result.ok) toast.error(t('import.backupFailed'))
    else toast.success(t('data.local.restored'))
  }

  return (
    <Section id="backups" title={t('data.local.title')} description={t('data.local.description')}>
      {backups.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('data.local.none')}</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {backups.map((b) => (
            <li key={b.key} className="flex flex-col gap-2 p-3 text-sm sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="font-medium">{t(`data.local.reason.${b.reason}`)}</p>
                <p className="text-xs text-muted-foreground">
                  {b.createdAt ? f.dateTime(b.createdAt) : t('data.local.unknownDate')} · {Math.max(1, Math.round(b.size / 1024))} KB
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const raw = readRaw(appKV, b.key)
                    if (raw !== null) downloadRaw(`3asywealth-${b.reason}-${(b.createdAt ?? 'legacy').slice(0, 10)}.json`, raw)
                  }}
                >
                  <Download aria-hidden />
                  {t('data.local.download')}
                </Button>
                <Button size="sm" variant="ghost" disabled={isDemo} onClick={() => setRestoring(b)}>
                  <RotateCcw aria-hidden />
                  {t('data.local.restore')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleting(b)} aria-label={t('data.local.delete')}>
                  <Trash2 aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <AlertDialog open={restoring !== null} onOpenChange={(o) => !o && setRestoring(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('data.local.restoreTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('data.local.restoreBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (restoring) restore(restoring)
                setRestoring(null)
              }}
            >
              {t('data.local.restore')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('data.local.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('data.local.deleteBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleting) removeKey(appKV, deleting.key)
                setDeleting(null)
                touch()
              }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  )
}

function DangerSection() {
  const { t } = useTranslation()
  const isDemo = useIsDemo()
  const personal = useWealth((s) => s.personal)
  const clearPersonal = useWealth((s) => s.clearPersonal)
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  const empty = personal.assets.length + personal.liabilities.length + personal.snapshots.length === 0

  const run = (force: boolean) => {
    const r = clearPersonal(force)
    if (!r.ok) {
      setFailed(true)
      return
    }
    setOpen(false)
    setFailed(false)
    toast.success(t('data.danger.cleared'), r.backupKey ? { description: t('import.backupCreated') } : undefined)
  }

  return (
    <Section title={t('data.danger.title')} description={t('data.danger.description')}>
      <div>
        <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" disabled={isDemo || empty} onClick={() => setOpen(true)}>
          <Trash2 aria-hidden />
          {t('data.danger.clear')}
        </Button>
      </div>
      <AlertDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) setFailed(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('data.danger.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('data.danger.confirmBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <Button variant="outline" onClick={() => downloadBackup(personal)}>
            <Download aria-hidden />
            {t('data.backup.download')}
          </Button>
          {failed && <p role="alert" className="text-sm text-destructive">{t('import.backupFailed')}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <Button variant="destructive" onClick={() => run(failed)}>
              {failed ? t('data.danger.clearAnyway') : t('data.danger.clear')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  )
}

function AboutSection() {
  const { t } = useTranslation()
  const isDemo = useIsDemo()
  const startDemo = useWealth((s) => s.startDemo)
  const navigate = useNavigate()
  return (
    <Section id="about" title={t('about.title')}>
      <p className="text-sm text-muted-foreground">{t('about.body')}</p>
      {!isDemo && (
        <div>
          <Button
            variant="outline"
            onClick={() => {
              startDemo((k: DemoLabelKey) => t(`demo.items.${k}`))
              navigate('/')
            }}
          >
            <FlaskConical aria-hidden />
            {t('welcome.demo')}
          </Button>
        </div>
      )}
      <dl className="grid gap-3 text-sm">
        {(['share', 'liquidity', 'debts', 'snapshots', 'privacy'] as const).map((k) => (
          <div key={k}>
            <dt className="font-medium">{t(`about.faq.${k}.q`)}</dt>
            <dd className="text-muted-foreground">{t(`about.faq.${k}.a`)}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground">
        {t('about.credits')}{' '}
        <a href="https://www.3asy.app" target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
          3ASY.APP
        </a>{' '}
        ·{' '}
        <a href="https://github.com/michelemonti" target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
          Michele “Miky” Monti
        </a>{' '}
        · {t('footer.license')}
      </p>
    </Section>
  )
}

export default function DataSettings() {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader title={t('nav.data')} description={t('data.description')} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="grid content-start gap-4">
          <BackupSection />
          <LocalBackupsSection />
          <DangerSection />
        </div>
        <div className="grid content-start gap-4">
          <CurrencySection />
          <AppearanceSection />
          <AboutSection />
        </div>
      </div>
    </>
  )
}
