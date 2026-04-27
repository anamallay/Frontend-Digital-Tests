import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Eye,
  X,
  User as UserIcon,
  FileQuestion,
  Trophy,
  HelpCircle,
} from "lucide-react";

import { AppDispatch, RootState } from "../reducer/store/store";
import { QuizType } from "../types/QuizType";
import { isPopulatedUser } from "../types/UserType";
import { ScoreType } from "../types/ScoreType";
import { fetchUserScores } from "../reducer/action/scoresSlice";
import {
  clearError,
  fetchUserLibrary,
} from "../reducer/action/librariesSlice";

import QuizStartModal from "./Modals/Libraries/QuizStartModal";
import DeleteLibraryModal from "./Modals/Libraries/DeleteLibraryModal";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Library: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [selectedQuiz, setSelectedQuiz] = useState<QuizType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  const {
    library: rawLibrary,
    isLoading: libraryLoading,
    error: libraryError,
  } = useSelector((state: RootState) => state.library);
  // Defensive: a stale or out-of-shape Redux value (e.g. from a mutation
  // thunk that returned { quizLink } instead of the populated array) must
  // never crash the render. Coerce non-array values to an empty list.
  const library: QuizType[] = Array.isArray(rawLibrary) ? rawLibrary : [];

  const { userScores: scores, isLoadingUser: scoresLoading } = useSelector(
    (state: RootState) => state.scores
  );

  const { isQuizInProgress, currentQuizId } = useSelector(
    (state: RootState) => state.quizProgress
  );

  useEffect(() => {
    // Clear any stale library-slice error from a prior mutation (e.g. a
    // failed share or remove) before the new fetch fires. The .pending
    // handler also clears, but doing it explicitly here covers cases
    // where the error survived because no new fetch was dispatched.
    dispatch(clearError());
    dispatch(fetchUserLibrary());
    dispatch(fetchUserScores());
  }, [dispatch]);

  const handleRemoveQuiz = (quizId: string) => {
    setQuizToDelete(quizId);
    setDeleteModalOpen(true);
  };

  const handleStartQuiz = (quiz: QuizType) => {
    const quizScore = getQuizScore(quiz._id);
    const isCurrentQuizInProgress =
      isQuizInProgress && currentQuizId === quiz._id;

    if (isCurrentQuizInProgress) {
      navigate(`/dashboard/library/${quiz._id}`);
    } else if (quizScore === null) {
      setSelectedQuiz(quiz);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuiz(null);
  };

  const handleConfirmStartQuiz = () => {
    setIsModalOpen(false);
    if (selectedQuiz) {
      navigate(`/dashboard/library/${selectedQuiz._id}`);
    }
  };

  const getQuizScore = (quizId: string) => {
    if (!scores || scores.length === 0) return null;

    const score = scores.find((score: ScoreType) => {
      const quiz = score.quiz as QuizType | string;
      return typeof quiz === "object" ? quiz._id === quizId : quiz === quizId;
    });

    return score ? score.score : null;
  };

  const handleViewScore = (scoreId: string) => {
    navigate(`/dashboard/myscores/${scoreId}`);
  };

  const isLoading = libraryLoading || scoresLoading;

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto w-[92%] max-w-7xl px-4 pb-20 pt-28 sm:pt-32"
    >
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("Library.libraryTitle")}
        </h1>
      </div>

      {/* Error banner */}
      {libraryError && !isLoading && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t("Library.loadingError")}
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-6">
                <Skeleton className="mb-4 h-6 w-3/4" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-5/6" />
                <Skeleton className="mb-6 h-4 w-4/6" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : library.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {t("Library.noQuizzes")}
          </h3>
        </div>
      ) : (
        /* Library grid */
        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {library.map((quiz, idx) => {
              const quizScore = getQuizScore(quiz._id);
              const isCurrentQuizInProgress =
                isQuizInProgress && currentQuizId === quiz._id;

              const hasQuestions =
                quiz.questions && quiz.questions.length > 0;

              let buttonText = "";
              if (!hasQuestions) {
                buttonText = t("Library.noQuestions");
              } else if (quizScore !== null) {
                buttonText = t("Library.submitted");
              } else if (isCurrentQuizInProgress) {
                buttonText = t("Library.quizInProgress");
              } else {
                buttonText = t("Library.startQuiz");
              }

              const isButtonDisabled =
                !hasQuestions ||
                quizScore !== null ||
                (isQuizInProgress && currentQuizId !== quiz._id);

              const userScore = scores.find(
                (score: ScoreType) =>
                  score.quiz &&
                  (typeof score.quiz === "object"
                    ? score.quiz._id === quiz._id
                    : score.quiz === quiz._id)
              );

              // Button visual variant based on state
              const buttonVariant: "default" | "secondary" =
                !hasQuestions || quizScore !== null ? "secondary" : "default";
              const inProgressClass = isCurrentQuizInProgress
                ? "bg-amber-500 text-white hover:bg-amber-500/90"
                : "";

              return (
                <motion.div
                  key={quiz._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(idx * 0.04, 0.3),
                    ease: "easeOut",
                  }}
                >
                  <Card className="group relative h-full border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                    <CardContent className="flex h-full flex-col p-6">
                      {/* Title + remove */}
                      <div className="mb-4 flex items-start justify-between gap-2">
                        <h2 className="line-clamp-2 text-lg font-semibold text-foreground">
                          {quiz.title}
                        </h2>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleRemoveQuiz(quiz._id)}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              aria-label={t("Library.removeQuiz")}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {t("Library.removeQuiz")}
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Meta rows */}
                      <div className="flex-1 space-y-2.5 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <UserIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>{t("Library.createdBy")}</span>
                          <span className="truncate font-medium text-foreground">
                            {(isPopulatedUser(quiz.user) && quiz.user.name) ||
                              t("Library.anonymousUser")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <HelpCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>{t("Library.questionsCount")}</span>
                          <span className="font-medium text-foreground">
                            {quiz.questions?.length ?? 0}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Trophy className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>{t("Library.score")}</span>
                          <span
                            className={`font-semibold ${
                              quizScore !== null
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          >
                            {quizScore !== null
                              ? `${quizScore}%`
                              : t("Library.noScore")}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 flex items-center gap-2 border-t border-border pt-4">
                        <Button
                          onClick={() => handleStartQuiz(quiz)}
                          disabled={isButtonDisabled}
                          variant={buttonVariant}
                          className={`flex-1 ${inProgressClass}`}
                        >
                          {buttonText}
                        </Button>

                        {userScore && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleViewScore(userScore._id)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                                aria-label={t("Library.viewScore")}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {t("Library.viewScore")}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TooltipProvider>
      )}

      {/* Modals */}
      {isModalOpen && selectedQuiz && (
        <QuizStartModal
          quiz={selectedQuiz}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmStartQuiz}
        />
      )}

      {deleteModalOpen && quizToDelete && (
        <DeleteLibraryModal
          quizId={quizToDelete}
          onClose={() => setDeleteModalOpen(false)}
        />
      )}
    </section>
  );
};

export default Library;