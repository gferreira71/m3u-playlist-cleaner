import { createI18n } from 'vue-i18n';
import enLocale from './../locales/en.json';
import frLocale from './../locales/fr.json';
import ptLocale from './../locales/pt.json';

const messages = {
    en: enLocale,
    fr: frLocale,
    pt: ptLocale
};

export const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages
});