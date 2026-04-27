import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, HelpCircle, Clock } from "lucide-react";

import { QuizType } from "../../../types/QuizType";
import { Button } from "@/components/ui/button";

interface QuizStartModalProps {
  quiz: QuizType | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const QuizStartModal: React.FC<QuizStartModalProps> = ({
  quiz,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

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

  const handleStartQuiz = () => {
    if (!quiz) return;
    onConfirm();
    navigate(`/dashboard/library/${quiz._id}`);
  };

  const content = (
    <AnimatePresence>
      {isOpen && quiz && (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quiz-start-title"
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
                  <Play
                    className={`h-4 w-4 text-primary ${
                      isRTL ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <h2
                  id="quiz-start-title"
                  className="text-lg font-semibold leading-tight tracking-tight text-foreground"
                >
                  {t("Modals.QuizStartModal.startQuizTitle", {
                    quizTitle: quiz.title,
                  })}
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
                {t("Modals.QuizStartModal.confirmationMessage")}
              </p>

              {/* Stats preview */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{quiz.questions?.length ?? 0}</span>
                  <span className="text-muted-foreground">
                    {t("Quiz.question")}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{quiz.time}</span>
                  <span className="text-muted-foreground">
                    {t("Quiz.minutes")}
                  </span>
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="min-w-[96px]"
              >
                {t("Modals.QuizStartModal.cancelButton")}
              </Button>
              <Button
                type="button"
                onClick={handleStartQuiz}
                className="min-w-[120px]"
              >
                <Play
                  className={`h-4 w-4 ${
                    isRTL ? "ml-2 rotate-180" : "mr-2"
                  }`}
                />
                {t("Modals.QuizStartModal.confirmButton")}
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

export default QuizStartModal;