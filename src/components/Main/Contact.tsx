import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Mail, ArrowUpRight } from "lucide-react";
import SectionTitle from "../../layout/SectionTitle";
import { Button } from "@/components/ui/button";

const CONTACT_EMAIL = "info@digitaltests.org";

const Contact = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto w-[92%] max-w-4xl px-4 py-20 sm:py-28"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-border bg-surface p-10 text-center sm:p-16"
      >
        <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background">
            <Mail className="h-5 w-5 text-primary" />
          </div>

          <SectionTitle title={t("Contact.title")} />

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("Contact.description")}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="h-11">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("Contact.buttonText")}
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </Button>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Contact;