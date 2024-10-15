import { ToastContainer } from "react-toastify";
import Index from "./router/Router";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import GlobalTimer from "./layout/GlobalTimer";

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language === "en") {
      document.title = "Digital Exams";
    } else if (i18n.language === "ar") {
      document.title = "الاختبارات الرقمية";
    }
  }, [i18n.language]);

  return (
    <>
      <Index />
      <GlobalTimer />
      <ToastContainer
        position={i18n.language === "ar" ? "bottom-left" : "bottom-right"}
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={i18n.language === "ar"}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName={`Toastify__toast--custom ${
          i18n.language === "ar" ? "toast-text-rtl" : "toast-text-ltr"
        }`}
      />
    </>
  );
}

export default App;
