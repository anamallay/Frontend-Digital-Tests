import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  X,
  Share2,
  BookmarkPlus,
  BookmarkCheck,
  HelpCircle,
  Clock,
  Calendar,
  Globe,
  Lock,
  User as UserIcon,
} from "lucide-react";

import { QuizType } from "../../../types/QuizType";
import { isPopulatedUser } from "../../../types/UserType";
import { AppDispatch, RootState } from "../../../reducer/store/store";
import {
  shareQuizWithCandidate,
  addPublicQuizToLibrary,
  fetchUserLibrary,
} from "../../../reducer/action/librariesSlice";

import ShareLinkModal from "./ShareLinkModal";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface QuizDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizType | null;
}

const QuizDetailsModal: React.FC<QuizDetailsModalProps> = ({
  isOpen,
  onClose,
  quiz,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const isSharing = useSelector(
    (state: RootState) => state.library.isLoading
  );

  const [quizLink, setQuizLink] = useState<string | null>(null);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Check if the quiz is already in the user's library when opening
  useEffect(() => {
    if (!isOpen || !quiz) return;
    (async () => {
      try {
        const library = await dispatch(fetchUserLibrary()).unwrap();
        const added = library.find((item: QuizType) => item._id === quiz._id);
        setIsAdded(Boolean(added));
      } catch {
        // Error is surfaced via `state.library.error`.
      }
    })();
  }, [isOpen, quiz?._id, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleShareQuiz = async () => {
    if (!quiz) return;
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
      setQuizLink(link);
      setOpenShareModal(true);
    } catch {
      // Error is surfaced via `state.library.error`.
    }
  };

  const handleAddQuizToLibrary = async () => {
    if (!quiz || isAdding || isAdded) return;
    setIsAdding(true);
    try {
      await dispatch(addPublicQuizToLibrary(quiz._id)).unwrap();
      setIsAdded(true);
    } catch {
      // Error is surfaced via `state.library.error`.
    } finally {
      setIsAdding(false);
    }
  };

  const creator = isPopulatedUser(quiz?.user) ? quiz.user : null;
  const creatorName =
    creator?.name ||
    creator?.username ||
    t("PublicQuiz.unknown_user");
  const initials = (creator?.username || creator?.name || "?")
    .slice(0, 2)
    .toUpperCase();

  const isPublic = quiz?.visibility === "public";

  const content = (
    <AnimatePresence>
      {isOpen && quiz && (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quiz-details-title"
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
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <h2
                  id="quiz-details-title"
                  className="text-lg font-semibold tracking-tight text-foreground"
                >
                  {t("QuizDetailsModal.title")}
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
              {/* Visibility badge + quiz title */}
              <div className="mb-1">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    isPublic
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isPublic ? (
                    <Globe className="h-3 w-3" />
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                  {isPublic
                    ? t("Modals.CreateQuizModal.publicOption")
                    : t("Modals.CreateQuizModal.privateOption")}
                </span>
              </div>
              <h3 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
                {quiz.title}
              </h3>

              {/* Description */}
              {quiz.description && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {quiz.description}
                </p>
              )}

              {/* Stat chips */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{quiz.questions?.length ?? 0}</span>
                  <span className="text-muted-foreground">
                    {t("QuizDetailsModal.questions")}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{quiz.time}</span>
                  <span className="text-muted-foreground">
                    {t("QuizDetailsModal.minutes")}
                  </span>
                </span>
                {quiz.createdAt && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      {new Date(quiz.createdAt).toLocaleDateString(
                        isRTL ? "ar-EG" : "en-US"
                      )}
                    </span>
                  </span>
                )}
              </div>

              {/* Creator */}
              {quiz?.user && (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "QuizDetailsModal.labelCreatedBy",
                        "Created by"
                      )}
                    </p>
                    <p className="truncate text-sm font-medium text-foreground">
                      {creatorName}
                    </p>
                  </div>
                  <UserIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/30 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleShareQuiz}
                disabled={isSharing}
              >
                <Share2 className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("QuizDetailsModal.shareButton")}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                >
                  {t("QuizDetailsModal.closeButton")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={isAdded ? "secondary" : "default"}
                  onClick={handleAddQuizToLibrary}
                  disabled={isAdding || isAdded}
                >
                  {isAdded ? (
                    <>
                      <BookmarkCheck
                        className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`}
                      />
                      {t("QuizDetailsModal.addedLabel")}
                    </>
                  ) : (
                    <>
                      <BookmarkPlus
                        className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`}
                      />
                      {t(
                        "QuizDetailsModal.addQuizTooltip",
                        "Add to library"
                      )}
                    </>
                  )}
                </Button>
              </div>
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
      {quizLink && (
        <ShareLinkModal
          isOpen={openShareModal}
          onClose={() => setOpenShareModal(false)}
          quizLink={quizLink}
        />
      )}
    </>
  );
};

export default QuizDetailsModal;