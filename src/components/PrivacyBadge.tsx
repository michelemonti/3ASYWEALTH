/**
 * Privacy Badge Component
 * 
 * Visual badge emphasizing browser-only processing
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

import { useTranslation } from 'react-i18next'
import { Shield, Lock } from 'lucide-react'

export function PrivacyBadge() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-sm">
      <div className="flex items-center gap-1">
        <Shield className="w-4 h-4 text-green-600" />
        <Lock className="w-3 h-3 text-green-600" />
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-green-800 text-xs">
          {t('privacyBadge.title')}
        </span>
        <span className="text-green-700 text-xs">
          {t('privacyBadge.subtitle')}
        </span>
      </div>
    </div>
  )
}