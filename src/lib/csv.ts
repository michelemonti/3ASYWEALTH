/**
 * CSV import/export for tabular data (assets and liabilities).
 *
 * Import: RFC 4180-style parser (quoted fields, escaped quotes, multiline notes,
 * CRLF/LF), delimiter detection (, ; tab), header mapping in EN/IT/ES plus the v1
 * headers, per-row validation. Nothing is dropped silently: every skipped row is
 * reported with its line number and reason.
 *
 * Export: UTF-8 with BOM, comma separated, dot decimals, and text cells that a
 * spreadsheet would interpret as a formula are prefixed with an apostrophe.
 */

import {
  type Asset,
  type AssetCategory,
  type Currency,
  type Liability,
  type ValueBasis,
} from '@/domain/types'
import { parseCategoryAlias } from '@/domain/validate'
import { isISODate, parseDecimal, roundCents, todayISODate, type DecimalSeparator } from '@/domain/numbers'

// ---------------------------------------------------------------------------
// Low-level parsing
// ---------------------------------------------------------------------------

export interface CsvRecord {
  line: number
  cells: string[]
}

export type CsvParse = { ok: true; delimiter: string; records: CsvRecord[] } | { ok: false; error: 'unterminatedQuote'; line: number }

export function detectDelimiter(text: string): string {
  const counts: Record<string, number> = { ',': 0, ';': 0, '\t': 0 }
  let inQuotes = false
  for (const ch of text) {
    if (ch === '"') inQuotes = !inQuotes
    else if (!inQuotes && (ch === '\n' || ch === '\r')) break
    else if (!inQuotes && ch in counts) counts[ch]! += 1
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]!
  return best[1] > 0 ? best[0] : ','
}

export function parseCsv(input: string): CsvParse {
  const text = input.replace(/^\uFEFF/, '')
  const delimiter = detectDelimiter(text)
  const records: CsvRecord[] = []
  let cells: string[] = []
  let field = ''
  let inQuotes = false
  let line = 1
  let recordLine = 1
  let quoteLine = 1

  const pushField = () => {
    cells.push(field.replace(/\r\n?/g, '\n'))
    field = ''
  }
  const endRecord = () => {
    pushField()
    if (!(cells.length === 1 && cells[0]!.trim() === '')) records.push({ line: recordLine, cells })
    cells = []
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        if (ch === '\n' || (ch === '\r' && text[i + 1] !== '\n')) line++
        field += ch
      }
      continue
    }
    if (ch === '"' && field.trim() === '') {
      field = ''
      inQuotes = true
      quoteLine = line
    } else if (ch === delimiter) {
      pushField()
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      endRecord()
      line++
      recordLine = line
    } else {
      field += ch
    }
  }
  if (inQuotes) return { ok: false, error: 'unterminatedQuote', line: quoteLine }
  if (field !== '' || cells.length > 0) endRecord()
  return { ok: true, delimiter, records }
}

// ---------------------------------------------------------------------------
// Header mapping
// ---------------------------------------------------------------------------

export type Column =
  | 'type'
  | 'name'
  | 'category'
  | 'currency'
  | 'amount'
  | 'basis'
  | 'percent'
  | 'legacyOwnership'
  | 'date'
  | 'notes'
  | 'source'
  | 'linked'

export function normalizeHeader(h: string): string {
  return h
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^\p{L}\p{N}%]+/gu, ' ')
    .trim()
}

