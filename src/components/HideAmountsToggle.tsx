import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useWealth } from '@/stores/wealthStore'

export function HideAmountsToggle() {
  const { t } = useTranslation()
  const hidden = useWealth((s) => s.hideAmounts)
  const setHidden = useWealth((s) => s.setHideAmounts)
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={hidden}
      aria-label={t('hide.toggle')}
      title={hidden ? t('hide.showTitle') : t('hide.hideTitle')}
      onClick={() => setHidden(!hidden)}
    >
      {hidden ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
    </Button>
  )
}
