// src/components/auth/AuthCard.tsx
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const AuthCard = ({ title, subtitle, children, footer }: AuthCardProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="relative w-full min-h-[calc(100vh-4rem)] overflow-hidden"
    >
      {/* Single grid layer — top + bottom effect via linear mask */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          backgroundPosition: "0 0",
          maskImage:
            "linear-gradient(to bottom, black 0%, transparent 30%, transparent 70%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, transparent 30%, transparent 70%, black 100%)",
        }}
      />

      {/* Soft decorative glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-20 h-80 w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
      />

      {/* Centering container */}
      <div className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-12">
        <div
          className="
            relative w-full max-w-md
            animate-in fade-in slide-in-from-bottom-2 duration-400 ease-out
            motion-reduce:animate-none
          "
        >
          {/* Card */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm backdrop-blur-sm sm:p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  {subtitle}
                </p>
              )}
            </div>

            {children}
          </div>

          {footer && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCard;