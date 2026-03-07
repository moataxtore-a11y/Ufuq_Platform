import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translations } from "./translations.js";

const storedLang = (() => {
    try {
        const v = localStorage.getItem("lang");
        return v === "ar" || v === "en" ? v : null;
    } catch {
        return null;
    }
})();

const desiredLang = storedLang || "ar";

const enRoot = translations && translations.en ? translations.en : {}
const arRoot = translations && translations.ar ? translations.ar : {}

const enData = (enRoot && typeof enRoot === 'object' && enRoot.en && typeof enRoot.en === 'object') ? enRoot.en : enRoot
const arData = (enRoot && typeof enRoot === 'object' && enRoot.ar && typeof enRoot.ar === 'object') ? enRoot.ar : arRoot

const resources = {
    en: { translation: enData || {} },
    ar: { translation: arData || {} }
}

i18n.use(initReactI18next).init({
    resources,
    lng: desiredLang,
    fallbackLng: "en",
    supportedLngs: ["en", "ar"],
    ns: ["translation"],
    defaultNS: "translation",
    debug: false,
    logger: {
        log: (...args) => {
            const first = args && args.length ? String(args[0] == null ? '' : args[0]) : ''
            if (first.includes('i18next is maintained with support from Locize')) return
                // eslint-disable-next-line no-console
            console.log(...args)
        },
        warn: (...args) => {
            const first = args && args.length ? String(args[0] == null ? '' : args[0]) : ''
            if (first.includes('i18next is maintained with support from Locize')) return
                // eslint-disable-next-line no-console
            console.warn(...args)
        },
        error: (...args) => {
            // eslint-disable-next-line no-console
            console.error(...args)
        }
    },
    initImmediate: false,
    returnNull: false,
    returnEmptyString: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false }
});

try {
    if (i18n.language !== desiredLang) i18n.changeLanguage(desiredLang);
} catch {
    // ignore
}

try {
    if (!storedLang) localStorage.setItem("lang", desiredLang);
} catch {
    // ignore
}

try {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
} catch {
    // ignore
}

export function switchLanguage(nextLang) {
    const lang = nextLang === "ar" ? "ar" : "en";
    try {
        i18n.changeLanguage(lang);
    } catch {
        // ignore
    }
}

// تحديث الاتجاه واللغة عند التغيير
i18n.on("languageChanged", (lng) => {
    try {
        document.documentElement.lang = lng;
        document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
        localStorage.setItem("lang", lng);
    } catch {
        // ignore
    }
});

if (
    import.meta.env &&
    import.meta.env.DEV) {
    try {
        window.__i18n = i18n;
        window._i18n = i18n;
    } catch {
        // ignore
    }
}

export default i18n;