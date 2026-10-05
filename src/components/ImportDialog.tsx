import { AlertTriangle, Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { summarize } from '@/domain/calc'
import { downloadBackup } from '@/lib/downloads'
import { errorCount, findDuplicates, itemsToAdd, replacementWorkspace, type ImportCandidate } from '@/lib/importFile'
import { cn } from '@/lib/utils'
import { useWealth } from '@/stores/wealthStore'
import { IssueList } from './IssueList'
import { Money } from './Money'

type Mode = 'add' | 'replace'

export function ImportDialog({ candidate, onClose }: { candidate: ImportCandidate; onClose: () => void }) {
  const { t } = useTranslation()
  const personal = useWealth((s) => s.personal)
  const mergeIntoPersonal = useWealth((s) => s.mergeIntoPersonal)
  const replacePersonal = useWealth((s) => s.replacePersonal)
  const personalEmpty = personal.assets.length + personal.liabilities.length + personal.snapshots.length === 0

  const [mode, setMode] = useState<Mode>(personalEmpty ? 'replace' : 'add')
  const [skipDuplicates, setSkipDuplicates] = useState(false)
  const [backupFailed, setBackupFailed] = useState(false)
  const [forceConfirmed, setForceConfirmed] = useState(false)

  const duplicates = useMemo(() => findDuplicates(personal, candidate), [personal, candidate])
  const errors = errorCount(candidate)
  const validItems = candidate.assets.length + candidate.liabilities.length
  const nothingToImport = validItems + candidate.snapshots.length === 0

  const preview = useMemo(() => {
    const result =
      mode === 'replace'
        ? replacementWorkspace(personal, candidate)
        : (() => {
            const add = itemsToAdd(candidate, skipDuplicates ? duplicates : new Set())
            const rate = personal.settings.eurUsdRate ?? candidate.settings?.eurUsdRate ?? null
            return {
              ...personal,
              assets: [...personal.assets, ...add.assets],
              liabilities: [...personal.liabilities, ...add.liabilities],
              settings: { ...personal.settings, eurUsdRate: rate },
            }
          })()
    return summarize(result)
  }, [mode, personal, candidate, skipDuplicates, duplicates])

  const apply = () => {
    if (mode === 'add') {
      const add = itemsToAdd(candidate, skipDuplicates ? duplicates : new Set())
      mergeIntoPersonal(add, candidate.settings?.eurUsdRate ?? null)
      toast.success(t('import.done', { count: add.assets.length + add.liabilities.length }))
      onClose()
      return
    }
    const result = replacePersonal(replacementWorkspace(personal, candidate), 'beforeReplace', forceConfirmed)
    if (!result.ok) {
      setBackupFailed(true)
      return
    }
    toast.success(t('import.replaced'), result.backupKey ? { description: t('import.backupCreated') } : undefined)
    onClose()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={t('common.close')} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('import.previewTitle')}</DialogTitle>
          <DialogDescription className="break-all">{candidate.fileName}</DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted/60 p-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">{t('summary.assets')}</dt>
            <dd className="num font-semibold">{candidate.assets.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('summary.liabilities')}</dt>
            <dd className="num font-semibold">{candidate.liabilities.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('import.snapshots')}</dt>
            <dd className="num font-semibold">{candidate.snapshots.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t('import.rejected')}</dt>
            <dd className={cn('num font-semibold', errors > 0 && 'text-destructive')}>{errors}</dd>
          </div>
        </dl>

        {candidate.source !== 'csv' && candidate.source !== 'v2' && <p className="text-sm text-muted-foreground">{t('import.legacyFile')}</p>}

        {errors > 0 && (
          <div className="rounded-lg border border-destructive/30 p-3 text-sm">
            <p className="font-medium">{t('import.errorsTitle', { count: errors })}</p>
            {candidate.format === 'csv' ? (
              <ul className="mt-1 grid max-h-40 gap-0.5 overflow-y-auto">
                {candidate.csvIssues.map((i, n) => (
                  <li key={n} className={i.severity === 'error' ? 'text-destructive' : 'text-warning'}>
                    {t('import.line', { line: i.line })}: {t(`import.field.${i.field}`)}
                    {i.value ? ` («${i.value}»)` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <IssueList issues={candidate.jsonIssues} max={20} />
            )}
          </div>
        )}
        {candidate.format === 'csv' && errors === 0 && candidate.csvIssues.length > 0 && (
          <ul className="text-sm text-warning">
            {candidate.csvIssues.map((i, n) => (
              <li key={n}>
                {t('import.line', { line: i.line })}: {t(`import.field.${i.field}`)} {i.value ? `(«${i.value}»)` : ''}
              </li>
            ))}
          </ul>
        )}
        {candidate.ignoredColumns.length > 0 && (
          <p className="text-sm text-muted-foreground">{t('import.ignoredColumns', { columns: candidate.ignoredColumns.join(', ') })}</p>
        )}

        {!nothingToImport && (
          <fieldset className="grid gap-2">
            <legend className="mb-1.5 text-sm font-medium">{t('import.modeLegend')}</legend>
            {(['add', 'replace'] as const).map((m) => (
              <label
                key={m}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm',
                  mode === m ? 'border-primary bg-accent/60' : 'hover:bg-muted/60',
                )}
              >
                <input
                  type="radio"
                  name="import-mode"
                  checked={mode === m}
                  onChange={() => {
                    setMode(m)
                    setBackupFailed(false)
                  }}
                  className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
                />
                <span>
                  <span className="block font-medium">{t(`import.mode.${m}`)}</span>
                  <span className="block text-xs text-muted-foreground">
                    {m === 'add' ? t('import.mode.addHint') : t(`import.mode.replaceHint.${candidate.format}`)}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        )}

        {mode === 'add' && duplicates.size > 0 && (
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={skipDuplicates}
              onChange={(e) => setSkipDuplicates(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <span>
              {t('import.duplicates', { count: duplicates.size })}
              <span className="block text-xs text-muted-foreground">{t('import.duplicatesHint')}</span>
            </span>
          </label>
        )}

        {mode === 'replace' && !personalEmpty && (
          <div className="rounded-lg border border-warning/40 bg-warning-soft p-3 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4 text-warning" aria-hidden />
              {t('import.replaceWarning')}
            </p>
            <p className="mt-1 text-muted-foreground">{t('import.replaceBackup')}</p>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => downloadBackup(personal)}>
              <Download aria-hidden />
              {t('data.backup.download')}
            </Button>
            {backupFailed && (
              <div role="alert" className="mt-3 grid gap-2">
                <p className="text-destructive">{t('import.backupFailed')}</p>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={forceConfirmed}
                    onChange={(e) => setForceConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4"
                  />
                  {t('import.forceConfirm')}
                </label>
              </div>
            )}
          </div>
        )}

        {!nothingToImport && (
          <p className="text-sm">
            {t('import.resulting')} <Money value={preview.totals.netWorth} className="font-semibold" />
            {preview.missingRate > 0 && <span className="text-warning"> · {t('rate.missingTitle', { count: preview.missingRate })}</span>}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={apply}
            disabled={nothingToImport || (backupFailed && !forceConfirmed)}
            variant={mode === 'replace' && !personalEmpty ? 'destructive' : 'default'}
          >
            {mode === 'add' ? t('import.confirmAdd', { count: validItems + candidate.snapshots.length }) : t('import.confirmReplace')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
