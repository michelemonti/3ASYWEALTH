import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import it from './locales/it.json'
import es from './locales/es.json'

export const LANGUAGES = [
  { code: 'it', label: 'Italiano', locale: 'it-IT' },
  { code: 'en', label: 'English', locale: 'en-US' },
  { code: 'es', label: 'Español', locale: 'es-ES' },
] as const
export type LanguageCode = (typeof LANGUAGES)[number]['code']

const STORAGE_KEY = 'language'

export function localeFor(lang: string): string {
  return LANGUAGES.find((l) => l.code === lang)?.locale ?? 'en-US'
}

function initialLanguage(): LanguageCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (LANGUAGES.some((l) => l.code === stored)) return stored as LanguageCode
  } catch {
    /* storage may be unavailable */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : []
  for (const tag of nav) {
    const code = tag.slice(0, 2).toLowerCase()
    if (LANGUAGES.some((l) => l.code === code)) return code as LanguageCode
  }
  return 'en'
}

export function setLanguage(code: LanguageCode) {
  void i18n.changeLanguage(code)
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    /* ignore */
  }
}

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') document.documentElement.lang = lng
})

void i18n.use(initReactI18next).init({
  resources: { it: { translation: it }, en: { translation: en }, es: { translation: es } },
  lng: initialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
})

if (typeof document !== 'undefined') document.documentElement.lang = i18n.language

export default i18n
