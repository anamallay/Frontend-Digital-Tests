import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { RootState } from "../../reducer/store/store";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const isLoggedIn = useSelector((s: RootState) => s.users.isLoggedIn);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative mx-auto mt-8 w-[92%] max-w-6xl overflow-hidden rounded-3xl border border-border bg-surface"
    >
      {/* 1. Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-10"
      >
        <source src="/video/hero-video.mp4" type="video/mp4" />
      </video>

      {/* 2. Subtle grid pattern (now behind the gradient) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      {/* 3. Gradient overlay for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

      {/* 4. Soft primary glow */}
      <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      {/* 5. Content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 mx-auto max-w-3xl px-6 py-16 text-center sm:py-20 lg:py-24"
      >
        {/* Eyebrow badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span className="tracking-wide">{t("Hero.goal")}</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
          {t("Hero.mainTitle")}
        </h1>

        {/* Description */}
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("Hero.description")}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
          <Button asChild size="lg" className="h-11 px-6">
            <Link to="/public">
              {t("Hero.browseButton")}
              <ArrowRight
                className={`h-4 w-4 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`}
                aria-hidden="true"
              />
            </Link>
          </Button>

          {!isLoggedIn && (
            <Button asChild variant="ghost" size="lg" className="h-11 px-6">
              <Link to="/login">
                <span className="text-muted-foreground">
                  {t("Hero.alreadyRegistered")}
                </span>
                <span
                  className={`font-semibold text-primary ${
                    isRTL ? "mr-1.5" : "ml-1.5"
                  }`}
                >
                  {t("Hero.login")}
                </span>
              </Link>
            </Button>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;