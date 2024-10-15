import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { QuizType } from "../../../types/QuizType";
import { AppDispatch, RootState } from "../../../reducer/store/store";
import {
  addQuestion,
  deleteQuestion,
  fetchQuestionsByQuizId,
} from "../../../reducer/action/questionsSlice";
import Loading from "../../../layout/Loading";
import { fetchUserQuizzes } from "../../../reducer/action/quizzesSlice";
import { QuestionType } from "../../../types/QuestionType";
import EditQuestionDetailModal from "./EditQuestionDetailModal";
import DeleteQuestionModal from "./DeleteQuestionModal";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";

interface EditQuestionsModalProps {
  quiz: QuizType | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const EditQuestionsModal: React.FC<EditQuestionsModalProps> = ({
  quiz,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const { questions, isLoading, error } = useSelector(
    (state: RootState) => state.questions
  );
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionType | null>(
    null
  );
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  const [newQuestion, setNewQuestion] = useState<string>("");
  const [newOptions, setNewOptions] = useState<string[]>(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState<number>(0);

  const [localQuiz, setLocalQuiz] = useState<QuizType | null>(quiz);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  useEffect(() => {
    setLocalQuiz(quiz);
    if (quiz && isOpen) {
      dispatch(fetchQuestionsByQuizId(quiz._id));
    }
  }, [dispatch, quiz, isOpen]);

  const handleAddQuestion = () => {
    if (newQuestion.trim() && quiz) {
      const questionData = {
        quizId: quiz._id,
        question: newQuestion,
        options: newOptions,
        correctOption,
      };

      dispatch(addQuestion(questionData))
        .unwrap()
        .then(() => {
          setNewQuestion("");
          setNewOptions(["", "", "", ""]);
          setCorrectOption(0);

          dispatch(fetchUserQuizzes());
        })
        .catch((error) => {
          console.error("Error adding question: ", error);
        });
    }
  };

  const handleDeleteQuestion = (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuestionToDelete(questionId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteQuestion = () => {
    if (quiz && questionToDelete) {
      dispatch(
        deleteQuestion({ quizId: quiz._id, questionId: questionToDelete })
      ).then(() => {
        dispatch(fetchQuestionsByQuizId(quiz._id));
        setIsDeleteModalOpen(false);
        setQuestionToDelete(null);
      });
    }
  };

  const handleSelectQuestion = (questionId: string) => {
    const question = questions.find((q) => q._id === questionId);
    if (question) {
      setSelectedQuestion(question);
      setIsQuestionModalOpen(true);
    }
  };

  const closeQuestionModal = () => {
    setIsQuestionModalOpen(false);
    setSelectedQuestion(null);
  };

  if (!isOpen || !quiz) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-backgroundInner shadow-lg p-8 w-full max-w-md md:max-w-lg lg:max-w-2xl relative border border-primaryLighter rounded-lg">
        <h2
          className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 text-secondary ${
            isRTL ? "text-right" : "text-left"
          }`}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {t("Modals.EditQuestionsModal.editQuizTitle", {
            quizTitle: localQuiz?.title,
          })}
        </h2>

        <div className="mb-4">
          {isLoading ? (
            <Loading />
          ) : error ? (
            <p className="text-red-500 font-semibold">
              {t("Modals.EditQuestionsModal.loadingError", {
                error: typeof error === "string" ? error : error.message,
              })}
            </p>
          ) : (
            <div
              className={`mb-6 ${
                questions.length > 3
                  ? "max-h-44 overflow-y-auto space-y-3 custom-scrollbar"
                  : "max-h-auto"
              }`}
              style={{
                paddingLeft: "24px",
                marginLeft: "-8px",
                scrollbarGutter: "stable",
              }}
            >
              <div className="pr-4">
                {Array.isArray(questions) && questions.length > 0 ? (
                  <ul className="space-y-3">
                    {questions.map((question) => (
                      <li
                        key={question._id}
                        onClick={() => handleSelectQuestion(question._id)}
                        className="flex justify-between items-center bg-secondary text-gray-700 p-4 shadow-sm cursor-pointer border-2 border-primaryLighter rounded-lg"
                      >
                        {isRTL ? (
                          <>
                            {/* In LTR, question text comes first */}
                            <span className="text-gray-700 font-medium text-left mr-3">
                              {question.question}
                            </span>
                            <button
                              onClick={(e) =>
                                handleDeleteQuestion(question._id, e)
                              }
                              className="text-red-600 font-semibold"
                            >
                              {t("Modals.EditQuestionsModal.deleteButton")}
                            </button>
                          </>
                        ) : (
                          <>
                            {/* In RTL, delete button comes first */}
                            <button
                              onClick={(e) =>
                                handleDeleteQuestion(question._id, e)
                              }
                              className="text-red-600 font-semibold ml-3"
                            >
                              {t("Modals.EditQuestionsModal.deleteButton")}
                            </button>
                            <span className="text-gray-700 font-medium text-right">
                              {question.question}
                            </span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p
                    className={`text-gray-500 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    {t("Modals.EditQuestionsModal.noQuestionsFound")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mb-4 text-gray-700">
          <h3
            className={`text-md md:text-lg font-medium mb-2 text-secondary ${
              isRTL ? "text-right" : "text-left"
            }`}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {t("Modals.EditQuestionsModal.addNewQuestionTitle")}
          </h3>

          <input
            type="text"
            placeholder={t("Modals.EditQuestionsModal.addNewQuestionTitle")}
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className={`border border-gray-300 rounded-lg p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
              isRTL ? "text-right" : "text-left"
            }`}
            dir={isRTL ? "rtl" : "ltr"}
          />

          <h3
            className={`text-base md:text-md font-medium mb-2 text-secondary ${
              isRTL ? "text-right" : "text-left"
            }`}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {t("Modals.EditQuestionsModal.addOptionsTitle")}
          </h3>

          {newOptions.map((option, index) => (
            <input
              key={index}
              type="text"
              placeholder={t("Modals.EditQuestionsModal.correctOption", {
                optionNumber: index + 1,
              })}
              value={option}
              onChange={(e) => {
                const updatedOptions = [...newOptions];
                updatedOptions[index] = e.target.value;
                setNewOptions(updatedOptions);
              }}
              className={`border border-gray-300 rounded-lg p-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                isRTL ? "text-right" : "text-left"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            />
          ))}

          <h3
            className={`text-base md:text-md font-medium mb-2 text-secondary ${
              isRTL ? "text-right" : "text-left"
            }`}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {t("Modals.EditQuestionsModal.chooseCorrectAnswerTitle")}
          </h3>

          <select
            value={correctOption}
            onChange={(e) => setCorrectOption(Number(e.target.value))}
            className={`border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
              isRTL ? "text-right" : "text-left"
            }`}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {newOptions.map((_, index) => (
              <option key={index} value={index}>
                {t("Modals.EditQuestionsModal.correctOption", {
                  optionNumber: index + 1,
                })}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between mt-6">
          {isRTL ? (
            <>
              {/* In LTR, Add button comes first */}
              <button
                onClick={handleAddQuestion}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primaryLighter sm:w-auto sm:text-sm"
              >
                {t("Modals.EditQuestionsModal.addQuestionButton")}
              </button>
              <button
                onClick={onClose}
                className="py-2 px-4 bg-white text-black font-medium rounded-lg shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-opacity-50"
              >
                {t("Modals.EditQuestionsModal.cancelButton")}
              </button>
            </>
          ) : (
            <>
              {/* In RTL, Cancel button comes first */}
              <button
                onClick={onClose}
                className="py-2 px-4 bg-white text-black font-medium rounded-lg shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-opacity-50 ml-2"
              >
                {t("Modals.EditQuestionsModal.cancelButton")}
              </button>
              <button
                onClick={handleAddQuestion}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primaryLighter sm:w-auto sm:text-sm"
              >
                {t("Modals.EditQuestionsModal.addQuestionButton")}
              </button>
            </>
          )}
        </div>
      </div>
      <DeleteQuestionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteQuestion}
      />

      <EditQuestionDetailModal
        question={selectedQuestion}
        isOpen={isQuestionModalOpen}
        onClose={closeQuestionModal}
      />
    </div>
  );
};

export default EditQuestionsModal;
