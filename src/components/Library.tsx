import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faEye } from "@fortawesome/free-solid-svg-icons";
import { AppDispatch, RootState } from "../reducer/store/store";
import { QuizType } from "../types/QuizType";
import { fetchUserScores } from "../reducer/action/scoresSlice";
import { ScoreType } from "../types/ScoreType";
import QuizStartModal from "./Modals/Libraries/QuizStartModal";
import DeleteLibraryModal from "./Modals/Libraries/DeleteLibraryModal";
import Loading from "../layout/Loading";
import { fetchUserLibrary } from "../reducer/action/librariesSlice";
import { useTranslation } from "react-i18next";
import i18n from "../utils/i18n";

const Library: React.FC = () => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [selectedQuiz, setSelectedQuiz] = useState<QuizType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  const {
    library = [],
    isLoading: libraryLoading,
    error: libraryError,
  } = useSelector((state: RootState) => state.library);

  const { userScores: scores, isLoadingUser: scoresLoading } = useSelector(
    (state: RootState) => state.scores
  );

  const { isQuizInProgress, currentQuizId } = useSelector(
    (state: RootState) => state.quizProgress
  );

  useEffect(() => {
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

  return (
    <div
      className="flex flex-col items-center text-secondary px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-10"
      style={{ direction: isRTL ? "rtl" : "ltr" }}
    >
      {(libraryLoading || scoresLoading) && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 z-50">
          <Loading />
        </div>
      )}

      {libraryError && (
        <div className="text-red-500 text-center">
          {t("Library.loadingError")}
        </div>
      )}

      {!libraryLoading && library.length === 0 && (
        <div className="text-white text-center">{t("Library.noQuizzes")}</div>
      )}

      {!libraryLoading && library.length > 0 && (
        <div className="container">
          <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-4">
            {t("Library.libraryTitle")}
          </h1>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="grid gap-6 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {library.map((quiz) => {
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

                return (
                  <li
                    key={quiz._id}
                    className="relative bg-backgroundInner text-secondary p-6 shadow-md transition-transform transform hover:scale-105 cursor-pointer border border-primaryLighter rounded-lg"
                  >
                    <div
                      className={`flex-grow ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 text-white">
                        {quiz.title}
                      </h2>
                      <p className="text-sm sm:text-base lg:text-lg text-secondaryDarker mb-1">
                        {t("Library.createdBy")}{" "}
                        <span className="text-thirdColor">
                          {quiz.user?.name || t("Library.anonymousUser")}
                        </span>
                      </p>
                      <p className="text-sm sm:text-base lg:text-lg text-secondaryDarker mb-1">
                        {t("Library.questionsCount")}{" "}
                        <span className="text-thirdColor">
                          {quiz.questions?.length ?? 0}
                        </span>
                      </p>
                      <p className="text-sm sm:text-base lg:text-lg text-secondaryDarker mb-1">
                        {t("Library.score")}{" "}
                        <span className="text-primary">
                          {quizScore !== null
                            ? `${quizScore}%`
                            : t("Library.noScore")}
                        </span>
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        className={`px-4 py-2 text-white rounded-lg sm:max-w-xs text-sm sm:text-base lg:text-lg ${
                          !hasQuestions
                            ? "bg-gray-500 cursor-not-allowed"
                            : isCurrentQuizInProgress
                            ? "bg-yellow-500"
                            : quizScore !== null &&
                              buttonText === t("Library.submitted")
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-primary hover:bg-primaryLighter"
                        }`}
                        disabled={isButtonDisabled}
                      >
                        {buttonText}
                      </button>

                      <div className="flex items-center ml-2">
                        {userScore && (
                          <button
                            onClick={() => handleViewScore(userScore._id)}
                            className="text-blue-400 hover:text-blue-300 text-lg sm:text-xl lg:text-2xl"
                          >
                            <FontAwesomeIcon
                              icon={faEye}
                              className="text-2xl sm:text-3xl"
                            />
                          </button>
                        )}
                        <button onClick={() => handleRemoveQuiz(quiz._id)}>
                          <FontAwesomeIcon
                            icon={faXmark}
                            className={`w-8 h-8 sm:w-10 sm:h-10 text-red-500 ${
                              isRTL ? "mr-2" : "ml-2"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default Library;
