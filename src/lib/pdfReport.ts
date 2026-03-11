/**
 * PDF Report Generator
 * 
 * Generate comprehensive wealth report as PDF
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { Asset, Currency, WealthSummary } from '@/types/wealth'
import { CATEGORY_METADATA } from '@/types/wealth'
import { convertValue } from '@/stores/wealthStore'

interface ReportData {
  assets: Asset[]
  summary: WealthSummary
  t: (key: string, options?: any) => string
  displayCurrency: Currency
  exchangeRate: number
  locale: string
}

/**
 * Create a currency formatter for the given locale and currency
 */
const makeCurrencyFormatter = (locale: string, currency: Currency) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

/**
 * Format date for PDF
 */
const formatDate = (date: Date, locale: string): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

/**
 * Create HTML content for PDF generation
 */
const createReportHTML = (data: ReportData): string => {
  const { assets, summary, t, displayCurrency, exchangeRate, locale } = data
  const fmt = makeCurrencyFormatter(locale, displayCurrency)
  const formatCurrency = (value: number) => fmt.format(value)
  const toDisplay = (asset: Asset) =>
    convertValue(asset.value, asset.currency ?? displayCurrency, displayCurrency, exchangeRate)
  const totalValue = summary.totalWealth
  const reportDate = formatDate(new Date(), locale)

  // Categories summary HTML
  const categoriesHTML = summary.categories.map(category => {
    const percentage = totalValue > 0 ? ((category.total / totalValue) * 100).toFixed(1) : '0.0'
    
    return `
      <tr>
        <td style="padding: 12px; border: 1px solid #ddd;">${t(`categories.${category.category}`)}</td>
        <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${category.count}</td>
        <td style="padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: 600;">${formatCurrency(category.total)}</td>
        <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">${percentage}%</td>
      </tr>
    `
  }).join('')

  // Create visual bar chart for categories
  const categoryColors: Record<string, string> = {
    'shareholdings': '#3B82F6',
    'realestate': '#10B981',
    'personalassets': '#8B5CF6',
    'cash': '#F59E0B'
  }
  
  const categoryBarsHTML = summary.categories.map(category => {
    const percentage = totalValue > 0 ? ((category.total / totalValue) * 100) : 0
    const barWidth = percentage // Usa direttamente la percentuale per la larghezza
    const color = categoryColors[category.category] || '#6B7280'
    
    return `
      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span style="font-weight: 600; color: #374151;">${t(`categories.${category.category}`)}</span>
          <span style="font-weight: 600; color: #1f2937;">${formatCurrency(category.total)} (${percentage.toFixed(1)}%)</span>
        </div>
        <div style="background: #E5E7EB; height: 30px; border-radius: 6px; overflow: hidden;">
          <div style="background: ${color}; height: 100%; width: ${barWidth}%; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; color: white; font-weight: 600; font-size: 12px;">
            ${category.count} ${t('pdfReport.table.assets').toLowerCase()}
          </div>
        </div>
      </div>
    `
  }).join('')

  // Assets table HTML - diviso per pagine (inizia da pagina 2)
  const assetsPerPage = 15 // Numero di asset per pagina
  const assetPages: string[] = []
  const totalAssetPages = Math.ceil(assets.length / assetsPerPage)
  
  for (let i = 0; i < assets.length; i += assetsPerPage) {
    const pageAssets = assets.slice(i, i + assetsPerPage)
    const assetsHTML = pageAssets.map(asset => {
      const displayVal = toDisplay(asset)
      const percentage = totalValue > 0 ? ((displayVal / totalValue) * 100).toFixed(1) : '0.0'
      
      return `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${asset.name}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${t(`categories.${asset.category}`)}</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${asset.ownership}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 600;">${formatCurrency(displayVal)}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${percentage}%</td>
        </tr>
      `
    }).join('')

    const pageNumber = Math.floor(i / assetsPerPage) + 2 // Inizia da pagina 2
    const isLastPage = (i + assetsPerPage) >= assets.length
    
    assetPages.push(`
      <div class="page"${isLastPage ? '' : ' style="page-break-after: always;"'}>
        <div class="page-header">
          <h2>${t('pdfReport.assets.title')} (${t('pdfReport.page')} ${pageNumber})</h2>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>${t('pdfReport.table.assetName')}</th>
              <th>${t('pdfReport.table.category')}</th>
              <th>${t('pdfReport.table.ownership')}</th>
              <th style="text-align: right;">${t('pdfReport.table.value')}</th>
              <th style="text-align: right;">${t('pdfReport.table.percentage')}</th>
            </tr>
          </thead>
          <tbody>
            ${assetsHTML}
          </tbody>
        </table>
        
        ${isLastPage ? `
        <!-- Footer (last page) -->
        <div class="footer">
          <p><strong>${t('pdfReport.footer.generated')} 3ASYWEALTH v1.0.0</strong></p>
          <p>${t('pdfReport.footer.opensource')} | ${t('pdfReport.footer.privacy')}</p>
        </div>
        ` : ''}
      </div>
    `)
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          margin: 20mm;
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          line-height: 1.4;
          color: #333;
        }
        
        .page {
          margin-bottom: 30px;
        }
        
        .page-header {
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #667eea;
        }
        
        .page-header h2 {
          color: #4a5568;
          font-size: 20px;
          margin: 0;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
        }
        
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: bold;
        }
        
        .header p {
          margin: 5px 0;
          font-size: 14px;
          opacity: 0.9;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section h2 {
          color: #4a5568;
          border-bottom: 2px solid #667eea;
          padding-bottom: 8px;
          margin-bottom: 20px;
          font-size: 20px;
        }
        
        .summary-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 25px 0;
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .stat-item {
          text-align: center;
          padding: 15px;
          background: white;
          border-radius: 6px;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #2d3748;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 13px;
          color: #718096;
          font-weight: 500;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 13px;
        }
        
        th {
          background-color: #4a5568;
          color: white;
          padding: 14px 12px;
          text-align: left;
          border: 1px solid #2d3748;
          font-weight: 600;
        }
        
        td {
          padding: 12px;
          border: 1px solid #ddd;
        }
        
        tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        .privacy-notice {
          background: #e6fffa;
          border: 2px solid #38b2ac;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          font-size: 13px;
        }
        
        .privacy-notice h3 {
          margin: 0 0 10px 0;
          color: #2c7a7b;
          font-size: 16px;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 11px;
          color: #718096;
          border-top: 2px solid #e2e8f0;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <!-- PAGE 1: Header, Privacy, Summary -->
      <div class="page" style="page-break-after: always;">
        <!-- Header -->
        <div class="header">
          <h1>3ASYWEALTH</h1>
          <p>${t('pdfReport.title')}</p>
          <p>${t('pdfReport.generatedOn')}: ${reportDate}</p>
        </div>

        <!-- Privacy Notice -->
        <div class="privacy-notice">
          <h3>🔒 ${t('pdfReport.privacy.title')}</h3>
          <p>${t('pdfReport.privacy.message')}</p>
        </div>

        <!-- Summary Section -->
        <div class="section">
          <h2>${t('pdfReport.summary.title')}</h2>
          
          <div class="summary-stats">
            <div class="stat-item">
              <div class="stat-value">${formatCurrency(totalValue)}</div>
              <div class="stat-label">${t('pdfReport.summary.totalWealth')}</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${summary.assetCount}</div>
              <div class="stat-label">${t('pdfReport.summary.totalAssets')}</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${summary.categories.length}</div>
              <div class="stat-label">${t('pdfReport.summary.categories')}</div>
            </div>
          </div>

          <h3 style="color: #4a5568; margin: 30px 0 15px 0; font-size: 18px;">${t('pdfReport.categoryBreakdown')}</h3>
          <table>
            <thead>
              <tr>
                <th>${t('pdfReport.table.category')}</th>
                <th style="text-align: center;">${t('pdfReport.table.assets')}</th>
                <th style="text-align: right;">${t('pdfReport.table.value')}</th>
                <th style="text-align: right;">${t('pdfReport.table.percentage')}</th>
              </tr>
            </thead>
            <tbody>
              ${categoriesHTML}
            </tbody>
          </table>

          <!-- Visual Charts Section -->
          <h3 style="color: #4a5568; margin: 30px 0 20px 0; font-size: 18px;">${t('pdfReport.visualBreakdown')}</h3>
          <div style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0;">
            ${categoryBarsHTML}
          </div>
        </div>
      </div>

      <!-- PAGES 2+: Asset Details -->
      ${assetPages.join('\n')}
    </body>
    </html>
  `
}

/**
 * Generate PDF report from assets and summary
 */
export async function generatePDFReport(data: ReportData): Promise<void> {
  try {
    // Create a temporary container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = '800px'
    container.innerHTML = createReportHTML(data)
    document.body.appendChild(container)

    // Wait for content to render
    await new Promise(resolve => setTimeout(resolve, 100))

    // Generate canvas from HTML
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      logging: false
    })

    // Remove temporary container
    document.body.removeChild(container)

    // Create PDF with proper margins
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 170 // A4 width minus margins (210 - 40)
    const pageHeight = 257 // A4 height minus margins (297 - 40)
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const marginLeft = 20
    const marginTop = 20

    // Calculate how many pages we need
    const totalPages = Math.ceil(imgHeight / pageHeight)

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage()
      }

      const sourceY = i * pageHeight * (canvas.width / imgWidth)
      const sourceHeight = Math.min(
        pageHeight * (canvas.width / imgWidth),
        canvas.height - sourceY
      )

      // Create a temporary canvas for this page
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = sourceHeight
      const ctx = pageCanvas.getContext('2d')
      
      if (ctx) {
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        )

        const pageImgHeight = (sourceHeight * imgWidth) / canvas.width
        pdf.addImage(
          pageCanvas.toDataURL('image/png'),
          'PNG',
          marginLeft,
          marginTop,
          imgWidth,
          pageImgHeight,
          undefined,
          'FAST'
        )
      }
    }

    // Download PDF
    const filename = `3ASYWEALTH_Report_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(filename)

  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error generating PDF:', error)
    }
    throw new Error(data.t('pdfReport.error'))
  }
}