import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector, useStore } from "react-redux";
import { useTranslation } from "react-i18next";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Flag,
  Loader2,
} from "lucide-react";

import type { AppDispatch, RootState } from "../reducer/store/store";
import { fetchQuizFromLibrary } from "../reducer/action/questionsSlice";
import {
  startQuiz,
  setAnswer,
  setCurrentQuestion,
  submitAndEndQuiz,
  selectRemainingTime,
} from "../reducer/action/quizProgressSlice";
import { fetchUserLibrary } from "../reducer/action/librariesSlice";
import { QuestionType } from "../types/QuestionType";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const QuizQuestions: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { quiz: quizId } = useParams<{ quiz: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>();
  const navigate = useNavigate();

  const { library } = useSelector((state: RootState) => state.library);
  const { questions, isLoading, error } = useSelector(
    (state: RootState) => state.questions
  );
  const {
    isQuizInProgress,
    currentQuizId,
    answers,
    currentQuestion,
    isSubmitting,
  } = useSelector((state: RootState) => state.quizProgress);
  const remainingTime = useSelector(selectRemainingTime);

  const quiz = library.find((q) => q._id === quizId);
  const totalDuration = (quiz?.time ?? 1) * 60;

  // ── Tick driver ──────────────────────────────────────────────────────
  // `remainingTime` is a derived selector. It recomputes each render, but
  // without a trigger React wouldn't know to re-render every second. This
  // one-state-bump-per-second pattern keeps the component in sync with
  // the clock without owning the clock itself. The GlobalTimer is the
  // authoritative source for "is time up" — this is purely UI.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!isQuizInProgress || currentQuizId !== quizId) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [isQuizInProgress, currentQuizId, quizId]);

  // ── Load library once ────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchUserLibrary());
  }, [dispatch]);

  // ── Load questions, and start the quiz if this is a fresh session ───
  //
  // This effect must NOT depend on `isQuizInProgress` or `currentQuizId`.
  // Those flip to false/null when the quiz ends (manual or auto submit);
  // if they were deps, the effect would re-run post-submit and restart the
  // quiz — which is exactly the "early submit doesn't end" / "timer resets
  // to 0 and starts over" bug we saw. The "am I already in progress?"
  // decision reads fresh state from `store.getState()` at the moment of
  // decision instead.
  useEffect(() => {
    if (!quizId || !quiz) return;
    let cancelled = false;

    dispatch(fetchQuizFromLibrary(quizId))
      .then((action) => {
        if (cancelled) return;
        if (!fetchQuizFromLibrary.fulfilled.match(action)) return;
        const fetched = action.payload as QuestionType[];

        if (fetched.length === 0) {
          navigate("/dashboard/library");
          return;
        }

        // Fresh read from the store (not captured closure values) so the
        // decision reflects the actual current progress state.
        const progress = store.getState().quizProgress;
        if (!progress.isQuizInProgress || progress.currentQuizId !== quizId) {
          dispatch(
            startQuiz({
              quizId,
              totalTime: totalDuration,
              questionCount: fetched.length,
            })
          );
        }
      })
      .catch(() => {
        /* handled via the `error` selector */
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, store, quizId, quiz?._id, totalDuration, navigate]);

  // ── Navigate away when the quiz ends (manual or auto submit) ─────────
  //
  // Watches the `isQuizInProgress` flag and fires a navigation when it
  // transitions from true to false while this page is mounted. This
  // unifies the "what happens after submit" path: the global timer's
  // auto-submit and the user's manual submit both route through here, so
  // neither needs to know about navigation itself.
  const wasInProgress = useRef(isQuizInProgress);
  useEffect(() => {
    if (wasInProgress.current && !isQuizInProgress) {
      navigate("/dashboard/library");
    }
    wasInProgress.current = isQuizInProgress;
  }, [isQuizInProgress, navigate]);

  const handleAnswerChange = (answerIndex: number) => {
    dispatch(
      setAnswer({ questionIndex: currentQuestion, optionIndex: answerIndex })
    );
  };

  const handleSubmit = () => {
    // Navigation happens in the `isQuizInProgress` transition-watcher effect
    // above, so both manual and auto-submit paths navigate through the
    // same code path.
    //
    // The thunk's `isSubmitting` guard handles duplicate-submit protection,
    // so the button's `disabled` state below is purely for UX feedback —
    // even if it somehow fired twice, the second call would no-op.
    dispatch(submitAndEndQuiz());
  };

  const handleNext = () =>
    dispatch(
      setCurrentQuestion(Math.min(currentQuestion + 1, questions.length - 1))
    );
  const handlePrevious = () =>
    dispatch(setCurrentQuestion(Math.max(currentQuestion - 1, 0)));

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ── Loading state ────────────────────────────────────────────────────
  if (isLoading && questions.length === 0) {
    return (
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-auto w-[92%] max-w-3xl px-4 pb-20 pt-28 sm:pt-32"
      >
        <Skeleton className="mb-4 h-8 w-1/2" />
        <Skeleton className="mb-10 h-2 w-full rounded-full" />
        <Card className="border-border">
          <CardContent className="p-6 sm:p-8">
            <Skeleton className="mb-6 h-6 w-3/4" />
            <Skeleton className="mb-3 h-12 w-full" />
            <Skeleton className="mb-3 h-12 w-full" />
            <Skeleton className="mb-3 h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </section>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────
  if (error) {
    return (
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-auto w-[92%] max-w-3xl px-4 pb-20 pt-28 sm:pt-32"
      >
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <CircleAlert className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {t("QuizQuestions.loadingError")}
          </h3>
        </div>
      </section>
    );
  }

  if (questions.length === 0) return null;

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = answers.filter((a) => a !== -1).length;

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto w-[92%] max-w-3xl px-4 pb-20 pt-28 sm:pt-32"
    >
      {/* Header: title, counter, timer */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {quiz?.title ?? t("QuizQuestions.quizTitle")}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("QuizQuestions.quizTitle")} {currentQuestion + 1} /{" "}
            {questions.length}
            <span className="mx-2">·</span>
            {answeredCount} / {questions.length}{" "}
            {t("Score.correctAnswers")}
          </p>
        </div>
        {/*
          The CountdownCircleTimer is purely decorative. It shows a visual
          ring driven by `initialRemainingTime` (re-keyed each tick via
          `remainingTime` so the ring stays in sync with Redux state).
          `onComplete` intentionally does NOTHING — auto-submission is
          owned by GlobalTimer.
        */}
        <CountdownCircleTimer
          key={remainingTime /* force re-sync with store each tick */}
          isPlaying={isQuizInProgress && currentQuizId === quizId}
          duration={totalDuration}
          initialRemainingTime={remainingTime}
          colors={["#635BFF", "#f59e0b", "#ef4444", "#ef4444"]}
          colorsTime={[
            totalDuration * 0.5,
            totalDuration * 0.25,
            totalDuration * 0.1,
            0,
          ]}
          size={52}
          strokeWidth={4}
          trailColor="#e5e7eb"
          onComplete={() => ({ shouldRepeat: false })}
        >
          {({ remainingTime: libTime }) => (
            <div className="text-xs font-semibold tabular-nums text-foreground">
              {formatTime(libTime)}
            </div>
          )}
        </CountdownCircleTimer>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question card */}
      <Card className="border-border">
        <CardContent className="p-6 sm:p-8">
          {/* Question */}
          <div className="mb-6 flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
              {currentQuestion + 1}
            </span>
            <h2 className="text-base font-medium leading-relaxed text-foreground sm:text-lg">
              {question.question}
            </h2>
          </div>

          {/* Options */}
          {question.options && question.options.length > 0 ? (
            <div
              role="radiogroup"
              aria-label={question.question}
              className="space-y-2.5"
            >
              {question.options.map((option, optionIndex) => {
                const isSelected = answers[currentQuestion] === optionIndex;
                return (
                  <button
                    key={optionIndex}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleAnswerChange(optionIndex)}
                    disabled={isSubmitting}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-start transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                      isSelected
                        ? "border-primary bg-primary/5 text-foreground shadow-sm"
                        : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-accent/50"
                    }`}
                  >
                    <span
                      className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        isSelected ? "border-primary" : "border-border"
                      }`}
                    >
                      {isSelected && (
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </span>
                    <span className="flex-1 text-sm sm:text-base">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              <CircleAlert className="h-4 w-4 shrink-0" />
              <span>{t("QuizQuestions.noOptionsAvailable")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer navigation */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0 || isSubmitting}
        >
          <ArrowLeft
            className={`h-4 w-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`}
          />
          {t("QuizQuestions.previous")}
        </Button>

        <div className="flex items-center gap-2">
          {currentQuestion === questions.length - 1 ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <Loader2
                  className={`h-4 w-4 animate-spin ${isRTL ? "ml-2" : "mr-2"}`}
                />
              ) : (
                <Flag className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              )}
              {t("QuizQuestions.submitAnswers")}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {t("QuizQuestions.next")}
              <ArrowRight
                className={`h-4 w-4 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Early submit — discreet, always available after first answer */}
      {currentQuestion !== questions.length - 1 && answeredCount > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-muted-foreground"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            {t("QuizQuestions.submitAnswers")}
          </button>
        </div>
      )}
    </section>
  );
};

export default QuizQuestions;