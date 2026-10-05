import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parseRate, toInputString } from '@/domain/numbers'
import { useFormat } from '@/hooks/useFormat'
import { useSettings, useWealth } from '@/stores/wealthStore'
import { useUi } from '@/stores/uiStore'
import { toast } from 'sonner'

export function RateField({
  value,
  onChange,
  error,
  id,
}: {
  value: string
  onChange: (v: string) => void
  error?: string
  id: string
}) {
  const { t } = useTranslation()
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{t('rate.fieldLabel')}</Label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">1 EUR =</span>
        <Input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 num"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <span className="text-sm text-muted-foreground">USD</span>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export function RateDialog() {
  const { t } = useTranslation()
  const open = useUi((s) => s.rateOpen)
  const setOpen = useUi((s) => s.setRateOpen)
  const settings = useSettings()
  const setRate = useWealth((s) => s.setRate)
  const f = useFormat()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string>()
  const id = useId()

  useEffect(() => {
    if (open) {
      setValue(settings.eurUsdRate ? toInputString(settings.eurUsdRate, f.locale, 6) : '')
      setError(undefined)
    }
  }, [open, settings.eurUsdRate, f.locale])

  const save = () => {
    const r = parseRate(value, f.decimal)
    if ('error' in r) {
      setError(t(`rate.errors.${r.error}`))
      return
    }
    setRate(r.value)
    setOpen(false)
    toast.success(t('rate.saved'))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent closeLabel={t('common.close')} className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('rate.title')}</DialogTitle>
          <DialogDescription>{t('rate.description')}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <RateField id={id} value={value} onChange={setValue} error={error} />
          <p className="text-xs text-muted-foreground">
            {settings.eurUsdRate
              ? settings.eurUsdRateDate
                ? t('rate.setOn', { date: f.date(settings.eurUsdRateDate) })
                : t('rate.dateUnknown')
              : t('rate.notSet')}
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">{t('common.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
