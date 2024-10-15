import { useTranslation } from "react-i18next";
import forbidden from "../assets/Icons/restriction.png";

const Unauthorized = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ height: "calc(100vh - 160px)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center">
        <img
          src={forbidden}
          alt="403 Error"
          className="mt-6 w-64 sm:w-80 lg:w-96 h-auto object-cover"
        />
        <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold text-danger mb-6 font-serif">
          {t("Unauthorized.title")}
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl font-semibold mt-4 mb-4 text-secondary">
          {t("Unauthorized.unauthorized")}
        </p>
        <p className="text-base sm:text-lg lg:text-xl text-secondaryDarker">
          {t("Unauthorized.description")}
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
