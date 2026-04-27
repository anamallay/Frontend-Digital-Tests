import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, X, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizLink: string | null;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  quizLink,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [isCopied, setIsCopied] = useState(false);

  // Reset "copied" flag whenever the modal opens or closes
  useEffect(() => {
    if (!isOpen) setIsCopied(false);
  }, [isOpen]);

  // Auto-reset the copied feedback after 2s so users can re-copy
  useEffect(() => {
    if (!isCopied) return;
    const timeout = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [isCopied]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleCopyLink = async () => {
    if (!quizLink) return;
    try {
      await navigator.clipboard.writeText(quizLink);
      setIsCopied(true);
    } catch {
      // Clipboard API can fail on non-HTTPS origins or if the user denies
      // permission. Unlike Redux errors, nothing else surfaces this — so
      // tell the user explicitly.
      toast.error(t("Modals.ShareLinkModal.copyFailed"));
    }
  };

  const content = (
    <AnimatePresence>
      {isOpen && quizLink && (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-link-title"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Share2 className="h-4 w-4 text-primary" />
                </div>
                <h2
                  id="share-link-title"
                  className="text-lg font-semibold tracking-tight text-foreground"
                >
                  {t("Modals.ShareLinkModal.title")}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={t("Common.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pb-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("Modals.ShareLinkModal.description")}
              </p>

              {/* Link field with inline copy */}
              <TooltipProvider delayDuration={200}>
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-1.5 transition-colors focus-within:border-primary/40">
                  <a
                    href={quizLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 flex-1 items-center gap-2 truncate px-2 py-1.5 text-sm text-foreground hover:text-primary"
                    title={quizLink}
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate font-mono text-xs sm:text-sm">
                      {quizLink}
                    </span>
                  </a>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={`flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${
                          isCopied
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            {t("Modals.ShareLinkModal.copiedButton")}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            {t("Modals.ShareLinkModal.copyButton")}
                          </>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {isCopied
                        ? t("Modals.ShareLinkModal.copiedButton")
                        : t("Modals.ShareLinkModal.copyButton")}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-border bg-muted/30 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="min-w-[96px]"
              >
                {t("Modals.ShareLinkModal.closeButton")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return ReactDOM.createPortal(content, document.body);
};

export default ShareLinkModal;