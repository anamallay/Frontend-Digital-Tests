import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListChecks,
  X,
  Plus,
  Pen,
  Trash2,
  FileQuestion,
  ArrowDown,
} from "lucide-react";

import { QuizType } from "../../../types/QuizType";
import { QuestionType } from "../../../types/QuestionType";
import { AppDispatch, RootState } from "../../../reducer/store/store";
import {
  addQuestion,
  deleteQuestion,
  fetchQuestionsByQuizId,
} from "../../../reducer/action/questionsSlice";
import { fetchUserQuizzes } from "../../../reducer/action/quizzesSlice";

import EditQuestionDetailModal from "./EditQuestionDetailModal";
import DeleteQuestionModal from "./DeleteQuestionModal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditQuestionsModalProps {
  quiz: QuizType | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const EditQuestionsModal: React.FC<EditQuestionsModalProps> = ({
  quiz,
  isOpen,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();

  const { questions, isLoading, error } = useSelector(
    (state: RootState) => state.questions
  );

  // "Add new question" form state
  const [newQuestion, setNewQuestion] = useState<string>("");
  const [newOptions, setNewOptions] = useState<string[]>(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Child modals
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  // Fetch questions whenever the modal opens or the quiz changes
  useEffect(() => {
    if (quiz && isOpen) dispatch(fetchQuestionsByQuizId(quiz._id));
  }, [dispatch, quiz?._id, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const resetForm = () => {
    setNewQuestion("");
    setNewOptions(["", "", "", ""]);
    setCorrectOption(0);
  };

  const handleOptionChange = (index: number, value: string) => {
    setNewOptions((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  // Validation for the add-form
  const questionValid = newQuestion.trim().length > 0;
  const allOptionsValid = newOptions.every((o) => o.trim().length > 0);
  const canSubmit = questionValid && allOptionsValid && !isSubmitting && !!quiz;

  const handleAddQuestion = async () => {
    if (!canSubmit || !quiz) return;
    setIsSubmitting(true);
    try {
      await dispatch(
        addQuestion({
          quizId: quiz._id,
          question: newQuestion.trim(),
          options: newOptions.map((o) => o.trim()),
          correctOption,
        } as any) // quizId is what the backend expects; cast for the typed thunk
      ).unwrap();
      resetForm();
      dispatch(fetchUserQuizzes());
    } catch {
      // Error is surfaced via `state.questions.error` — form stays open.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectQuestion = (questionId: string) => {
    const q = questions.find((x) => x._id === questionId);
    if (q) {
      setSelectedQuestion(q);
      setIsDetailModalOpen(true);
    }
  };

  const handleDeleteClick = (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuestionToDelete(questionId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteQuestion = () => {
    if (!quiz || !questionToDelete) return;
    dispatch(
      deleteQuestion({ quizId: quiz._id, questionId: questionToDelete })
    ).then(() => {
      dispatch(fetchQuestionsByQuizId(quiz._id));
      setIsDeleteModalOpen(false);
      setQuestionToDelete(null);
    });
  };

  const content = (
    <AnimatePresence>
      {isOpen && quiz && (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-questions-title"
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
            className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <ListChecks className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="edit-questions-title"
                    className="truncate text-lg font-semibold tracking-tight text-foreground"
                  >
                    {t(
                      "Modals.EditQuestionsModal.editQuizTitle",
                      "Edit Questions"
                    ).replace(": {{quizTitle}}", "")}
                  </h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {quiz.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  {questions.length}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label={t("Common.close")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <TooltipProvider delayDuration={200}>
                {/* Existing questions */}
                <section className="border-b border-border px-6 py-5">
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : error ? (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                      <span>
                        {t("Modals.EditQuestionsModal.loadingError", {
                          error:
                            typeof error === "string" ? error : error.message,
                        })}
                      </span>
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 py-8 text-center">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <FileQuestion className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {t("Modals.EditQuestionsModal.noQuestionsFound")}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <ArrowDown className="h-3 w-3" />
                        {t(
                          "Modals.EditQuestionsModal.startBelowHint",
                          "Add your first question below"
                        )}
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {questions.map((question, index) => (
                        <li
                          key={question._id}
                          onClick={() => handleSelectQuestion(question._id)}
                          className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-primary/40 hover:bg-accent/40"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                            {index + 1}
                          </span>
                          <span className="flex-1 truncate text-sm font-medium text-foreground">
                            {question.question}
                          </span>
                          <div className="flex shrink-0 items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectQuestion(question._id);
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                  aria-label={t(
                                    "Modals.EditQuestionDetailModal.title"
                                  )}
                                >
                                  <Pen className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {t("Modals.EditQuestionDetailModal.title")}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handleDeleteClick(question._id, e)
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                  aria-label={t(
                                    "Modals.EditQuestionsModal.deleteButton"
                                  )}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {t("Modals.EditQuestionsModal.deleteButton")}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Add new question */}
                <section className="px-6 py-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Plus className="h-4 w-4 text-primary" />
                    {t("Modals.EditQuestionsModal.addNewQuestionTitle")}
                  </h3>

                  <div className="space-y-4">
                    {/* Question text */}
                    <div className="space-y-2">
                      <Label htmlFor="new-question">
                        {t("Modals.EditQuestionsModal.addNewQuestionTitle")}
                      </Label>
                      <Textarea
                        id="new-question"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder={t(
                          "Modals.EditQuestionsModal.addNewQuestionTitle"
                        )}
                        rows={2}
                        className="resize-none"
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>
                          {t("Modals.EditQuestionsModal.addOptionsTitle")}
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {t(
                            "Modals.EditQuestionsModal.chooseCorrectAnswerTitle"
                          )}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {newOptions.map((option, index) => {
                          const isCorrect = correctOption === index;
                          return (
                            <div
                              key={index}
                              className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors ${
                                isCorrect
                                  ? "border-primary/40 bg-primary/5"
                                  : "border-border bg-surface"
                              }`}
                            >
                              <button
                                type="button"
                                role="radio"
                                aria-checked={isCorrect}
                                onClick={() => setCorrectOption(index)}
                                aria-label={t(
                                  "Modals.EditQuestionsModal.correctOption",
                                  { optionNumber: index + 1 }
                                )}
                                className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                  isCorrect
                                    ? "border-primary"
                                    : "border-border"
                                }`}
                              >
                                {isCorrect && (
                                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                                )}
                              </button>
                              <Input
                                value={option}
                                onChange={(e) =>
                                  handleOptionChange(index, e.target.value)
                                }
                                placeholder={t(
                                  "Modals.EditQuestionsModal.correctOption",
                                  { optionNumber: index + 1 }
                                )}
                                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                              />
                            </div>
                          );
                        })}
                      </div>

                      {!canSubmit && !isSubmitting && (
                        <p className="text-xs text-muted-foreground">
                          {t(
                            "Modals.EditQuestionsModal.validationHint",
                            "Fill in the question and all four options before adding."
                          )}
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={handleAddQuestion}
                      disabled={!canSubmit}
                      className="w-full sm:w-auto"
                    >
                      <Plus className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                      {t("Modals.EditQuestionsModal.addQuestionButton")}
                    </Button>
                  </div>
                </section>
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
                {t("Modals.EditQuestionsModal.cancelButton")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {typeof document !== "undefined" &&
        ReactDOM.createPortal(content, document.body)}
      <DeleteQuestionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteQuestion}
      />
      <EditQuestionDetailModal
        question={selectedQuestion}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedQuestion(null);
          if (quiz) dispatch(fetchQuestionsByQuizId(quiz._id));
        }}
      />
    </>
  );
};

export default EditQuestionsModal;