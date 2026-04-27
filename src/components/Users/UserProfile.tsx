import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Calendar,
  CircleAlert,
  FileQuestion,
  User as UserIcon,
} from "lucide-react";

import { AppDispatch, RootState } from "../../reducer/store/store";
import {
  clearCurrentUser,
  fetchPublicUserById,
} from "../../reducer/action/publicUsersSlice";
import { QuizType } from "../../types/QuizType";

import QuizDetailsModal from "../Modals/Quizzes/QuizDetailsModal";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const UserProfile = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useParams<{ userId: string }>();

  const { currentUser, publicQuizzes, isLoadingProfile, errorProfile } =
    useSelector((state: RootState) => state.publicUsers);

  const [selectedQuiz, setSelectedQuiz] = useState<QuizType | null>(null);

  // Fetch on mount / when userId changes; clear on unmount so switching
  // between profiles doesn't flash stale data.
  useEffect(() => {
    if (!userId) return;
    dispatch(fetchPublicUserById(userId));
    return () => {
      dispatch(clearCurrentUser());
    };
  }, [dispatch, userId]);

  // ── Loading state ────────────────────────────────────────────────────
  if (isLoadingProfile) {
    return (
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-auto w-[92%] max-w-7xl px-4 pb-20 pt-28 sm:pt-32"
      >
        <Card className="mb-10 border-border">
          <CardContent className="flex items-center gap-5 p-6 sm:p-8">
            <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="mb-3 h-7 w-2/3" />
              <Skeleton className="mb-2 h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </CardContent>
        </Card>

        <Skeleton className="mb-6 h-7 w-60" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-6">
                <Skeleton className="mb-3 h-5 w-3/4" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  // ── Error / not-found state ──────────────────────────────────────────
  if (errorProfile || !currentUser) {
    return (
      <section
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-auto w-[92%] max-w-4xl px-4 pb-20 pt-28 sm:pt-32"
      >
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <CircleAlert className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {errorProfile || t("UserProfile.notFound", "User not found")}
          </h3>
        </div>
      </section>
    );
  }

  // ── Success state ────────────────────────────────────────────────────
  const initials = (currentUser.username || currentUser.name || "?")
    .slice(0, 2)
    .toUpperCase();

  const joinedDate = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString(
        isRTL ? "ar-EG" : "en-US",
        { year: "numeric", month: "long" }
      )
    : null;

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto w-[92%] max-w-7xl px-4 pb-20 pt-28 sm:pt-32"
    >
      {/* Profile header card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mb-10 overflow-hidden rounded-2xl border border-border bg-surface"
      >
        <div className="relative px-6 py-8 sm:px-10 sm:py-10">
          {/* Soft decorative glow */}
          <div
            className={`pointer-events-none absolute ${
              isRTL ? "left-0" : "right-0"
            } top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl`}
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            <Avatar className="h-20 w-20 shrink-0 border border-border">
              <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {currentUser.name}
              </h1>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                @{currentUser.username}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground">
                  <FileQuestion className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{currentUser.publicQuizzesCount}</span>
                  <span className="text-muted-foreground">
                    {t("Users.publicExamsCount", "public exams")}
                  </span>
                </span>
                {joinedDate && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t("UserProfile.joined", "Joined")}
                    </span>
                    <span>{joinedDate}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Public quizzes section */}
      <div className="mb-6 flex items-center gap-2">
        <FileQuestion className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">
          {t("UserProfile.publicExamsSection", "Public Exams")}
        </h2>
      </div>

      {publicQuizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {t(
              "UserProfile.noPublicQuizzes",
              "This user hasn't published any public exams yet"
            )}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {publicQuizzes.map((quiz, idx) => (
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
              <Card
                onClick={() => setSelectedQuiz(quiz)}
                className="group relative h-full cursor-pointer border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <CardContent className="flex h-full flex-col p-6">
                  <div className="flex-1">
                    <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {quiz.title}
                    </h3>
                    {quiz.description && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {quiz.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <FileQuestion className="h-3.5 w-3.5" />
                      <span className="font-medium text-foreground">
                        {quiz.questions?.length ?? 0}
                      </span>
                      <span>{t("Quiz.question", "questions")}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <UserIcon className="h-3.5 w-3.5" />
                      <span className="font-medium text-foreground">
                        {quiz.time}
                      </span>
                      <span>{t("Quiz.minutes", "min")}</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedQuiz && (
        <QuizDetailsModal
          isOpen
          quiz={selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
        />
      )}
    </section>
  );
};

export default UserProfile;