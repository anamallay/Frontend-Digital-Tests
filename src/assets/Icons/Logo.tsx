// src/assets/Icons/Logo.tsx
import { useId } from "react";

type LogoSize = "sm" | "md" | "lg" | "xl";
type LogoVariant = "default" | "mono";

interface LogoProps {
  /** Visual size preset. Defaults to "md" (36px). */
  size?: LogoSize;
  /** Color variant. "default" uses indigo gradient; "mono" uses currentColor. */
  variant?: LogoVariant;
  /**
   * Show a wordmark next to the icon.
   * Pass `true` for the default "Digital Exams", or a string for a translated version.
   */
  wordmark?: string | boolean;
  /** Override class for the container (use for extra spacing, cursor, etc.). */
  className?: string;
}

const SIZE_MAP: Record<LogoSize, { icon: string; text: string }> = {
  sm: { icon: "h-7 w-7", text: "text-sm" },
  md: { icon: "h-9 w-9", text: "text-base" },
  lg: { icon: "h-12 w-12", text: "text-lg" },
  xl: { icon: "h-16 w-16", text: "text-xl" },
};

/**
 * Digital Exams brand mark.
 *
 * @example
 *   <Logo />                                     // 36px indigo icon, no wordmark
 *   <Logo size="lg" wordmark />                  // Default English wordmark
 *   <Logo wordmark={t("Header.digital_exams")} /> // i18n-translated wordmark
 *   <Logo variant="mono" />                      // Monochrome (inherits text color)
 */
const Logo = ({
  size = "md",
  variant = "default",
  wordmark = false,
  className = "",
}: LogoProps) => {
  const gradId = useId();
  const { icon: iconSize, text: textSize } = SIZE_MAP[size];
  const isMono = variant === "mono";

  const wordmarkText =
    wordmark === true
      ? "Digital Exams"
      : typeof wordmark === "string"
      ? wordmark
      : null;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={iconSize}
        aria-hidden="true"
      >
        {!isMono && (
          <defs>
            <linearGradient
              id={gradId}
              x1="0"
              y1="0"
              x2="64"
              y2="64"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
          </defs>
        )}

        {/* Back card */}
        <rect
          x="18"
          y="10"
          width="30"
          height="38"
          rx="8"
          fill={isMono ? "currentColor" : "#E0E7FF"}
          opacity={isMono ? "0.25" : "1"}
        />
        {/* Middle card */}
        <rect
          x="14"
          y="14"
          width="30"
          height="38"
          rx="8"
          fill={isMono ? "currentColor" : "#C7D2FE"}
          opacity={isMono ? "0.5" : "1"}
        />
        {/* Front card */}
        <rect
          x="10"
          y="18"
          width="30"
          height="38"
          rx="8"
          fill={isMono ? "currentColor" : `url(#${gradId})`}
        />
        {/* Content lines */}
        <rect
          x="16"
          y="26"
          width="18"
          height="3"
          rx="1.5"
          fill="white"
          opacity={isMono ? "0.75" : "0.9"}
        />
        <rect
          x="16"
          y="32"
          width="14"
          height="3"
          rx="1.5"
          fill="white"
          opacity={isMono ? "0.65" : "0.8"}
        />
        <rect
          x="16"
          y="38"
          width="10"
          height="3"
          rx="1.5"
          fill="white"
          opacity={isMono ? "0.55" : "0.7"}
        />
        {/* Question indicator dot */}
        <circle
          cx="16"
          cy="46"
          r="2"
          fill="white"
          opacity={isMono ? "0.75" : "0.9"}
        />
      </svg>

      {wordmarkText && (
        <span
          className={`font-semibold tracking-tight text-foreground ${textSize}`}
        >
          {wordmarkText}
        </span>
      )}
    </span>
  );
};

export default Logo;