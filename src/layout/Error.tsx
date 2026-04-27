import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

const Error = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16"
    >
      {/* Soft primary glow — same technique as Hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
      />

      {/* Subtle grid pattern fading out */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 65%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 65%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 mx-auto max-w-xl text-center"
      >
        {/* Compass eyebrow badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <Compass className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span>{t("Error.page_not_found")}</span>
        </div>

        {/* Large 404 typography */}
        <h1 className="text-[96px] font-semibold leading-none tracking-tighter text-foreground sm:text-[140px]">
          <span className="bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent">
            404
          </span>
        </h1>

        {/* Title + description */}
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("Error.page_not_found")}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          {t("Error.description")}
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
          <Button asChild size="lg" className="h-11 px-6">
            <Link to="/">
              {t("Error.back_to_home")}
              <ArrowRight
                className={`h-4 w-4 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`}
                aria-hidden="true"
              />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate(-1)}
            className="h-11 px-6"
          >
            <ArrowLeft
              className={`h-4 w-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`}
              aria-hidden="true"
            />
            {t("Error.go_back")}
          </Button>
        </div>
      </motion.div>
    </section>
  );
};

export default Error;