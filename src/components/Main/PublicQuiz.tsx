// src/components/Main/PublicQuiz.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  User as UserIcon,
} from "lucide-react";
import { fetchQuizzes } from "../../reducer/action/quizzesSlice";
import { AppDispatch, RootState } from "../../reducer/store/store";
import {
  addPublicQuizToLibrary,
  fetchUserLibrary,
} from "../../reducer/action/librariesSlice";
import QuizDetailsModal from "../Modals/Quizzes/QuizDetailsModal";
import { QuizType } from "../../types/QuizType";
import { isPopulatedUser } from "../../types/UserType";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LIMIT = 9;

const PublicQuiz = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();

  const { isLoggedIn } = useSelector((s: RootState) => s.users);
  const { quizzes, isLoading, totalPages } = useSelector(
    (s: RootState) => s.quizzes
  );

  const [page, setPage] = useState(1);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizType | null>(null);
  const [addedQuizzes, setAddedQuizzes] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchQuizzes({ page, limit: LIMIT }));
  }, [dispatch, page]);

  useEffect(() => {
    if (quizId) {
      const q = quizzes.find((q) => q._id === quizId);
      if (q) setSelectedQuiz(q);
    }
  }, [quizId, quizzes]);

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const library = await dispatch(fetchUserLibrary()).unwrap();
        setAddedQuizzes(library.map((q: QuizType) => q._id));
      } catch (err) {
        console.error("Failed to fetch user library", err);
      }
    })();
  }, [dispatch, isLoggedIn]);

  const handleAddPublicQuiz = async (id: string) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    try {
      await dispatch(addPublicQuizToLibrary(id)).unwrap();
      setAddedQuizzes((prev) => [...prev, id]);
    } catch (err) {
      console.error("Failed to add quiz to library", err);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) setPage(newPage);
  };

  const generatePageNumbers = (total: number, current: number) => {
    const max = 5;
    const pages: number[] = [];
    if (total <= max) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto w-[92%] max-w-7xl px-4 pb-20 pt-28 sm:pt-32"
    >
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("PublicQuiz.title", "Public Exams")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("PublicQuiz.subtitle", "Browse and save exams shared by the community")}
        </p>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-6" />
                <div className="flex justify-between pt-4 border-t border-border">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : quizzes?.length > 0 ? (
        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {quizzes.map((quiz, idx) => {
              const isAdded = addedQuizzes.includes(quiz._id);
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
                  <Card
                    onClick={() => navigate(`/public/quiz/${quiz._id}`)}
                    className="group relative h-full cursor-pointer border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <CardContent className="flex h-full flex-col p-6">
                      {/* Body */}
                      <div className="flex-1">
                        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {quiz.title || t("PublicQuiz.no_title")}
                        </h3>
                        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {quiz.description}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                            <UserIcon className="h-3 w-3 text-primary" />
                          </div>
                          <span className="font-medium">
                            {(isPopulatedUser(quiz.user) && quiz.user.username) ||
                              t("PublicQuiz.unknown_user")}
                          </span>
                        </div>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isAdded) handleAddPublicQuiz(quiz._id);
                              }}
                              disabled={isAdded}
                              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                isAdded
                                  ? "bg-primary/10 text-primary cursor-default"
                                  : "text-muted-foreground hover:bg-muted hover:text-primary"
                              }`}
                              aria-label={
                                isAdded
                                  ? t("PublicQuiz.already_added")
                                  : t("PublicQuiz.add_to_library")
                              }
                            >
                              {isAdded ? (
                                <BookmarkCheck className="h-4 w-4" />
                              ) : (
                                <Bookmark className="h-4 w-4" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {isAdded
                              ? t("PublicQuiz.already_added")
                              : t("PublicQuiz.add_to_library")}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TooltipProvider>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {t("PublicQuiz.no_quizzes")}
          </h3>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <nav
          aria-label={t("Common.pagination")}
          className="mt-12 flex items-center justify-center gap-1"
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            aria-label={t("Common.previous_page")}
            className="h-9 w-9"
          >
            {isRTL ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          {generatePageNumbers(totalPages, page).map((n, i) =>
            n === -1 ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={n}
                variant={n === page ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(n)}
                className="h-9 w-9 text-sm font-medium"
                aria-current={n === page ? "page" : undefined}
                aria-label={t("Common.page", { number: n })}
              >
                {n}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            aria-label={t("Common.next_page")}
            className="h-9 w-9"
          >
            {isRTL ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </nav>
      )}

      {selectedQuiz && (
        <QuizDetailsModal
          isOpen
          quiz={selectedQuiz}
          onClose={() => {
            setSelectedQuiz(null);
            navigate("/public");
          }}
        />
      )}
    </section>
  );
};

export default PublicQuiz;