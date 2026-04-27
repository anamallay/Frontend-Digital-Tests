import { ToastContainer } from "react-toastify";
import Index from "./router/Router";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import GlobalTimer from "./layout/GlobalTimer";
import ErrorBoundary from "./layout/ErrorBoundary";
import type { AppDispatch, RootState } from "./reducer/store/store";
import {
  getUserData,
  clearAuth,
  setHydrated,
} from "./reducer/action/usersSlice";

function App() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const isHydrating = useSelector((s: RootState) => s.users.isHydrating);

  // Keep <html lang>, <html dir>, and <title> in sync with the active locale.
  // `document.documentElement` is the <html> element — screen readers,
  // search engines, and :lang(...) CSS selectors all read these attributes.
  // Setting them here (rather than only in Header's language switcher) means
  // they're correct on first paint, not just after the user manually
  // changes language.
  useEffect(() => {
    const lang = i18n.language === "ar" ? "ar" : "en";
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t("App.title");
  }, [i18n.language, t]);

  // Boot-time auth hydration. If localStorage hinted that we're logged in,
  // verify it against the backend by refetching user data. On success the
  // `userData` slice fills and `isHydrating` flips false. On failure the
  // session is cleared so ProtectedRoute routes to /login.
  useEffect(() => {
    if (!isHydrating) return;
    dispatch(getUserData()).then((action) => {
      if (getUserData.rejected.match(action)) {
        // Session expired / cookie missing / backend down — drop the stale
        // flag. If it was transient, the user re-logs in; no harm done.
        dispatch(clearAuth());
      } else {
        dispatch(setHydrated());
      }
    });
    // Intentionally runs exactly once on mount. `isHydrating` is only ever
    // flipped false by this effect or by clearAuth, so the guard above is
    // sufficient to prevent re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;