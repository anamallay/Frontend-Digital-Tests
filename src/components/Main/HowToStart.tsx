import { useTranslation } from "react-i18next";
import SectionTitle from "../../layout/SectionTitle";
import oneIcon from "../../assets/Icons/one.png";
import twoIcon from "../../assets/Icons/two.png";
import threeIcon from "../../assets/Icons/three.png";
import fileOneIcon from "../../assets/Icons/file (1).png";
import fileTwoIcon from "../../assets/Icons/file (3).png";
import fileThreeIcon from "../../assets/Icons/file (2).png";
import i18n from "../../utils/i18n";

const HowToStart = () => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";

  const steps = [
    {
      title: t("HowToStart.step1Title"),
      description: t("HowToStart.step1Description"),
      icon: (
        <img
          src={fileOneIcon}
          alt={t("HowToStart.step1Alt")}
          className="w-12 h-12 mx-auto mb-4"
        />
      ),
      numberIcon: oneIcon,
    },
    {
      title: t("HowToStart.step2Title"),
      description: t("HowToStart.step2Description"),
      icon: (
        <img
          src={fileTwoIcon}
          alt={t("HowToStart.step2Alt")}
          className="w-12 h-12 mx-auto mb-4"
        />
      ),
      numberIcon: twoIcon,
    },
    {
      title: t("HowToStart.step3Title"),
      description: t("HowToStart.step3Description"),
      icon: (
        <img
          src={fileThreeIcon}
          alt={t("HowToStart.step3Alt")}
          className="w-12 h-12 mx-auto mb-4"
        />
      ),
      numberIcon: threeIcon,
    },
  ];

  return (
    <div
      className="w-[90%] mx-auto py-10 sm:py-16 lg:py-24 text-secondary"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <SectionTitle title={t("HowToStart.title")} />

      {/* Flex container for steps */}
      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-12">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative w-[90%] sm:w-72 md:w-1/3 bg-backgroundInner rounded-lg p-4 text-center border border-primaryLighter shadow-md cursor-pointer"
          >
            {/* Number Icon on Top Left */}
            <img
              src={step.numberIcon}
              alt={t(`HowToStart.step${index + 1}NumberAlt`)}
              className="absolute top-2 right-2 w-8 h-8"
            />
            {/* Main Step Icon */}
            {step.icon}
            <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2">
              {step.title}
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-yellow-100">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowToStart;
