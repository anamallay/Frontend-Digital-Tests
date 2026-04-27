import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FileText, Share2, BarChart3 } from "lucide-react";
import SectionTitle from "../../layout/SectionTitle";

const HowToStart = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const steps = [
    {
      title: t("HowToStart.step1Title"),
      description: t("HowToStart.step1Description"),
      Icon: FileText,
    },
    {
      title: t("HowToStart.step2Title"),
      description: t("HowToStart.step2Description"),
      Icon: Share2,
    },
    {
      title: t("HowToStart.step3Title"),
      description: t("HowToStart.step3Description"),
      Icon: BarChart3,
    },
  ];

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto w-[92%] max-w-6xl px-4 py-16 sm:py-20 lg:py-24"
    >
      <SectionTitle title={t("HowToStart.title")} />

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
            className="group relative rounded-2xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md sm:p-8"
          >
            {/* Step number badge */}
            <div
              className={`absolute top-5 ${
                isRTL ? "left-5" : "right-5"
              } flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground`}
            >
              {index + 1}
            </div>

            {/* Icon */}
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <step.Icon className="h-6 w-6" aria-hidden="true" />
            </div>

            {/* Title */}
            <h3 className="mb-2 text-lg font-semibold text-foreground sm:text-xl">
              {step.title}
            </h3>

            {/* Description */}
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowToStart;