import { useTranslation } from 'react-i18next'
import { useFormat, type MoneyOptions } from '@/hooks/useFormat'
import { cn } from '@/lib/utils'

interface MoneyProps extends MoneyOptions {
  value: number | null
  className?: string
  /** Colour positive/negative values (for differences). */
  tone?: boolean
}

/** Amount with tabular figures that honours "hide amounts". */
export function Money({ value, className, tone, ...options }: MoneyProps) {
  const { t } = useTranslation()
  const f = useFormat()
  if (value === null) {
    return <span className={cn('num text-muted-foreground', className)}>{t('common.notAvailable')}</span>
  }
  const hidden = f.hidden && !options.reveal
  return (
    <span
      className={cn(
        'num whitespace-nowrap',
        tone && !hidden && value > 0 && 'text-positive',
        tone && !hidden && value < 0 && 'text-negative',
        className,
      )}
      aria-label={hidden ? t('hide.hiddenAmount') : undefined}
    >
      {f.money(value, options)}
    </span>
  )
}
