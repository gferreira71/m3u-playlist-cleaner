import { createI18n } from "vue-i18n";
import enLocale from "./../locales/en.json";
import frLocale from "./../locales/fr.json";

const messages = {
  en: enLocale,
  fr: frLocale,
};

export const i18n = createI18n({
  allowComposition: true,
  locale: localStorage.getItem("lang") || "en",
  fallbackLocale: "en",
  messages,
});
