import { describe, expect, it } from 'vitest'
import { exportCsv, guardFormula, importCsv, mapHeaders, parseCsv, type CsvOptions } from './csv'
import { summarize } from '@/domain/calc'
import { acceptanceWorkspace, asset, fixedNow, sequentialIds, workspace } from '@/test/fixtures'

const opts = (o: Partial<CsvOptions> = {}): CsvOptions => ({
  defaultCurrency: 'EUR',
  decimalHint: ',',
  dateOrder: 'dmy',
  now: fixedNow,
  newId: sequentialIds('csv'),
  ...o,
})

describe('parseCsv', () => {
  it('handles quotes, escaped quotes, multiline notes and CRLF', () => {
    const text = 'Name,Notes\r\n"Casa, mare","riga 1\r\nriga ""2"""\r\nAuto,semplice\r\n'
    const r = parseCsv(text)
    if (!r.ok) throw new Error('parse failed')
    expect(r.records.map((x) => x.cells)).toEqual([
      ['Name', 'Notes'],
      ['Casa, mare', 'riga 1\nriga "2"'],
      ['Auto', 'semplice'],
    ])
    expect(r.records.map((x) => x.line)).toEqual([1, 2, 4])
  })

  it('detects semicolon and tab delimiters', () => {
    expect(parseCsv('a;b\n1;2').ok && parseCsv('a;b\n1;2')).toMatchObject({ delimiter: ';' })
    expect(parseCsv('a\tb\n1\t2')).toMatchObject({ delimiter: '\t' })
  })

  it('reports an unterminated quote with its line', () => {
    expect(parseCsv('Name,Notes\nCasa,"aperta\nmai chiusa')).toEqual({ ok: false, error: 'unterminatedQuote', line: 2 })
  })
})

describe('mapHeaders', () => {
  it('maps v1 export and v1 Italian template headers without hardcoded names', () => {
    expect([...mapHeaders(['Name', 'Ownership', 'Value', 'Source', 'Notes', 'Category', 'Currency']).columns.keys()]).toEqual([
      'name',
      'legacyOwnership',
      'amount',
      'source',
      'notes',
      'category',
      'currency',
    ])
    const it = mapHeaders(['Asset / Società', 'Quota Mario Rossi', 'Valore (€)', 'Fonte / Base di stima', 'Note / Compensi', 'Categoria'])
    expect(Object.fromEntries(it.columns)).toEqual({ name: 0, legacyOwnership: 1, amount: 2, source: 3, notes: 4, category: 5 })
  })
})

