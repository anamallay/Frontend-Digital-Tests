import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Pen, Save, X } from "lucide-react";

import { QuestionType } from "../../../types/QuestionType";
import { AppDispatch } from "../../../reducer/store/store";
import { updateQuestionInQuiz } from "../../../reducer/action/questionsSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditQuestionDetailModalProps {
  question: QuestionType | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditQuestionDetailModal: React.FC<EditQuestionDetailModalProps> = ({
  question,
  isOpen,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();

  const [editedQuestion, setEditedQuestion] = useState<string>("");
  const [editedOptions, setEditedOptions] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);
  const [editedCorrectOption, setEditedCorrectOption] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (question) {
      setEditedQuestion(question.question);
      setEditedOptions(
        question.options.length === 4
          ? question.options
          : [
              question.options[0] ?? "",
              question.options[1] ?? "",
              question.options[2] ?? "",
              question.options[3] ?? "",
            ]
      );
      setEditedCorrectOption(question.correctOption);
    }
  }, [question]);

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

  const handleOptionChange = (index: number, value: string) => {
    setEditedOptions((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  // Validation — all fields must be filled, selection must reference a filled option
  const questionValid = editedQuestion.trim().length > 0;
  const allOptionsValid = editedOptions.every((o) => o.trim().length > 0);
  const correctOptionValid =
    editedCorrectOption >= 0 &&
    editedCorrectOption < editedOptions.length &&
    (editedOptions[editedCorrectOption] ?? "").trim().length > 0;
  const canSubmit =
    questionValid && allOptionsValid && correctOptionValid && !isSubmitting;

  const handleUpdate = async () => {
    if (!question || !canSubmit) return;
    setIsSubmitting(true);
    try {
      await dispatch(
        updateQuestionInQuiz({
          questionId: question._id,
          questionData: {
            question: editedQuestion.trim(),
            options: editedOptions.map((o) => o.trim()),
            correctOption: editedCorrectOption,
          },
        })
      ).unwrap();
      onClose();
    } catch {
      // Error is surfaced via `state.questions.error` — modal stays open.
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <AnimatePresence>
      {isOpen && question && (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-question-title"
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
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Pen className="h-4 w-4 text-primary" />
                </div>
                <h2
                  id="edit-question-title"
                  className="text-lg font-semibold tracking-tight text-foreground"
                >
                  {t("Modals.EditQuestionDetailModal.title")}
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
            <div className="px-6 py-5">
              {/* Question */}
              <div className="space-y-2">
                <Label htmlFor="edit-question-text">
                  {t("Modals.EditQuestionDetailModal.questionLabel")}
                </Label>
                <Textarea
                  id="edit-question-text"
                  value={editedQuestion}
                  onChange={(e) => setEditedQuestion(e.target.value)}
                  placeholder={t(
                    "Modals.EditQuestionDetailModal.questionLabel"
                  )}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Options */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    {t("Modals.EditQuestionDetailModal.optionsLabel")}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {t(
                      "Modals.EditQuestionDetailModal.correctOptionLabel"
                    )}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {editedOptions.map((option, index) => {
                    const isCorrect = editedCorrectOption === index;
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors ${
                          isCorrect
                            ? "border-primary/40 bg-primary/5"
                            : "border-border bg-surface"
                        }`}
                      >
                        {/* Radio: mark this option correct */}
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isCorrect}
                          onClick={() => setEditedCorrectOption(index)}
                          aria-label={t(
                            "Modals.EditQuestionDetailModal.correctOptionValue",
                            { optionNumber: index + 1 }
                          )}
                          className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            isCorrect ? "border-primary" : "border-border"
                          }`}
                        >
                          {isCorrect && (
                            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                          )}
                        </button>

                        {/* Option text */}
                        <Input
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                          placeholder={t(
                            "Modals.EditQuestionDetailModal.correctOptionValue",
                            { optionNumber: index + 1 }
                          )}
                          className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Validation hint */}
                {!canSubmit && !isSubmitting && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t(
                      "Modals.EditQuestionDetailModal.validationHint",
                      "Fill in the question and all four options before saving."
                    )}
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
                {t("Modals.EditQuestionDetailModal.closeButton")}
              </Button>
              <Button
                type="button"
                onClick={handleUpdate}
                disabled={!canSubmit}
                className="min-w-[120px]"
              >
                <Save className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("Modals.EditQuestionDetailModal.updateButton")}
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

export default EditQuestionDetailModal;