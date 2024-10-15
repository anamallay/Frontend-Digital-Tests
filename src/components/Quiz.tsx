import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddIcon from "../assets/Icons/add.png";
import EditIcon from "../assets/Icons/edit.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareFromSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { AppDispatch, RootState } from "../reducer/store/store";
import { fetchUserQuizzes, updateQuiz } from "../reducer/action/quizzesSlice";
import { QuizType } from "../types/QuizType";
import Loading from "../layout/Loading";
import EditQuestionsModal from "./Modals/Questions/EditQuestionsModal";
import DeleteQuizModal from "./Modals/Quizzes/DeleteQuizModal";
import CreateQuizModal from "./Modals/Quizzes/CreateQuizModal";
import ShareLinkModal from "./Modals/Quizzes/ShareLinkModal";
import { shareQuizWithCandidate } from "../reducer/action/librariesSlice";
import EditQuizModal from "./Modals/Quizzes/EditQuizModal";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import i18n from "../utils/i18n";

const Quiz: React.FC = () => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const { quizzes, isLoading } = useSelector(
    (state: RootState) => state.quizzes
  );

  const [openStartModal, setOpenStartModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizType | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [quizLink, setQuizLink] = useState<string | null>(null);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [isEditQuizModalOpen, setIsEditQuizModalOpen] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState<QuizType | null>(null);

  useEffect(() => {
    dispatch(fetchUserQuizzes());
  }, [dispatch]);

  const handleStartExam = (quiz: QuizType) => {
    setSelectedQuiz(quiz);
    setOpenStartModal(true);
  };

  const handleConfirmStart = () => {
    setOpenStartModal(false);
  };

  const handleOpenDeleteModal = (quizId: string) => {
    setQuizToDelete(quizId);
    setShowDeleteModal(true);
  };

  const handleShareQuiz = async (quiz: QuizType) => {
    try {
      let link: string = "";

      if (quiz.visibility === "private") {
        const response = await dispatch(
          shareQuizWithCandidate({ quizId: quiz._id })
        ).unwrap();
        link = response.quizLink;
      } else if (quiz.visibility === "public") {
        const frontendUrl = window.location.origin;
        link = `${frontendUrl}/dashboard/add-quiz-to-library/${quiz._id}`;
      }

      setQuizLink(link || "");
      setOpenShareModal(true);
    } catch (error) {
      console.error("Failed to generate quiz link", error);
    }
  };

  const handleOpenEditQuizModal = (quiz: QuizType) => {
    setQuizToEdit(quiz);
    setIsEditQuizModalOpen(true);
  };

  const handleQuizUpdate = (updatedQuiz: QuizType) => {
    dispatch(updateQuiz({ quizId: updatedQuiz._id, updatedData: updatedQuiz }));
    setIsEditQuizModalOpen(false);
  };

  return (
    <div className="text-secondary">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 z-50">
          <Loading />
        </div>
      )}
      <div
        className="text-secondary flex flex-col items-center justify-start px-2"
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
        <div className="flex items-center justify-between w-full px-6 py-4 relative container">
          <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold mx-auto">
            {t("Quiz.title")}
          </h1>
          <button
            className="flex items-center text-white py-2 px-4 rounded-lg transition-colors"
            onClick={() => setOpenCreateModal(true)}
          >
            <img
              src={AddIcon}
              alt={t("Quiz.addQuiz")}
              className="w-10 h-10 mr-2"
            />
          </button>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="w-full max-w-6xl mx-auto space-y-4">
            {quizzes?.length > 0 ? (
              quizzes.map((quiz) => (
                <li
                  key={quiz._id}
                  className="relative bg-backgroundInner text-secondary p-4 sm:p-6 shadow-md transition-transform transform hover:scale-105 cursor-pointer border border-primaryLighter rounded-lg mx-auto"
                >
                  {/* Share Button Positioned at Top Right */}
                  <div
                    className={`absolute top-4 ${isRTL ? "left-4" : "right-4"}`}
                  >
                    <button onClick={() => handleShareQuiz(quiz)}>
                      <FontAwesomeIcon
                        icon={faShareFromSquare}
                        flip="horizontal"
                        style={{ color: "#23ab49" }}
                        className="w-8 h-8 sm:w-10 sm:h-10"
                      />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="flex-grow">
                    <div className="flex items-center mb-4 justify-start">
                      <>
                        {/* Responsive heading */}
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">
                          {quiz.title}
                        </h2>
                        <button
                          onClick={() => handleOpenEditQuizModal(quiz)}
                          className="mr-2 ml-2"
                        >
                          <FontAwesomeIcon
                            icon={faPen}
                            style={{ color: "#6EBD6A" }}
                            className="h-5 w-5 sm:h-6 sm:w-6"
                          />
                        </button>
                      </>
                    </div>

                    {/* Responsive text for quiz details */}
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <p className="text-xs sm:text-sm lg:text-base text-secondaryDarker mb-1">
                        {t("Quiz.numberOfQuestions")}{" "}
                        <span className="text-thirdColor">
                          {quiz.questions?.length ?? 0}
                        </span>{" "}
                        {t("Quiz.question")}
                      </p>
                      <p className="text-xs sm:text-sm lg:text-base text-secondaryDarker mb-1">
                        {t("Quiz.description")}{" "}
                        <span className="text-thirdColor">
                          {quiz.description}
                        </span>
                      </p>
                      <p className="text-xs sm:text-sm lg:text-base text-secondaryDarker mb-1">
                        {t("Quiz.time")}{" "}
                        <span className="text-thirdColor">{quiz.time}</span>{" "}
                        {t("Quiz.minutes")}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between mt-4">
                    {isRTL ? (
                      <>
                        {/* For RTL (Arabic) - Edit on the right, Delete on the left */}
                        <button
                          onClick={() => handleStartExam(quiz)}
                          className="ml-4"
                        >
                          <img
                            src={EditIcon}
                            alt={t("Quiz.editQuiz")}
                            className="w-8 h-8 sm:w-10 sm:h-10"
                          />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(quiz._id)}
                          className="mr-4"
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            style={{ color: "#fe324b" }}
                            className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8"
                            title={t("Quiz.deleteQuiz")}
                          />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* For LTR (English) - Edit on the left, Delete on the right */}
                        <button
                          onClick={() => handleStartExam(quiz)}
                          className="mr-4"
                        >
                          <img
                            src={EditIcon}
                            alt={t("Quiz.editQuiz")}
                            className="w-8 h-8 sm:w-10 sm:h-10"
                          />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(quiz._id)}
                          className="ml-4"
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            style={{ color: "#fe324b" }}
                            className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8"
                            title={t("Quiz.deleteQuiz")}
                          />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="text-secondary text-center col-span-full">
                {t("Quiz.noQuizzesFound")}
              </li>
            )}
          </ul>
        </div>

        {/* Modals */}
        <EditQuestionsModal
          quiz={selectedQuiz}
          isOpen={openStartModal}
          onClose={() => setOpenStartModal(false)}
          onConfirm={handleConfirmStart}
        />

        {showDeleteModal && quizToDelete && (
          <DeleteQuizModal
            quizId={quizToDelete}
            onClose={() => setShowDeleteModal(false)}
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
            isOpen={openShareModal}
            onClose={() => setOpenShareModal(false)}
            quizLink={quizLink}
          />
        )}

        {quizToEdit && (
          <EditQuizModal
            quiz={quizToEdit}
            isOpen={isEditQuizModalOpen}
            onClose={() => setIsEditQuizModalOpen(false)}
            onUpdate={handleQuizUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default Quiz;
