import { Camera } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button, type ButtonProps } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFormat } from '@/hooks/useFormat'
import { useSummary } from '@/hooks/useSummary'
import { useWealth } from '@/stores/wealthStore'
import { useUi } from '@/stores/uiStore'
import { Money } from './Money'

export function SnapshotButton({ variant = 'outline', size }: Pick<ButtonProps, 'variant' | 'size'>) {
  const { t } = useTranslation()
  const f = useFormat()
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const saveSnapshot = useWealth((s) => s.saveSnapshot)
  const setRateOpen = useUi((s) => s.setRateOpen)
  const summary = useSummary()
  const id = useId()

  const save = () => {
    const r = saveSnapshot(note)
    setOpen(false)
    setNote('')
    if (r.ok) {
      toast.success(t('snapshot.saved'), {
        description: t('snapshot.savedBody', { date: f.date(r.snapshot.createdAt, 'long') }),
      })
    } else if (r.reason === 'missingRate') {
      toast.error(t('snapshot.missingRate'), { action: { label: t('rate.set'), onClick: () => setRateOpen(true) } })
    } else {
      toast.error(t('snapshot.empty'))
    }
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <Camera aria-hidden />
        {t('snapshot.save')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent closeLabel={t('common.close')} className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('snapshot.dialogTitle')}</DialogTitle>
            <DialogDescription>{t('snapshot.dialogBody')}</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              save()
            }}
          >
            <div className="rounded-lg bg-muted/70 p-3 text-sm">
              <span className="text-muted-foreground">{t('summary.netWorth')}: </span>
              <Money value={summary.totals.netWorth} className="font-semibold" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={id}>{t('snapshot.note')}</Label>
              <Input id={id} value={note} maxLength={120} placeholder={t('snapshot.notePlaceholder')} onChange={(e) => setNote(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('snapshot.confirm')}</Button>
            </DialogFooter>
            <p className="text-xs text-muted-foreground">
              {t('snapshot.whereHint')}{' '}
              <Link to="/history" className="text-primary underline-offset-4 hover:underline" onClick={() => setOpen(false)}>
                {t('nav.history')}
              </Link>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
