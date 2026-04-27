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

// Set <html lang> and <html dir> before React mounts so the very first
// paint already has the correct direction and language. React's
// useEffect in App.tsx takes over from here for subsequent language
// changes during the session — together the two keep the attributes
// in sync without any flash of wrong direction on cold loads.
//
// This runs at module load, which happens synchronously in main.tsx
// before ReactDOM.createRoot(...).render(...) — so the attributes are
// set before the first browser paint.
if (typeof document !== "undefined") {
  const lang = savedLanguage === "ar" ? "ar" : "en";
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

export default i18next;