describe('importCsv', () => {
  it('imports Italian semicolon files with decimal commas and whole/percent values', () => {
    const text = [
      'Tipo;Nome;Categoria;Valuta;Importo;Base valore;% posseduta;Data valutazione;Bene collegato;Note',
      'attività;Casa;Immobili;EUR;300.000,00;intero;50;01/03/2026;;"Perizia\nbanca"',
      'debito;Mutuo;;EUR;80.000;;;01/03/2026;Casa;',
      'attività;Conto;Liquidità;EUR;20.000,50;;;;;',
    ].join('\n')
    const r = importCsv(text, opts())
    if (!r.ok) throw new Error(r.error)
    expect(r.issues).toEqual([])
    expect(r.assets[0]).toMatchObject({
      name: 'Casa',
      category: 'realestate',
      amount: 300000,
      valueBasis: 'whole',
      ownershipPercent: 50,
      valuationDate: '2026-03-01',
      notes: 'Perizia\nbanca',
    })
    expect(r.assets[1]).toMatchObject({ amount: 20000.5, valueBasis: 'share', valuationDate: '2026-03-15' })
    expect(r.liabilities[0]).toMatchObject({ name: 'Mutuo', amount: 80000, linkedAssetId: r.assets[0]!.id })
  })

  it('imports a v1 export: values are already personal, ownership text kept', () => {
    const text = 'Name,Ownership,Value,Source,Notes,Category,Currency\n"Tesla, Inc",2.5%,75000,"Portfolio, Dec",growth,shareholdings,USD\n'
    const r = importCsv(text, opts({ decimalHint: '.' }))
    if (!r.ok) throw new Error(r.error)
    expect(r.assets[0]).toMatchObject({
      name: 'Tesla, Inc',
      category: 'business',
      currency: 'USD',
      amount: 75000,
      valueBasis: 'share',
      legacyOwnership: '2.5%',
      source: 'Portfolio, Dec',
    })
  })

  it('reports every invalid row with its line and never turns bad numbers into zero', () => {
    const text = [
      'Name,Category,Amount,Currency,Ownership %,Value basis',
      ',cash,10,EUR,,', // line 2: no name
      'Conto,cash,dieci,EUR,,', // line 3: bad amount
      'Quadro,arte,100,EUR,,', // line 4: unknown category
      'Auto,personal,100,GBP,,', // line 5: unsupported currency
      'Casa,realestate,100,EUR,150,whole', // line 6: bad percent
      'Ok,cash,5,EUR,,', // line 7: fine
    ].join('\n')
    const r = importCsv(text, opts())
    if (!r.ok) throw new Error(r.error)
    expect(r.rowsTotal).toBe(6)
    expect(r.assets.map((a) => a.name)).toEqual(['Ok'])
    expect(r.issues.map((i) => [i.line, i.field])).toEqual([
      [2, 'name'],
      [3, 'amount'],
      [4, 'category'],
      [5, 'currency'],
      [6, 'percent'],
    ])
  })

  it('fails clearly when required columns are missing or the file is empty', () => {
    expect(importCsv('Foo,Bar\n1,2', opts())).toEqual({ ok: false, error: 'missingColumns', missing: ['name', 'amount'] })
    expect(importCsv('Name,Amount\n', opts())).toEqual({ ok: false, error: 'empty' })
  })

  it('infers the decimal separator from the whole column', () => {
    const text = 'Name,Category,Amount\nA,cash,"1,234"\nB,cash,"2,5"'
    const r = importCsv(text, opts({ decimalHint: '.' }))
    if (!r.ok) throw new Error(r.error)
    expect(r.assets.map((a) => a.amount)).toEqual([1.23, 2.5])
  })
})

describe('exportCsv', () => {
  it('guards text that a spreadsheet would run as a formula', () => {
    expect(guardFormula('=HYPERLINK("x")')).toBe('\'=HYPERLINK("x")')
    expect(guardFormula('+39 333')).toBe("'+39 333")
    expect(guardFormula('@cmd')).toBe("'@cmd")
    expect(guardFormula('Casa')).toBe('Casa')
    const csv = exportCsv([asset({ name: '=1+1', amount: 10, notes: '-2' })], [])
    expect(csv).toContain(`"'=1+1"`)
    expect(csv).toContain(`"'-2"`)
  })

  it('round-trips assets and liabilities with the same totals', () => {
    const ws = acceptanceWorkspace()
    ws.assets.push(asset({ name: 'Note "lunghe"', category: 'investments', amount: 1234.56, currency: 'USD', notes: 'a\nb, c' }))
    ws.settings = { displayCurrency: 'EUR', eurUsdRate: 1.1, eurUsdRateDate: null }
    const csv = exportCsv(ws.assets, ws.liabilities)
    const r = importCsv(csv, opts({ decimalHint: ',' }))
    if (!r.ok) throw new Error(r.error)
    expect(r.issues).toEqual([])
    const back = workspace({ assets: r.assets, liabilities: r.liabilities, settings: ws.settings })
    expect(summarize(back).totals).toEqual(summarize(ws).totals)
    expect(r.assets[2]).toMatchObject({ name: 'Note "lunghe"', notes: 'a\nb, c', currency: 'USD', amount: 1234.56 })
    expect(r.liabilities[0]?.linkedAssetId).toBe(r.assets[0]?.id)
  })

  it('strips the formula guard when re-importing', () => {
    const r = importCsv(exportCsv([asset({ name: '=1+1', amount: 1 })], []), opts())
    expect(r.ok && r.assets[0]?.name).toBe('=1+1')
  })
})
