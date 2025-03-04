import { LangEnum } from "@/App.vue";

const LANG_KEY = "lang";

// Get the current lang from localStorage
function getLang(): LangEnum {
  const storedLang = localStorage.getItem(LANG_KEY);
  return storedLang ? (storedLang as LangEnum) : LangEnum.EN;
}

// Set the current lang in localStorage
function setLang(lang: LangEnum) {
  localStorage.setItem(LANG_KEY, lang);
}

export default { getLang, setLang };
