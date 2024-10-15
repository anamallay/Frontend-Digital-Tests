import { Link } from "react-router-dom";
import Page404 from "../assets/Icons/404-error.png";
import { useTranslation } from "react-i18next";

const Error = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ height: "calc(100vh - 150px)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="p-6 sm:p-8 text-center">
        <img
          src={Page404}
          alt="404 Error"
          className="mt-6 w-64 sm:w-80 lg:w-96 h-auto object-cover"
        />
        <p className="text-xl sm:text-2xl font-semibold mt-4 text-secondary">
          {t("Error.page_not_found")}
        </p>
        <p className="text-sm sm:text-base text-secondaryDarker mt-2">
          {t("Error.description")}
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 text-sm sm:text-lg font-semibold rounded-lg transition duration-300 text-secondary bg-primary hover:bg-primaryLighter"
        >
          {t("Error.back_to_home")}
        </Link>
      </div>
    </div>
  );
};

export default Error;
