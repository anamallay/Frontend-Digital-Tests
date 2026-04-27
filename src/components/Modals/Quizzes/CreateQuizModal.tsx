import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

import { AppDispatch } from "../../../reducer/store/store";
import { IQuizInput } from "../../../types/QuizType";
import {
  createQuiz,
  fetchUserQuizzes,
} from "../../../reducer/action/quizzesSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateQuizModalProps {
  onClose: () => void;
  isOpen: boolean;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  onClose,
  isOpen,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();

  const [newQuiz, setNewQuiz] = useState<IQuizInput>({
    title: "",
    description: "",
    time: 0,
    visibility: "public",
    questions: [],
  });

  const [error, setError] = useState<string | null>(null);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newQuiz.time || newQuiz.time <= 0) {
      setError(t("Modals.CreateQuizModal.error.quizTimeRequired"));
      return;
    }

    const quizToSubmit = { ...newQuiz };

    try {
      await dispatch(createQuiz(quizToSubmit)).unwrap();
      dispatch(fetchUserQuizzes());
      onClose();
    } catch (error: unknown) {
      setError(t("Modals.CreateQuizModal.error.quizCreationFailed"));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewQuiz({
      ...newQuiz,
      [name]: name === "time" ? parseInt(value) : value,
    });
  };

  const handleVisibilityChange = (value: string) => {
    setNewQuiz({ ...newQuiz, visibility: value as "public" | "private" });
  };

  if (!isOpen) return null;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-quiz-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-xl sm:p-8"
      >
        <h3
          id="create-quiz-title"
          className="mb-1 text-2xl font-semibold tracking-tight text-foreground"
        >
          {t("Modals.CreateQuizModal.createNewQuiz")}
        </h3>

        <div className="mb-6 h-px w-full bg-border/60" />

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateQuiz} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="quiz-title" className="text-sm font-medium text-foreground">
              {t("Modals.CreateQuizModal.quizTitleLabel")}
            </Label>
            <Input
              id="quiz-title"
              type="text"
              name="title"
              value={newQuiz.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="quiz-description"
              className="text-sm font-medium text-foreground"
            >
              {t("Modals.CreateQuizModal.quizDescriptionLabel")}
            </Label>
            <Input
              id="quiz-description"
              type="text"
              name="description"
              value={newQuiz.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Time with stepper */}
          <div className="space-y-2">
            <Label htmlFor="quiz-time" className="text-sm font-medium text-foreground">
              {t("Modals.CreateQuizModal.quizTimeLabel")}
            </Label>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-1.5 py-1.5 transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20">
              <button
                type="button"
                aria-label={t("Modals.CreateQuizModal.decreaseTime")}
                onClick={() =>
                  setNewQuiz((prev) => ({
                    ...prev,
                    time: prev.time > 0 ? prev.time - 1 : 0,
                  }))
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
              >
                <Minus className="h-4 w-4" />
              </button>

              <input
                id="quiz-time"
                type="number"
                name="time"
                value={newQuiz.time}
                onChange={handleChange}
                required
                className="min-w-0 flex-1 bg-transparent px-2 text-center text-sm font-medium text-foreground outline-none focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />

              <button
                type="button"
                aria-label={t("Modals.CreateQuizModal.increaseTime")}
                onClick={() =>
                  setNewQuiz((prev) => ({ ...prev, time: prev.time + 1 }))
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {t("Modals.CreateQuizModal.quizVisibilityLabel")}
            </Label>
            <Select
              value={newQuiz.visibility}
              onValueChange={handleVisibilityChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  {t("Modals.CreateQuizModal.publicOption")}
                </SelectItem>
                <SelectItem value="private">
                  {t("Modals.CreateQuizModal.privateOption")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="min-w-[96px]"
            >
              {t("Modals.CreateQuizModal.cancelButton")}
            </Button>
            <Button type="submit" className="min-w-[96px]">
              {t("Modals.CreateQuizModal.createButton")}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateQuizModal;