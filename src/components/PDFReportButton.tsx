/**
 * PDF Report Button Component
 * 
 * Standalone button for generating PDF reports
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWealthStore } from '@/stores/wealthStore'
import { useCurrency } from '@/hooks/useCurrency'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'

export function PDFReportButton() {
  const { t } = useTranslation()
  const { assets, getSummary, displayCurrency, exchangeRate } = useWealthStore()
  const { locale } = useCurrency()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePDF = async () => {
    if (assets.length === 0) {
      return
    }

    setIsGenerating(true)
    
    try {
      const { generatePDFReport } = await import('@/lib/pdfReport')
      await generatePDFReport({
        assets,
        summary: getSummary(),
        t,
        displayCurrency,
        exchangeRate,
        locale,
      })
      alert(t('dataActions.pdf.success'))
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('PDF generation error:', error)
      }
      alert(t('dataActions.pdf.error'))
    } finally {
      setIsGenerating(false)
    }
  }

  if (assets.length === 0) {
    return null
  }

  return (
    <Button 
      onClick={handleGeneratePDF}
      disabled={isGenerating}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
      size="default"
    >
      {isGenerating ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <FileDown className="w-5 h-5 mr-2" />
      )}
      {isGenerating ? t('dataActions.pdf.generating') : t('dataActions.pdf.generate')}
    </Button>
  )
}