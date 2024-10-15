import { useTranslation } from "react-i18next";
import SectionTitle from "../../layout/SectionTitle";
import i18n from "../../utils/i18n";

const Contact = () => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <section
      className="w-[90%] mx-auto text-center py-10 sm:py-16 lg:py-24"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <SectionTitle title={t("Contact.title")} />
      <p className="text-gray-200 font-bold text-sm sm:text-base md:text-xl lg:text-2xl max-w-prose mx-auto my-4 w-full sm:w-80 md:w-96 xs:w-72">
        {t("Contact.description")}
      </p>
      <div className="mb-20 sm:mb-24 lg:mb-32">
        <a
          type="button"
          target="_blank"
          href="info@digitaltests.org"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 font-semibold text-black transition-all duration-200 bg-thirdColor rounded-lg hover:bg-thirdColorLighter focus:bg-thirdColorLighter"
        >
          {t("Contact.buttonText")}
        </a>
      </div>
    </section>
  );
};

export default Contact;
