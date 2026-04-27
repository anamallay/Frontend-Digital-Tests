import { useTranslation } from "react-i18next";

const CopyRight = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <footer
      dir={isRTL ? "rtl" : "ltr"}
      className="border-t border-border bg-surface"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground">
          © 2024 {t("Footer.copyright")}
        </p>
      </div>
    </footer>
  );
};

export default CopyRight;