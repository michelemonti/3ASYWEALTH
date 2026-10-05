import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import en from './locales/en.json'
import es from './locales/es.json'
import itLocale from './locales/it.json'

type Tree = { [k: string]: string | Tree }
const flatten = (o: Tree, prefix = ''): string[] =>
  Object.entries(o).flatMap(([k, v]) => (typeof v === 'string' ? [`${prefix}${k}`] : flatten(v, `${prefix}${k}.`)))
const PLURAL = /_(one|other|many)$/
const base = (keys: string[]) => new Set(keys.map((k) => k.replace(PLURAL, '')))

const locales = { it: itLocale as Tree, en: en as Tree, es: es as Tree }
const keys = Object.fromEntries(Object.entries(locales).map(([l, tree]) => [l, flatten(tree)])) as Record<keyof typeof locales, string[]>

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) return sourceFiles(full)
    return /\.(ts|tsx)$/.test(name) && !/\.test\.ts$/.test(name) ? [full] : []
  })
}

const NAMESPACES = Object.keys(itLocale).join('|')
const KEY_LITERAL = new RegExp(`['\`]((?:${NAMESPACES})\\.[A-Za-z0-9_.$\\{\\}()':?\\s-]*?)['\`]`, 'g')

describe('locales', () => {
  it('have the same keys in it, en and es', () => {
    const it = [...base(keys.it)].sort()
    expect([...base(keys.en)].sort()).toEqual(it)
    expect([...base(keys.es)].sort()).toEqual(it)
  })

  it('provide every plural form the language needs', () => {
    for (const [lang, list] of Object.entries(keys)) {
      const categories = new Intl.PluralRules(lang).resolvedOptions().pluralCategories
      const plurals = [...new Set(list.filter((k) => PLURAL.test(k)).map((k) => k.replace(PLURAL, '')))]
      for (const p of plurals) for (const c of categories) {
        if (c === 'one' || c === 'other' || c === 'many') expect(list, `${lang}: ${p}_${c}`).toContain(`${p}_${c}`)
      }
    }
  })

  it('contain every key referenced in the source code', () => {
    const srcDir = path.resolve(__dirname, '..')
    const missing: string[] = []
    for (const file of sourceFiles(srcDir)) {
      const text = readFileSync(file, 'utf8')
      for (const match of text.matchAll(KEY_LITERAL)) {
        const key = match[1]!
        if (key.includes('${')) {
          const pattern = new RegExp(`^${key.replace(/\./g, '\\.').replace(/\$\{[^}]+\}/g, '[^.]+')}$`)
          for (const [lang, list] of Object.entries(keys)) {
            if (![...base(list)].some((k) => pattern.test(k))) missing.push(`${lang}: ${key} (${path.basename(file)})`)
          }
        } else {
          for (const [lang, list] of Object.entries(keys)) {
            if (!base(list).has(key)) missing.push(`${lang}: ${key} (${path.basename(file)})`)
          }
        }
      }
    }
    expect(missing).toEqual([])
  })
})
