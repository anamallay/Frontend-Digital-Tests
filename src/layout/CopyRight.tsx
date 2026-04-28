import { useTranslation } from "react-i18next";
// import { Heart } from "lucide-react";

const CopyRight = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const currentYear = new Date().getFullYear();

  return (
    <footer
      dir={isRTL ? "rtl" : "ltr"}
      className="border-t border-border bg-surface"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {t("Footer.copyright")}
          </p>

          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{t("Footer.madeWith")}</span>
            {/* <Heart
              className="h-4 w-4 fill-blue-500 text-blue-500 animate-pulse"
              aria-hidden="true"
            /> */}
            <span>{t("Footer.by")}</span>
            <span className="font-medium text-foreground">
              {t("Footer.creatorName")}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default CopyRight;