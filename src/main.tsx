import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./reducer/store/store";
import "./css/index.css";
import "react-toastify/dist/ReactToastify.css";
import "../src/css/toastifyCustom.css";
import { I18nextProvider } from "react-i18next";
import i18next from "./utils/i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18next}>
        <App />
      </I18nextProvider>
    </Provider>
  </React.StrictMode>
);
