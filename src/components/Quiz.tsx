import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Pen,
  Share2,
  Trash2,
  ListChecks,
  Clock,
  HelpCircle,
  Globe,
  Lock,
  FilePlus,
} from "lucide-react";

import { AppDispatch, RootState } from "../reducer/store/store";
import {
  clearError,
  fetchUserQuizzes,
  updateQuiz,
} from "../reducer/action/quizzesSlice";
import { shareQuizWithCandidate } from "../reducer/action/librariesSlice";
import { QuizType } from "../types/QuizType";

import QuizCard from "./QuizCard";
import EditQuestionsModal from "./Modals/Questions/EditQuestionsModal";
import DeleteQuizModal from "./Modals/Quizzes/DeleteQuizModal";
import CreateQuizModal from "./Modals/Quizzes/CreateQuizModal";
import ShareLinkModal from "./Modals/Quizzes/ShareLinkModal";
import EditQuizModal from "./Modals/Quizzes/EditQuizModal";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Quiz: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();

  // Narrow per-field selectors — see #18 in the improvement plan. Each
  // `useSelector` re-renders only when its specific field changes.
  const quizzes = useSelector((state: RootState) => state.quizzes.quizzes);
  const isLoading = useSelector(
    (state: RootState) => state.quizzes.isLoading
  );
  const isSharing = useSelector(
    (state: RootState) => state.library.isLoading
  );

  const [openCreateModal, setOpenCreateModal] = useState(false);

  // Edit-questions modal (the "work on content" flow)
  const [editQuestionsOpen, setEditQuestionsOpen] = useState(false);
  const [quizForQuestions, setQuizForQuestions] = useState<QuizType | null>(
    null
  );

  // Edit-info modal (title / description / time / visibility)
  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState<QuizType | null>(null);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  // Share modal
  const [shareOpen, setShareOpen] = useState(false);
  const [quizLink, setQuizLink] = useState<string | null>(null);

  useEffect(() => {
    // Clear any stale quizzes-slice error from a prior mutation (e.g. a
    // failed createQuiz / updateQuiz / deleteQuiz) before the fetch
    // fires. Mirrors the Login.tsx pattern.
    dispatch(clearError());
    dispatch(fetchUserQuizzes());
  }, [dispatch]);

  const handleEditQuestions = (quiz: QuizType) => {
    setQuizForQuestions(quiz);
    setEditQuestionsOpen(true);
  };

  const handleEditInfo = (quiz: QuizType) => {
    setQuizToEdit(quiz);
    setEditInfoOpen(true);
  };

  const handleDelete = (quizId: string) => {
    setQuizToDelete(quizId);
    setDeleteOpen(true);
  };

  const handleShare = async (quiz: QuizType) => {
    try {
      let link = "";
      if (quiz.visibility === "private") {
        const response = await dispatch(
          shareQuizWithCandidate({ quizId: quiz._id })
        ).unwrap();
        link = response.quizLink;
      } else {
        link = `${window.location.origin}/dashboard/add-quiz-to-library/${quiz._id}`;
      }
      setQuizLink(link || "");
      setShareOpen(true);
    } catch {
      // Error is already surfaced through `state.library.error` by the thunk.
      // The share modal simply doesn't open on failure.
    }
  };

  const handleQuizUpdate = (updatedQuiz: QuizType) => {
    dispatch(
      updateQuiz({ quizId: updatedQuiz._id, updatedData: updatedQuiz })
    );
    setEditInfoOpen(false);
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto w-[92%] max-w-7xl px-4 pb-20 pt-28 sm:pt-32"
    >
      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("Quiz.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("Quiz.subtitle")}
          </p>
        </div>
        <Button
          onClick={() => setOpenCreateModal(true)}
          className="shrink-0 self-start sm:self-auto"
        >
          <Plus className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} aria-hidden="true" />
          {t("Quiz.addQuiz")}
        </Button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-6">
                <Skeleton className="mb-3 h-5 w-2/3" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-5 h-4 w-5/6" />
                <Skeleton className="mb-4 h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !quizzes || quizzes.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <FilePlus className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            {t("Quiz.noQuizzesFound")}
          </h3>
          <p className="mb-5 max-w-sm text-sm text-muted-foreground">
            {t("Quiz.emptyHint")}
          </p>
          <Button onClick={() => setOpenCreateModal(true)}>
            <Plus className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} aria-hidden="true" />
            {t("Quiz.addQuiz")}
          </Button>
        </div>
      ) : (
        /* Grid */
        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {quizzes.map((quiz, idx) => {
              const isPublic = quiz.visibility === "public";
              const questionsCount = quiz.questions?.length ?? 0;

              return (
                <QuizCard
                  key={quiz._id}
                  quiz={quiz}
                  index={idx}
                  showDescription
                  topBar={
                    <>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          isPublic
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isPublic ? (
                          <Globe className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <Lock className="h-3 w-3" aria-hidden="true" />
                        )}
                        {isPublic
                          ? t("Modals.CreateQuizModal.publicOption")
                          : t("Modals.CreateQuizModal.privateOption")}
                      </span>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleShare(quiz)}
                            disabled={isSharing}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={t("Quiz.shareQuiz")}
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {t("Quiz.shareQuiz")}
                        </TooltipContent>
                      </Tooltip>
                    </>
                  }
                  titleAccessory={
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleEditInfo(quiz)}
                          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          aria-label={t("Quiz.editQuiz")}
                        >
                          <Pen className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {t("Quiz.editQuiz")}
                      </TooltipContent>
                    </Tooltip>
                  }
                  meta={
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="font-medium text-foreground">
                          {questionsCount}
                        </span>
                        <span>{t("Quiz.question")}</span>
                      </span>
                      <span className="h-3 w-px bg-border" />
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="font-medium text-foreground">
                          {quiz.time}
                        </span>
                        <span>{t("Quiz.minutes")}</span>
                      </span>
                    </div>
                  }
                  footer={
                    <>
                      <Button
                        onClick={() => handleEditQuestions(quiz)}
                        variant="outline"
                        className="flex-1"
                      >
                        <ListChecks
                          className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`}
                          aria-hidden="true"
                        />
                        {t("Modals.EditQuestionsModal.headerSimple")}
                      </Button>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleDelete(quiz._id)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                            aria-label={t("Quiz.deleteQuiz")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {t("Quiz.deleteQuiz")}
                        </TooltipContent>
                      </Tooltip>
                    </>
                  }
                />
              );
            })}
          </div>
        </TooltipProvider>
      )}

      {/* Modals */}
      <EditQuestionsModal
        quiz={quizForQuestions}
        isOpen={editQuestionsOpen}
        onClose={() => setEditQuestionsOpen(false)}
        onConfirm={() => setEditQuestionsOpen(false)}
      />

      {deleteOpen && quizToDelete && (
        <DeleteQuizModal
          quizId={quizToDelete}
          onClose={() => setDeleteOpen(false)}
        />
      )}

      {openCreateModal && (
        <CreateQuizModal
          isOpen={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
        />
      )}

      {quizLink && (
        <ShareLinkModal
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          quizLink={quizLink}
        />
      )}

      {quizToEdit && (
        <EditQuizModal
          quiz={quizToEdit}
          isOpen={editInfoOpen}
          onClose={() => setEditInfoOpen(false)}
          onUpdate={handleQuizUpdate}
        />
      )}
    </section>
  );
};

export default Quiz;