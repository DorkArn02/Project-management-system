import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './en/translation.json';
import huTranslation from './hu/translation.json'

i18next.use(initReactI18next).init({
    debug: true,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
        escapeValue: false
    },
    resources: {
        en: {
            translation: enTranslation,
        },
        hu: {
            translation: huTranslation
        }
    },
})

export default i18next