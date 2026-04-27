import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Pen, X, Plus, Minus, Globe, Lock, Save } from "lucide-react";

import { useModal } from "../../../hooks/useModal";
import { AppDispatch } from "../../../reducer/store/store";
import {
  fetchUserQuizzes,
  updateQuiz,
} from "../../../reducer/action/quizzesSlice";
import { QuizType } from "../../../types/QuizType";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditQuizModalProps {
  quiz: QuizType | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedQuiz: QuizType) => void;
}

const EditQuizModal: React.FC<EditQuizModalProps> = ({
  quiz,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();

  const [quizTitle, setQuizTitle] = useState(quiz?.title || "");
  const [quizDescription, setQuizDescription] = useState(
    quiz?.description || ""
  );
  const [quizTime, setQuizTime] = useState<number>(quiz?.time || 10);
  const [quizVisibility, setQuizVisibility] = useState<"public" | "private">(
    (quiz?.visibility as "public" | "private") || "public"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync when a new quiz is supplied
  useEffect(() => {
    if (quiz) {
      setQuizTitle(quiz.title);
      setQuizDescription(quiz.description);
      setQuizTime(quiz.time);
      setQuizVisibility(quiz.visibility as "public" | "private");
      setErrorMessage(null);
    }
  }, [quiz]);

  useModal({ isOpen, onClose, preventClose: () => isSubmitting });

  // Validation
  const titleValid = quizTitle.trim().length > 0;
  const descriptionValid = quizDescription.trim().length > 0;
  const timeValid = Number.isFinite(quizTime) && quizTime >= 1;
  const canSubmit =
    titleValid && descriptionValid && timeValid && !isSubmitting && !!quiz;

  const handleUpdateQuiz = async () => {
    if (!canSubmit || !quiz) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const updatedData = {
      title: quizTitle.trim(),
      description: quizDescription.trim(),
      time: quizTime,
      visibility: quizVisibility,
    };

    try {
      await dispatch(
        updateQuiz({ quizId: quiz._id, updatedData })
      ).unwrap();
      dispatch(fetchUserQuizzes());
      onUpdate({ ...quiz, ...updatedData });
      onClose();
    } catch {
      setErrorMessage(t("Modals.EditQuizModal.errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeChange = (val: string) => {
    const n = parseInt(val, 10);
    setQuizTime(Number.isFinite(n) && n >= 1 ? n : 0);
  };

  const content = (
    <AnimatePresence>
      {isOpen && quiz && (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-quiz-title"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !isSubmitting && onClose()}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Pen className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <h2
                  id="edit-quiz-title"
                  className="text-lg font-semibold tracking-tight text-foreground"
                >
                  {t("Modals.EditQuizModal.title")}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                aria-label={t("Common.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {errorMessage && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="edit-quiz-title-input">
                    {t("Modals.EditQuizModal.quizTitleLabel")}
                  </Label>
                  <Input
                    id="edit-quiz-title-input"
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder={t(
                      "Modals.EditQuizModal.quizTitlePlaceholder"
                    )}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="edit-quiz-description">
                    {t("Modals.EditQuizModal.quizDescriptionLabel")}
                  </Label>
                  <Textarea
                    id="edit-quiz-description"
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    placeholder={t(
                      "Modals.EditQuizModal.quizDescriptionPlaceholder"
                    )}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                {/* Time with stepper */}
                <div className="space-y-2">
                  <Label htmlFor="edit-quiz-time">
                    {t("Modals.EditQuizModal.quizTimeLabel")}
                  </Label>
                  <div className="flex items-center gap-1 rounded-lg border border-border bg-surface px-1.5 py-1.5 transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20">
                    <button
                      type="button"
                      aria-label={t("Modals.CreateQuizModal.decreaseTime")}
                      onClick={() =>
                        setQuizTime((prev) => (prev > 1 ? prev - 1 : 1))
                      }
                      disabled={quizTime <= 1}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      id="edit-quiz-time"
                      type="number"
                      value={Number.isFinite(quizTime) ? quizTime : ""}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      min={1}
                      required
                      className="min-w-0 flex-1 bg-transparent px-2 text-center text-sm font-medium text-foreground outline-none focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      aria-label={t("Modals.CreateQuizModal.increaseTime")}
                      onClick={() =>
                        setQuizTime((prev) => (prev || 0) + 1)
                      }
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("Modals.EditQuizModal.timeInputHint")}
                  </p>
                </div>

                {/* Visibility */}
                <div className="space-y-2">
                  <Label>
                    {t("Modals.EditQuizModal.visibilityLabel")}
                  </Label>
                  <Select
                    value={quizVisibility}
                    onValueChange={(val) =>
                      setQuizVisibility(val as "public" | "private")
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <span>
                            {t("Modals.EditQuizModal.visibilityPublic")}
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <span>
                            {t("Modals.EditQuizModal.visibilityPrivate")}
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Validation hint */}
                {!canSubmit && !isSubmitting && (
                  <p className="text-xs text-muted-foreground">
                    {t("Modals.EditQuizModal.validationHint")}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="min-w-[96px]"
              >
                {t("Modals.EditQuizModal.cancelButton")}
              </Button>
              <Button
                type="button"
                onClick={handleUpdateQuiz}
                disabled={!canSubmit}
                className="min-w-[140px]"
              >
                <Save className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} aria-hidden="true" />
                {t("Modals.EditQuizModal.saveChangesButton")}
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

export default EditQuizModal;