const HEADER_ALIASES: Record<Column, string[]> = {
  type: ['type', 'tipo', 'kind', 'record type'],
  name: ['name', 'nome', 'nombre', 'asset', 'asset societa', 'descrizione', 'description', 'descripcion'],
  category: ['category', 'categoria'],
  currency: ['currency', 'valuta', 'moneda', 'divisa'],
  amount: ['amount', 'value', 'valore', 'importo', 'valor', 'importe', 'monto', 'saldo', 'balance'],
  basis: ['value basis', 'basis', 'base', 'base valore', 'base del valor', 'tipo valore', 'tipo de valor'],
  percent: [
    'ownership %',
    'ownership percent',
    'ownership percentage',
    'percent',
    '%',
    '% posseduta',
    'quota %',
    'percentuale',
    'percentuale posseduta',
    'porcentaje',
    '% propiedad',
    'porcentaje de propiedad',
  ],
  legacyOwnership: ['ownership', 'quota', 'legacy ownership', 'quota legacy', 'propiedad'],
  date: ['valuation date', 'date', 'data', 'data valutazione', 'data della valutazione', 'fecha', 'fecha de valoracion'],
  notes: ['notes', 'note', 'notas', 'note compensi'],
  source: ['source', 'fonte', 'fuente', 'fonte base di stima'],
  linked: ['linked asset', 'bene collegato', 'activo vinculado'],
}

const HEADER_LOOKUP = new Map<string, Column>()
for (const [col, aliases] of Object.entries(HEADER_ALIASES) as Array<[Column, string[]]>) {
  for (const a of aliases) HEADER_LOOKUP.set(normalizeHeader(a), col)
}

export function mapHeaders(headers: string[]): { columns: Map<Column, number>; ignored: string[] } {
  const columns = new Map<Column, number>()
  const ignored: string[] = []
  headers.forEach((h, i) => {
    const n = normalizeHeader(h)
    // v1 templates used "Quota <person name>" for the free-text ownership column.
    const col = HEADER_LOOKUP.get(n) ?? (n.startsWith('quota ') && !n.includes('%') ? 'legacyOwnership' : undefined)
    if (col && !columns.has(col)) columns.set(col, i)
    else if (h.trim()) ignored.push(h.trim())
  })
  return { columns, ignored }
}

// ---------------------------------------------------------------------------
// Row interpretation
// ---------------------------------------------------------------------------

const LIABILITY_WORDS = new Set(
  ['liability', 'liabilities', 'debt', 'debts', 'debito', 'debiti', 'passivita', 'deuda', 'deudas', 'pasivo', 'pasivos'].map(
    normalizeHeader,
  ),
)
const ASSET_WORDS = new Set(['asset', 'assets', 'attivita', 'bene', 'activo', 'activos'].map(normalizeHeader))
const WHOLE_WORDS = new Set(['whole', 'total', 'intero', 'complessivo', 'totale', 'bene intero', 'valor total'].map(normalizeHeader))
const SHARE_WORDS = new Set(['share', 'my share', 'quota', 'mia quota', 'parte', 'mi parte'].map(normalizeHeader))

export type CsvField = Column | 'record'
export interface CsvRowIssue {
  line: number
  field: CsvField
  severity: 'error' | 'warning'
  value?: string
}

export interface CsvImport {
  ok: true
  delimiter: string
  rowsTotal: number
  assets: Asset[]
  liabilities: Liability[]
  issues: CsvRowIssue[]
  ignoredColumns: string[]
}

export type CsvImportResult =
  | CsvImport
  | { ok: false; error: 'empty' | 'missingColumns' | 'unterminatedQuote'; line?: number; missing?: Column[] }

export interface CsvOptions {
  defaultCurrency: Currency
  decimalHint: DecimalSeparator
  /** Day-month-year (it/es) or month-day-year (en-US) for slash dates. */
  dateOrder: 'dmy' | 'mdy'
  now?: Date
  newId?: () => string
}

