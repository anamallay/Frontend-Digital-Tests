import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Trophy,
  ListChecks,
  CircleAlert,
  FileQuestion,
} from "lucide-react";

import { RootState, AppDispatch } from "../reducer/store/store";
import { fetchExaminerQuizScores } from "../reducer/action/scoresSlice";
import { ScoreType, IAnswer } from "../types/ScoreType";
import { QuestionType } from "../types/QuestionType";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ShowScore: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();

  const { examinerScores, isLoadingExaminer, errorExaminer } = useSelector(
    (state: RootState) => state.scores
  );

  useEffect(() => {
    dispatch(fetchExaminerQuizScores());
  }, [dispatch]);

  // ── Loading state ────────────────────────────────────────────────────
  if (isLoadingExaminer) {
    return (
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-auto w-[92%] max-w-4xl px-4 pb-20 pt-28 sm:pt-32"
      >
        <Skeleton className="mb-4 h-6 w-40" />
        <Skeleton className="mb-2 h-8 w-72" />
        <Skeleton className="mb-10 h-5 w-48" />
        <Skeleton className="mb-10 h-32 w-full" />
        <div className="grid grid-cols-1 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-6">
                <Skeleton className="mb-4 h-5 w-2/3" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-2 h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  const score = examinerScores.find((s: ScoreType) => s._id === id);

  // ── Error / not-found state ──────────────────────────────────────────
  if (errorExaminer || !score) {
    return (
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-auto w-[92%] max-w-4xl px-4 pb-20 pt-28 sm:pt-32"
      >
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <CircleAlert className="h-6 w-6 text-destructive" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {errorExaminer || t("ShowScore.error")}
          </h3>
        </div>
      </section>
    );
  }

  const { quiz, answers } = score;
  const totalQuestions = quiz.questions.length;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const wrongCount = totalQuestions - correctCount;

  // Candidate — score.user is typed UserType[], take the first
  const candidate = Array.isArray(score.user) ? score.user[0] : undefined;
  const candidateName =
    candidate?.name || candidate?.username || t("PublicQuiz.unknown_user");
  const candidateUsername = candidate?.username;
  const initials = (candidate?.username || candidate?.name || "?")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto w-[92%] max-w-4xl px-4 pb-20 pt-28 sm:pt-32"
    >
      {/* Eyebrow + quiz title */}
      <div className="mb-4">
        <p className="mb-1 text-sm font-medium text-muted-foreground">
          {t("ShowScore.title")}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {quiz.title}
        </h1>
      </div>

      {/* Candidate identity chip */}
      <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-3 py-1.5">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-foreground">
          {candidateName}
        </span>
        {candidateUsername && candidateUsername !== candidateName && (
          <span className="text-xs text-muted-foreground">
            @{candidateUsername}
          </span>
        )}
      </div>

      {/* Score hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mb-6 overflow-hidden rounded-2xl border border-border bg-surface"
      >
        <div className="relative px-6 py-8 sm:px-10 sm:py-10">
          <div
            className={`pointer-events-none absolute ${
              isRTL ? "left-0" : "right-0"
            } top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl`}
          />
          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("ShowScore.score")}
                </p>
                <p className="mt-1 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  <span className="text-primary">{score.score}</span>
                  <span className="ml-0.5 text-2xl text-muted-foreground">%</span>
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="text-lg font-semibold text-foreground">
                {correctCount}
              </span>
              <span className="mx-1">/</span>
              <span>{totalQuestions}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary stats */}
      <div className="mb-10 grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <ListChecks className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {t("Score.totalQuestions")}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {totalQuestions}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {t("Score.correctAnswers")}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {correctCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
              <X className="h-4 w-4 text-destructive" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {t("ShowScore.wrongAnswer")}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {wrongCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions list header */}
      <div className="mb-6 flex items-center gap-2">
        <FileQuestion className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-base font-semibold text-foreground">
          {t("ShowScore.questionsAndAnswers")}
        </h2>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {quiz.questions.map((questionItem: QuestionType, index: number) => {
          const userAnswer: IAnswer | undefined = answers.find(
            (a) => a.question._id.toString() === questionItem._id.toString()
          );
          const isCorrect = Boolean(userAnswer?.isCorrect);

          return (
            <motion.div
              key={questionItem._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: Math.min(index * 0.04, 0.3),
                ease: "easeOut",
              }}
            >
              <Card className="border-border">
                <CardContent className="p-5 sm:p-6">
                  {/* Header row — number + question + correct/wrong chip */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                        {index + 1}
                      </span>
                      <p className="text-base font-medium leading-relaxed text-foreground">
                        {questionItem.question}
                      </p>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        isCorrect
                          ? "bg-emerald-500/10 text-emerald-700"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {isCorrect ? (
                        <Check className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <X className="h-3 w-3" aria-hidden="true" />
                      )}
                      {isCorrect
                        ? t("ShowScore.correctAnswer")
                        : t("ShowScore.wrongAnswer")}
                    </span>
                  </div>

                  {/* Options */}
                  <ul className="space-y-2">
                    {questionItem.options.map(
                      (option: string, optionIndex: number) => {
                        const isSelected =
                          optionIndex === userAnswer?.selectedOption;
                        const isOptionCorrect =
                          optionIndex === questionItem.correctOption;
                        const showCorrect = isOptionCorrect;
                        const showWrongPick = isSelected && !isCorrect;

                        const baseClasses =
                          "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors";
                        const stateClasses = showCorrect
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900"
                          : showWrongPick
                          ? "border-destructive/30 bg-destructive/10 text-foreground"
                          : "border-border bg-muted/40 text-foreground";

                        return (
                          <li
                            key={optionIndex}
                            className={`${baseClasses} ${stateClasses}`}
                          >
                            <span className="flex-1">{option}</span>

                            {showCorrect && (
                              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-700">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            )}
                            {showWrongPick && (
                              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-destructive">
                                <X className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </li>
                        );
                      }
                    )}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default ShowScore;