/**
 * File import pipeline shared by CSV and JSON: read → preview → apply.
 * Reading never changes state; the caller decides to add or replace after the preview.
 */

import type { Asset, Liability, Settings, Snapshot, Workspace } from '@/domain/types'
import { readDocument, toDocument, type DocumentSource, type Issue } from '@/domain/validate'
import type { DecimalSeparator } from '@/domain/numbers'
import { importCsv, type Column, type CsvRowIssue } from './csv'
import type { Currency } from '@/domain/types'

export interface ImportCandidate {
  format: 'csv' | 'json'
  fileName: string
  assets: Asset[]
  liabilities: Liability[]
  snapshots: Snapshot[]
  /** Only full JSON backups carry settings. */
  settings: Settings | null
  source: DocumentSource | 'csv'
  csvIssues: CsvRowIssue[]
  jsonIssues: Issue[]
  /** Data rows (CSV) or records (JSON) found in the file. */
  totalRecords: number
  ignoredColumns: string[]
}

export type ImportReadError =
  | { error: 'tooLarge' }
  | { error: 'invalidJson' }
  | { error: 'unrecognized' }
  | { error: 'newerVersion' }
  | { error: 'empty' }
  | { error: 'unterminatedQuote'; line: number }
  | { error: 'missingColumns'; missing: Column[] }

export type ImportReadResult = { ok: true; candidate: ImportCandidate } | ({ ok: false } & ImportReadError)

export interface ImportOptions {
  defaultCurrency: Currency
  decimalHint: DecimalSeparator
  dateOrder: 'dmy' | 'mdy'
  now?: Date
}

const MAX_BYTES = 5 * 1024 * 1024

export function looksLikeJson(fileName: string, text: string): boolean {
  if (/\.json$/i.test(fileName)) return true
  if (/\.(csv|tsv|txt)$/i.test(fileName)) return false
  return /^\s*[[{]/.test(text.replace(/^\uFEFF/, ''))
}

export function readImportText(text: string, fileName: string, options: ImportOptions): ImportReadResult {
  if (looksLikeJson(fileName, text)) {
    let json: unknown
    try {
      json = JSON.parse(text.replace(/^\uFEFF/, ''))
    } catch {
      return { ok: false, error: 'invalidJson' }
    }
    const result = readDocument(json, { newId: () => crypto.randomUUID(), now: options.now ?? new Date() })
    if (!result.ok) return { ok: false, error: result.error }
    const ws = result.workspace
    const totalRecords =
      ws.assets.length + ws.liabilities.length + ws.snapshots.length + result.issues.filter((i) => i.severity === 'error').length
    if (totalRecords === 0) return { ok: false, error: 'empty' }
    return {
      ok: true,
      candidate: {
        format: 'json',
        fileName,
        assets: ws.assets,
        liabilities: ws.liabilities,
        snapshots: ws.snapshots,
        settings: ws.settings,
        source: result.source,
        csvIssues: [],
        jsonIssues: result.issues,
        totalRecords,
        ignoredColumns: [],
      },
    }
  }

  const csv = importCsv(text, options)
  if (!csv.ok) {
    if (csv.error === 'unterminatedQuote') return { ok: false, error: 'unterminatedQuote', line: csv.line ?? 0 }
    if (csv.error === 'missingColumns') return { ok: false, error: 'missingColumns', missing: csv.missing ?? [] }
    return { ok: false, error: 'empty' }
  }
  return {
    ok: true,
    candidate: {
      format: 'csv',
      fileName,
      assets: csv.assets,
      liabilities: csv.liabilities,
      snapshots: [],
      settings: null,
      source: 'csv',
      csvIssues: csv.issues,
      jsonIssues: [],
      totalRecords: csv.rowsTotal,
      ignoredColumns: csv.ignoredColumns,
    },
  }
}

export async function readImportFile(file: File, options: ImportOptions): Promise<ImportReadResult> {
  if (file.size > MAX_BYTES) return { ok: false, error: 'tooLarge' }
  const text = await file.text()
  return readImportText(text, file.name, options)
}

export function errorCount(c: ImportCandidate): number {
  return c.csvIssues.filter((i) => i.severity === 'error').length + c.jsonIssues.filter((i) => i.severity === 'error').length
}

const key = (name: string) => name.trim().toLocaleLowerCase()

/** Incoming items that look identical to something already present (same kind, name, amount, currency). */
export function findDuplicates(current: Pick<Workspace, 'assets' | 'liabilities'>, c: ImportCandidate): Set<string> {
  const assetKeys = new Set(current.assets.map((a) => `${key(a.name)}|${a.category}|${a.currency}|${a.amount}|${a.valueBasis}|${a.ownershipPercent}`))
  const liabilityKeys = new Set(current.liabilities.map((l) => `${key(l.name)}|${l.currency}|${l.amount}`))
  const dupes = new Set<string>()
  for (const a of c.assets) {
    if (assetKeys.has(`${key(a.name)}|${a.category}|${a.currency}|${a.amount}|${a.valueBasis}|${a.ownershipPercent}`)) dupes.add(a.id)
  }
  for (const l of c.liabilities) {
    if (liabilityKeys.has(`${key(l.name)}|${l.currency}|${l.amount}`)) dupes.add(l.id)
  }
  return dupes
}

/** Items to append in "add" mode. */
export function itemsToAdd(c: ImportCandidate, skip: Set<string>) {
  return {
    assets: c.assets.filter((a) => !skip.has(a.id)),
    liabilities: c.liabilities.filter((l) => !skip.has(l.id)),
    snapshots: c.snapshots,
  }
}

/**
 * Workspace resulting from "replace" mode. A JSON backup replaces everything; a CSV
 * only carries holdings, so history (snapshots) and settings are kept.
 */
export function replacementWorkspace(current: Workspace, c: ImportCandidate): Workspace {
  if (c.format === 'json') {
    return {
      assets: c.assets,
      liabilities: c.liabilities,
      snapshots: c.snapshots,
      settings: c.settings ?? current.settings,
    }
  }
  return { assets: c.assets, liabilities: c.liabilities, snapshots: current.snapshots, settings: current.settings }
}

export function serializeBackup(ws: Workspace, now = new Date()): string {
  return `${JSON.stringify(toDocument(ws, 'backup', now), null, 2)}\n`
}

export function downloadText(filename: string, content: string, mime: string) {
  downloadBlob(new Blob([content], { type: mime }), filename)
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function fileStamp(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}
