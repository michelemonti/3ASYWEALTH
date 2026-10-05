/**
 * PDF report drawn with jsPDF's text API: real text, real tables, proper page breaks.
 * Loaded on demand (dynamic import) because jsPDF is heavy.
 */

import { jsPDF } from 'jspdf'
import type { TFunction } from 'i18next'
import { dateFromISODate } from '@/domain/numbers'
import type { Currency } from '@/domain/types'
import { toPdfText, type ReportModel } from './report'

const PAGE = { w: 210, h: 297, margin: 16 }
const INK: [number, number, number] = [28, 25, 23]
const MUTED: [number, number, number] = [110, 104, 98]
const RULE: [number, number, number] = [222, 216, 208]
const PRIMARY: [number, number, number] = [41, 65, 173]
const DEBT: [number, number, number] = [176, 60, 52]

interface Column {
  header: string
  width: number
  align?: 'left' | 'right'
}

export function generatePdf(model: ReportModel, t: TFunction, locale: string): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const contentW = PAGE.w - PAGE.margin * 2
  let y = PAGE.margin

  const money = (v: number | null, currency: Currency = model.currency, cents = false) =>
    v === null
      ? t('common.notAvailable')
      : new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          minimumFractionDigits: cents ? 2 : 0,
          maximumFractionDigits: cents ? 2 : 0,
        }).format(v)
  const pct = (v: number) => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2 }).format(v / 100)
  const date = (iso: string, withTime = false) =>
    new Intl.DateTimeFormat(locale, withTime ? { dateStyle: 'long', timeStyle: 'short' } : { dateStyle: 'medium' }).format(
      /^\d{4}-\d{2}-\d{2}$/.test(iso) ? dateFromISODate(iso) : new Date(iso),
    )

  const text = (value: string, x: number, yy: number, opts: { align?: 'left' | 'right'; maxWidth?: number } = {}) =>
    doc.text(toPdfText(value), x, yy, { align: opts.align ?? 'left', maxWidth: opts.maxWidth })
  const setColor = (c: [number, number, number]) => doc.setTextColor(c[0], c[1], c[2])
  const ensure = (needed: number) => {
    if (y + needed > PAGE.h - PAGE.margin - 8) {
      doc.addPage()
      y = PAGE.margin
      return true
    }
    return false
  }

  const heading = (label: string) => {
    ensure(16)
    y += 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    setColor(INK)
    text(label, PAGE.margin, y)
    y += 2.5
    doc.setDrawColor(...RULE)
    doc.line(PAGE.margin, y, PAGE.margin + contentW, y)
    y += 5
  }

  const table = (columns: Column[], rows: Array<Array<{ value: string; color?: [number, number, number]; bold?: boolean }>>) => {
    const lineH = 4.2
    const pad = 1.6
    const drawHeader = () => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      setColor(MUTED)
      let x = PAGE.margin
      for (const c of columns) {
        text(c.header.toUpperCase(), c.align === 'right' ? x + c.width : x, y, { align: c.align })
        x += c.width
      }
      y += 2
      doc.setDrawColor(...RULE)
      doc.line(PAGE.margin, y, PAGE.margin + contentW, y)
      y += 4
    }
    drawHeader()
    for (const row of rows) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const wrapped = row.map((cell, i) => doc.splitTextToSize(toPdfText(cell.value), columns[i]!.width - 2) as string[])
      const height = Math.max(...wrapped.map((w) => w.length)) * lineH + pad
      if (ensure(height + 2)) drawHeader()
      let x = PAGE.margin
      row.forEach((cell, i) => {
        const col = columns[i]!
        doc.setFont('helvetica', cell.bold ? 'bold' : 'normal')
        doc.setFontSize(9)
        setColor(cell.color ?? INK)
        doc.text(wrapped[i]!, col.align === 'right' ? x + col.width : x, y, { align: col.align ?? 'left' })
        x += col.width
      })
      y += height
      doc.setDrawColor(240, 236, 230)
      doc.line(PAGE.margin, y - pad - 1.2, PAGE.margin + contentW, y - pad - 1.2)
    }
    y += 2
  }

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  setColor(PRIMARY)
  text('3ASYWEALTH', PAGE.margin, y)
  y += 8
  doc.setFontSize(20)
  setColor(INK)
  text(t('pdf.title'), PAGE.margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  setColor(MUTED)
  text(t('pdf.generatedOn', { date: date(model.generatedAt, true) }), PAGE.margin, y)
  y += 4.5
  const rateLine =
    model.eurUsdRate !== null
      ? t('pdf.rateLine', {
          currency: model.currency,
          rate: new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }).format(model.eurUsdRate),
          date: model.eurUsdRateDate ? date(model.eurUsdRateDate) : t('pdf.dateUnknown'),
        })
      : t('pdf.currencyLine', { currency: model.currency })
  text(rateLine, PAGE.margin, y, { maxWidth: contentW })
  y += 4.5
  if (model.lastUpdated) {
    text(
      t('pdf.dataLine', {
        updated: date(model.lastUpdated),
        oldest: model.oldestValuation ? date(model.oldestValuation) : '—',
      }),
      PAGE.margin,
      y,
      { maxWidth: contentW },
    )
    y += 4.5
  }
  if (model.missingRate > 0) {
    setColor(DEBT)
    text(t('pdf.missingRate', { count: model.missingRate }), PAGE.margin, y, { maxWidth: contentW })
    y += 4.5
  }

  // Key figures
  y += 4
  const boxes = [
    { label: t('summary.netWorth'), value: model.totals.netWorth, color: model.totals.netWorth < 0 ? DEBT : INK },
    { label: t('summary.assets'), value: model.totals.assets, color: INK },
    { label: t('summary.liabilities'), value: model.totals.liabilities, color: DEBT },
    { label: t('summary.liquidity'), value: model.totals.liquidity, color: INK },
  ]
  const boxW = (contentW - 9) / 4
  boxes.forEach((b, i) => {
    const x = PAGE.margin + i * (boxW + 3)
    doc.setDrawColor(...RULE)
    doc.setFillColor(250, 248, 244)
    doc.roundedRect(x, y, boxW, 19, 2, 2, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    setColor(MUTED)
    text(b.label, x + 3, y + 6)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(i === 0 ? 13 : 11.5)
    setColor(b.color)
    text(money(b.value), x + 3, y + 14)
  })
  y += 25
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setColor(MUTED)
  text(t('pdf.netExplain'), PAGE.margin, y, { maxWidth: contentW })
  y += 6

  // Composition
  if (model.categories.length > 0) {
    heading(t('summary.composition'))
    table(
      [
        { header: t('holdings.col.category'), width: 80 },
        { header: t('pdf.items'), width: 22, align: 'right' },
        { header: t('pdf.value'), width: 46, align: 'right' },
        { header: t('pdf.shareOfAssets'), width: contentW - 148, align: 'right' },
      ],
      model.categories.map((c) => [
        { value: t(`categories.${c.category}.label`) },
        { value: String(c.count) },
        { value: money(c.total) },
        { value: pct(c.shareOfAssets) },
      ]),
    )
  }

  // Assets
  if (model.assets.length > 0) {
    heading(`${t('summary.assets')} (${model.assets.length})`)
    table(
      [
        { header: t('holdings.col.name'), width: 48 },
        { header: t('holdings.col.category'), width: 30 },
        { header: t('holdings.col.entered'), width: 32, align: 'right' },
        { header: t('pdf.share'), width: 15, align: 'right' },
        { header: t('holdings.col.yours'), width: 27, align: 'right' },
        { header: t('holdings.col.date'), width: contentW - 152, align: 'right' },
      ],
      model.assets.map((a) => [
        { value: a.name },
        { value: t(`categories.${a.category}.label`) },
        { value: money(a.amount, a.currency, true) },
        { value: a.ownershipPercent === null ? '—' : pct(a.ownershipPercent) },
        { value: money(a.value, model.currency, true), bold: true },
        { value: date(a.valuationDate) },
      ]),
    )
  }

  // Liabilities
  if (model.liabilities.length > 0) {
    heading(`${t('summary.liabilities')} (${model.liabilities.length})`)
    table(
      [
        { header: t('holdings.col.name'), width: 56 },
        { header: t('holdings.col.linked'), width: 40 },
        { header: t('holdings.col.original'), width: 30, align: 'right' },
        { header: t('holdings.col.owed'), width: 28, align: 'right' },
        { header: t('holdings.col.balanceDate'), width: contentW - 154, align: 'right' },
      ],
      model.liabilities.map((l) => [
        { value: l.name },
        { value: l.linkedTo ?? '—' },
        { value: money(l.amount, l.currency, true) },
        { value: money(l.value, model.currency, true), bold: true, color: DEBT },
        { value: date(l.valuationDate) },
      ]),
    )
  }

  heading(t('pdf.notesTitle'))
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  setColor(MUTED)
  for (const key of ['pdf.note1', 'pdf.note2', 'pdf.note3'] as const) {
    const lines = doc.splitTextToSize(toPdfText(t(key)), contentW) as string[]
    ensure(lines.length * 4 + 2)
    doc.text(lines, PAGE.margin, y)
    y += lines.length * 4 + 2
  }

  // Footer on every page
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    setColor(MUTED)
    text(t('pdf.footer'), PAGE.margin, PAGE.h - 9)
    text(t('pdf.page', { page: i, total: pages }), PAGE.w - PAGE.margin, PAGE.h - 9, { align: 'right' })
  }

  doc.setProperties({ title: `3ASYWEALTH — ${t('pdf.title')}`, creator: '3ASYWEALTH' })
  return doc.output('blob')
}
