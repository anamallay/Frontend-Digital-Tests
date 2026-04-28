import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trash2, Inbox, CircleAlert, Check, ListChecks } from "lucide-react";

import {
  fetchExaminerQuizScores,
  clearExaminerScores,
  deleteScore,
} from "../reducer/action/scoresSlice";
import { AppDispatch, RootState } from "../reducer/store/store";
import DeleteScoreModal from "./Modals/Scores/DeleteScoreModal";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Score = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Narrow per-field selectors — scoresSlice has 10 fields; this component
  // only cares about the examiner trio. Splitting prevents re-renders from
  // mutations to userScores / singleScore / etc.
  const examinerScores = useSelector(
    (state: RootState) => state.scores.examinerScores
  );
  const isLoadingExaminer = useSelector(
    (state: RootState) => state.scores.isLoadingExaminer
  );
  const errorExaminer = useSelector(
    (state: RootState) => state.scores.errorExaminer
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentScoreId, setCurrentScoreId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchExaminerQuizScores());
    return () => {
      dispatch(clearExaminerScores());
    };
  }, [dispatch]);

  const handleDeleteScore = (scoreId: string) => {
    setCurrentScoreId(scoreId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (currentScoreId) dispatch(deleteScore(currentScoreId));
    setIsModalOpen(false);
    setCurrentScoreId(null);
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setCurrentScoreId(null);
  };

  const handleViewScore = (scoreId: string) => {
    navigate(`/dashboard/examiner-score/${scoreId}`);
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative mx-auto w-[92%] max-w-7xl px-4 pb-20 pt-20 sm:pt-24"
    >
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("Score.examinerQuizResults")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("Score.subtitle")}
        </p>
      </div>

      {/* Error banner */}
      {errorExaminer && !isLoadingExaminer && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorExaminer}</span>
        </div>
      )}

      {/* Loading */}
      {isLoadingExaminer ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="mb-4 h-5 w-3/4" />
                <Skeleton className="mb-2 h-4 w-1/2" />
                <Skeleton className="h-10 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : examinerScores.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50">
            <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {t("Score.noResultsAvailable")}
          </h3>
        </div>
      ) : (
        /* Submissions grid */
        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {examinerScores.map((score, idx) => {
              const quiz = score.quiz;
              const user = score.user;

              const candidateName =
                user?.name || user?.username || t("PublicQuiz.unknown_user");
              const candidateUsername = user?.username;
              const initials = (
                user?.username ||
                user?.name ||
                "?"
              )
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={score._id}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out fill-mode-backwards motion-reduce:animate-none"
                  style={{ animationDelay: `${Math.min(idx * 40, 300)}ms` }}
                >
                  <Card
                    onClick={() => handleViewScore(score._id)}
                    className="group relative h-full cursor-pointer border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 motion-reduce:hover:translate-y-0"
                  >
                    <CardContent className="flex h-full flex-col p-6">
                      {/* Candidate */}
                      <div className="mb-4 flex items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0 border border-border">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-[11px] font-semibold text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {candidateName}
                          </p>
                          {candidateUsername &&
                            candidateUsername !== candidateName && (
                              <p className="truncate text-xs text-muted-foreground">
                                @{candidateUsername}
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Quiz title */}
                      <h2 className="mb-5 line-clamp-2 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {quiz?.title}
                      </h2>

                      {/* Score — prominent */}
                      <div className="mb-5">
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {t("Score.score")}
                        </p>
                        <p className="mt-0.5 text-3xl font-semibold tracking-tight text-foreground">
                          <span className="text-primary">{score.score}</span>
                          <span className="ml-0.5 text-lg text-muted-foreground">
                            %
                          </span>
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <ListChecks className="h-4 w-4" aria-hidden="true" />
                          <span className="font-medium text-foreground">
                            {score.totalQuestions}
                          </span>
                          <span className="text-xs">
                            {t("Score.totalQuestions")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                          <span className="font-medium text-foreground">
                            {score.correctAnswers}
                          </span>
                          <span className="text-xs">
                            {t("QuizQuestions.answered")}
                          </span>
                        </div>
                      </div>

                      {/* Delete button (absolute corner) */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScore(score._id);
                            }}
                            className={`absolute top-3 ${
                              isRTL ? "left-3" : "right-3"
                            } flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive`}
                            aria-label={t(
                              "Modals.DeleteScoreModal.confirmationMessage"
                            )}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {t("Modals.DeleteScoreModal.confirmationMessage")}
                        </TooltipContent>
                      </Tooltip>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </TooltipProvider>
      )}

      <DeleteScoreModal
        isOpen={isModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
};

export default Score;