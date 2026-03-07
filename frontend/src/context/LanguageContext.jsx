import * as React from 'react'
import i18n from '../i18n/i18n.js'

const LanguageContext = React.createContext(null)

function getInitialLang() {
  if (typeof document === 'undefined') return 'ar'

  try {
    const stored = localStorage.getItem('lang')
    if (stored === 'ar' || stored === 'en') return stored
  } catch {
    // ignore
  }

  return 'ar'
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = React.useState(() => {
    const current = i18n.language
    if (current === 'ar' || current === 'en') return current
    return getInitialLang()
  })

  React.useEffect(() => {
    const onChanged = (lng) => {
      if (lng === 'ar' || lng === 'en') setLangState(lng)
    }

    i18n.on('languageChanged', onChanged)
    return () => {
      i18n.off('languageChanged', onChanged)
    }
  }, [])

  const setLang = React.useCallback((next) => {
    const value = next === 'ar' ? 'ar' : 'en'
    setLangState(value)
    try {
      localStorage.setItem('lang', value)
    } catch {
      // ignore
    }

    try {
      i18n.changeLanguage(value)
    } catch {
      // ignore
    }
  }, [])

  const isRtl = lang === 'ar'

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = lang
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
  }, [lang, isRtl])

  const t = React.useCallback((key, options) => i18n.t(key, options), [])

  const toggleLang = React.useCallback(() => {
    const next = lang === 'ar' ? 'en' : 'ar'
    setLang(next)
  }, [lang, setLang])

  return <LanguageContext.Provider value={{ lang, isRtl, setLang, toggleLang, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
