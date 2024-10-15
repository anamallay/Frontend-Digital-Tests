import translationEN from "../translation/en/global.json";
import translationAR from "../translation/ar/global.json";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

const savedLanguage = localStorage.getItem("language") || "ar";

i18next.use(initReactI18next).init({
  interpolation: { escapeValue: false },
  lng: savedLanguage,
  resources: {
    ar: {
      translation: translationAR,
    },
    en: {
      translation: translationEN,
    },
  },
});

export default i18next;
