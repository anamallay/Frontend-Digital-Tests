import { useTranslation } from "react-i18next";

const CopyRight = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div
      className="text-center py-2 text-sm sm:text-base text-secondary bg-backgroundInner"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <p>{t("Footer.copyright")} 2024©</p>
    </div>
  );
};

export default CopyRight;
