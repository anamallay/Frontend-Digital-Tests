import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchExaminerQuizScores,
  clearExaminerScores,
  deleteScore,
} from "../reducer/action/scoresSlice";
import { AppDispatch, RootState } from "../reducer/store/store";
import Loading from "../layout/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faEye } from "@fortawesome/free-solid-svg-icons";
import DeleteScoreModal from "./Modals/Scores/DeleteScoreModal";
import { useTranslation } from "react-i18next";
import i18n from "../utils/i18n";

const Score = () => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { examinerScores, isLoadingExaminer, errorExaminer } = useSelector(
    (state: RootState) => state.scores
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
    setIsModalOpen(true);
    setCurrentScoreId(scoreId);
  };

  const handleConfirmDelete = () => {
    if (currentScoreId) {
      dispatch(deleteScore(currentScoreId));
    }
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
    <div
      className="text-secondary flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-10"
      style={{ direction: isRTL ? "rtl" : "ltr" }}
    >
      {/* Responsive heading */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-8 lg:mb-10 mx-auto">
        {t("Score.examinerQuizResults")}
      </h1>

      {isLoadingExaminer ? (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 z-50">
          <Loading />
        </div>
      ) : errorExaminer ? (
        <p className="text-red-500 text-center">{errorExaminer}</p>
      ) : examinerScores.length === 0 ? (
        <p className="text-white text-center">
          {t("Score.noResultsAvailable")}
        </p>
      ) : (
        <ul className="w-full max-w-3xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
          {examinerScores.map((score) => {
            const quiz = Array.isArray(score.quiz) ? score.quiz[0] : score.quiz;
            const user = Array.isArray(score.user) ? score.user[0] : score.user;

            return (
              <li
                key={score._id}
                className="relative bg-backgroundInner text-secondary p-4 sm:p-6 shadow-lg flex flex-col justify-between h-full transition-transform transform hover:scale-105 hover:shadow-xl border border-primaryLighter rounded-lg"
              >
                {/* Responsive quiz title */}
                <h2
                  className={`text-lg sm:text-xl lg:text-2xl font-semibold text-secondary mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <span className="text-white">{quiz?.title}</span>
                </h2>

                {/* Responsive details */}
                <p
                  className={`text-sm sm:text-base lg:text-lg text-secondaryDarker ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("Score.score")}:{" "}
                  <span className="text-primary">{score.score}%</span>
                </p>
                <p
                  className={`text-sm sm:text-base lg:text-lg text-secondaryDarker ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("Score.totalQuestions")}:{" "}
                  <span className="text-thirdColor">
                    {score.totalQuestions}
                  </span>
                </p>
                <p
                  className={`text-sm sm:text-base lg:text-lg text-secondaryDarker ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("Score.correctAnswers")}:{" "}
                  <span className="text-thirdColor">
                    {score.correctAnswers}
                  </span>
                </p>
                <p
                  className={`text-sm sm:text-base lg:text-lg text-secondaryDarker mt-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("Score.username")}:{" "}
                  <span className="text-blue-400">
                    {"@"}
                    {user?.name}
                    {user?.username}
                  </span>
                </p>

                {/* Responsive buttons */}
                <button
                  onClick={() => handleDeleteScore(score._id)}
                  className={`absolute bottom-3 sm:bottom-4 lg:bottom-6 ${
                    isRTL ? "left-5" : "right-5"
                  } text-red-600 hover:text-red-800 text-lg sm:text-xl lg:text-2xl`}
                >
                  <FontAwesomeIcon
                    icon={faXmark}
                    className="text-2xl sm:text-3xl"
                  />
                </button>
                <button
                  onClick={() => handleViewScore(score._id)}
                  className={`absolute bottom-3 sm:bottom-4 lg:bottom-6 ${
                    isRTL ? "left-14" : "right-14"
                  } text-blue-400 hover:text-blue-300 text-lg sm:text-xl lg:text-2xl`}
                >
                  <FontAwesomeIcon
                    icon={faEye}
                    className="text-2xl sm:text-3xl"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <DeleteScoreModal
        isOpen={isModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Score;
