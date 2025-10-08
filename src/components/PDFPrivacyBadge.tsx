/**
 * Privacy Badge for PDF Export
 * 
 * Privacy reassurance specifically for PDF generation
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

import { useTranslation } from 'react-i18next'
import { Shield, Lock, Download } from 'lucide-react'

export function PDFPrivacyBadge() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg text-sm max-w-sm">
      <div className="flex items-center gap-1">
        <Download className="w-4 h-4 text-emerald-600" />
        <Shield className="w-4 h-4 text-emerald-600" />
        <Lock className="w-3 h-3 text-emerald-600" />
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-emerald-800 text-xs">
          {t('pdfPrivacyBadge.title')}
        </span>
        <span className="text-emerald-700 text-xs">
          {t('pdfPrivacyBadge.subtitle')}
        </span>
      </div>
    </div>
  )
}