const unguard = (s: string) => (/^'[=+\-@\t\r]/.test(s) ? s.slice(1) : s)

function parseCurrencyCell(raw: string): Currency | null {
  const s = raw.trim().toUpperCase()
  if (s === 'EUR' || s === '€') return 'EUR'
  if (s === 'USD' || s === '$' || s === 'US$') return 'USD'
  return null
}

function currencyFromAmount(raw: string): Currency | null {
  if (/€|eur/i.test(raw)) return 'EUR'
  if (/\$|usd/i.test(raw)) return 'USD'
  return null
}

export function parseDateCell(raw: string, order: 'dmy' | 'mdy'): string | null {
  const s = raw.trim()
  if (isISODate(s)) return s
  const isoPrefix = /^(\d{4}-\d{2}-\d{2})T/.exec(s)
  if (isoPrefix && isISODate(isoPrefix[1])) return isoPrefix[1]!
  const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(s)
  if (!m) return null
  const [a, b, y] = [m[1]!, m[2]!, m[3]!]
  const [d, mo] = order === 'dmy' ? [a, b] : [b, a]
  const iso = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
  return isISODate(iso) ? iso : null
}

/** Decide the decimal separator for a whole column from unambiguous values. */
export function inferDecimal(values: string[], fallback: DecimalSeparator): DecimalSeparator {
  let comma = 0
  let dot = 0
  for (const raw of values) {
    const v = raw.replace(/[^\d.,]/g, '')
    const lastDot = v.lastIndexOf('.')
    const lastComma = v.lastIndexOf(',')
    if (lastDot >= 0 && lastComma >= 0) {
      if (lastComma > lastDot) comma++
      else dot++
      continue
    }
    const sep = lastDot >= 0 ? '.' : lastComma >= 0 ? ',' : null
    if (!sep) continue
    const parts = v.split(sep)
    if (parts.length === 2 && parts[1]!.length !== 3) {
      if (sep === ',') comma++
      else dot++
    }
  }
  if (comma > dot) return ','
  if (dot > comma) return '.'
  return fallback
}

export function importCsv(text: string, options: CsvOptions): CsvImportResult {
  const parsed = parseCsv(text)
  if (!parsed.ok) return { ok: false, error: 'unterminatedQuote', line: parsed.line }
  const [header, ...rows] = parsed.records
  if (!header || rows.length === 0) return { ok: false, error: 'empty' }

  const { columns, ignored } = mapHeaders(header.cells)
  const missing = (['name', 'amount'] as Column[]).filter((c) => !columns.has(c))
  if (missing.length > 0) return { ok: false, error: 'missingColumns', missing }

  const now = options.now ?? new Date()
  const newId = options.newId ?? (() => crypto.randomUUID())
  const iso = now.toISOString()
  const today = todayISODate(now)
  const cell = (r: CsvRecord, c: Column) => {
    const i = columns.get(c)
    return i === undefined ? '' : (r.cells[i] ?? '').trim()
  }
  const decimal = inferDecimal(
    rows.map((r) => cell(r, 'amount')),
    options.decimalHint,
  )

  const issues: CsvRowIssue[] = []
  const assets: Asset[] = []
  const liabilities: Liability[] = []
  const pendingLinks: Array<{ liability: Liability; assetName: string; line: number }> = []

  for (const row of rows) {
    const error = (field: CsvField, value?: string) => issues.push({ line: row.line, field, severity: 'error', value })
    const name = unguard(cell(row, 'name'))
    if (!name) {
      error('name')
      continue
    }

    const typeRaw = normalizeHeader(cell(row, 'type'))
    const categoryRaw = cell(row, 'category')
    let kind: 'asset' | 'liability' = 'asset'
    if (LIABILITY_WORDS.has(typeRaw) || LIABILITY_WORDS.has(normalizeHeader(categoryRaw))) kind = 'liability'
    else if (typeRaw && !ASSET_WORDS.has(typeRaw)) {
      error('type', cell(row, 'type'))
      continue
    }

    const amountRaw = cell(row, 'amount')
    const amount = amountRaw ? parseDecimal(amountRaw, decimal) : null
    if (amount === null || amount < 0) {
      error('amount', amountRaw)
      continue
    }

    const currencyRaw = cell(row, 'currency')
    let currency: Currency | null = options.defaultCurrency
    if (currencyRaw) currency = parseCurrencyCell(currencyRaw)
    else currency = currencyFromAmount(amountRaw) ?? options.defaultCurrency
    if (!currency) {
      error('currency', currencyRaw)
      continue
    }

    const dateRaw = cell(row, 'date')
    const valuationDate = dateRaw ? parseDateCell(dateRaw, options.dateOrder) : today
    if (!valuationDate) {
      error('date', dateRaw)
      continue
    }
    const notes = unguard(cell(row, 'notes'))

    if (kind === 'liability') {
      const liability: Liability = {
        id: newId(),
        name,
        currency,
        amount: roundCents(amount),
        valuationDate,
        notes,
        createdAt: iso,
        updatedAt: iso,
      }
      const linkName = unguard(cell(row, 'linked'))
      if (linkName) pendingLinks.push({ liability, assetName: linkName, line: row.line })
      liabilities.push(liability)
      continue
    }

    const category: AssetCategory | null = categoryRaw ? parseCategoryAlias(categoryRaw) : null
    if (!category) {
      error('category', categoryRaw)
      continue
    }

    const basisRaw = normalizeHeader(cell(row, 'basis'))
    const percentRaw = cell(row, 'percent').replace(/%$/, '').trim()
    let valueBasis: ValueBasis = 'share'
    if (WHOLE_WORDS.has(basisRaw)) valueBasis = 'whole'
    else if (basisRaw && !SHARE_WORDS.has(basisRaw)) {
      error('basis', cell(row, 'basis'))
      continue
    } else if (!basisRaw && percentRaw) valueBasis = 'whole'

    let ownershipPercent = 100
    if (valueBasis === 'whole') {
      const pct = percentRaw ? parseDecimal(percentRaw, decimal) : null
      if (pct === null || pct <= 0 || pct > 100) {
        error('percent', cell(row, 'percent'))
        continue
      }
      ownershipPercent = pct
    }

    const asset: Asset = {
      id: newId(),
      name,
      category,
      currency,
      amount: roundCents(amount),
      valueBasis,
      ownershipPercent,
      valuationDate,
      notes,
      source: unguard(cell(row, 'source')),
      createdAt: iso,
      updatedAt: iso,
    }
    const legacy = unguard(cell(row, 'legacyOwnership'))
    if (legacy && legacy !== '-') asset.legacyOwnership = legacy
    assets.push(asset)
  }

  for (const { liability, assetName, line } of pendingLinks) {
    const target = assets.find((a) => a.name.toLowerCase() === assetName.toLowerCase())
    if (target) liability.linkedAssetId = target.id
    else issues.push({ line, field: 'linked', severity: 'warning', value: assetName })
  }

  return { ok: true, delimiter: parsed.delimiter, rowsTotal: rows.length, assets, liabilities, issues, ignoredColumns: ignored }
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const CSV_HEADERS = [
  'Type',
  'Name',
  'Category',
  'Currency',
  'Amount',
  'Value basis',
  'Ownership %',
  'Valuation date',
  'Linked asset',
  'Notes',
  'Source',
  'Legacy ownership',
] as const

/** Neutralise spreadsheet formula injection in a text cell. */
export function guardFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
}

const quote = (value: string) => `"${value.replace(/"/g, '""')}"`
const num = (n: number) => String(roundCents(n))

export function exportCsv(assets: Asset[], liabilities: Liability[]): string {
  const byId = new Map(assets.map((a) => [a.id, a.name]))
  const text = (s: string) => quote(guardFormula(s))
  const lines = [CSV_HEADERS.map(quote).join(',')]
  for (const a of assets) {
    lines.push(
      [
        quote('asset'),
        text(a.name),
        quote(a.category),
        quote(a.currency),
        num(a.amount),
        quote(a.valueBasis),
        a.valueBasis === 'whole' ? String(a.ownershipPercent) : '',
        quote(a.valuationDate),
        '',
        text(a.notes),
        text(a.source),
        text(a.legacyOwnership ?? ''),
      ].join(','),
    )
  }
  for (const l of liabilities) {
    lines.push(
      [
        quote('liability'),
        text(l.name),
        '',
        quote(l.currency),
        num(l.amount),
        '',
        '',
        quote(l.valuationDate),
        text(l.linkedAssetId ? (byId.get(l.linkedAssetId) ?? '') : ''),
        text(l.notes),
        '',
        '',
      ].join(','),
    )
  }
  return `\uFEFF${lines.join('\r\n')}\r\n`
}
