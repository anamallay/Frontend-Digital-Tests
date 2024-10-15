import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../reducer/store/store";
import {
  fetchUserQuizzes,
  updateQuiz,
} from "../../../reducer/action/quizzesSlice";
import { QuizType } from "../../../types/QuizType";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";

interface EditQuizModalProps {
  quiz: QuizType | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedQuiz: QuizType) => void;
}

const EditQuizModal: React.FC<EditQuizModalProps> = ({
  quiz,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();

  const [quizTitle, setQuizTitle] = useState(quiz?.title || "");
  const [quizDescription, setQuizDescription] = useState(
    quiz?.description || ""
  );
  const [quizTime, setQuizTime] = useState(quiz?.time || 0);
  const [quizVisibility, setQuizVisibility] = useState(
    quiz?.visibility || "public"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (quiz) {
      setQuizVisibility(quiz.visibility);
      setQuizTitle(quiz.title);
      setQuizDescription(quiz.description);
      setQuizTime(quiz.time);
    }
  }, [quiz]);

  const handleUpdateQuiz = () => {
    if (quiz && quizTitle.trim()) {
      setIsLoading(true);

      const updatedData = {
        title: quizTitle,
        description: quizDescription,
        time: quizTime,
        visibility: quizVisibility,
      };

      dispatch(updateQuiz({ quizId: quiz._id, updatedData }))
        .unwrap()
        .then(() => {
          setIsLoading(false);
          setErrorMessage(null);

          dispatch(fetchUserQuizzes());
          onUpdate({ ...quiz, ...updatedData });
          onClose();
        })
        .catch((error) => {
          setIsLoading(false);
          setErrorMessage(t("Modals.EditQuizModal.errorMessage"));
          console.error("Error updating quiz:", error);
        });
    }
  };

  const handleToggleVisibility = () => {
    setQuizVisibility((prev) => (prev === "public" ? "private" : "public"));
  };

  if (!isOpen || !quiz) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div
        className={`bg-backgroundInner shadow-lg p-6 xs:p-8 md:p-10 w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl relative border border-primaryLighter rounded-lg`}
      >
        <h2
          className={`text-xl xs:text-2xl lg:text-3xl font-bold mb-4 xs:mb-6 text-secondary ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("Modals.EditQuizModal.title")}
        </h2>

        {/* Error Message */}
        {errorMessage && (
          <p className="text-red-500 mb-3 xs:mb-4 text-xs xs:text-sm">
            {errorMessage}
          </p>
        )}

        {/* Title Input */}
        <label
          htmlFor="quizTitle"
          className={`block text-xs xs:text-sm font-medium text-white mb-1 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("Modals.EditQuizModal.quizTitleLabel")}
        </label>
        <input
          type="text"
          id="quizTitle"
          placeholder={t("Modals.EditQuizModal.quizTitlePlaceholder")}
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full mb-4 text-black text-sm focus:ring-2 focus:ring-primaryLighter"
        />

        {/* Description Input */}
        <label
          htmlFor="quizDescription"
          className={`block text-xs xs:text-sm font-medium text-white mb-1 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("Modals.EditQuizModal.quizDescriptionLabel")}
        </label>
        <textarea
          id="quizDescription"
          placeholder={t("Modals.EditQuizModal.quizDescriptionPlaceholder")}
          value={quizDescription}
          onChange={(e) => setQuizDescription(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full mb-4 text-black text-sm focus:ring-2 focus:ring-primaryLighter"
        />

        {/* Time Input */}
        <label
          htmlFor="quizTime"
          className={`block text-xs xs:text-sm font-medium text-white mb-1 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("Modals.EditQuizModal.quizTimeLabel")}
        </label>
        <div className="py-2 px-3 bg-gray-100 rounded-lg mb-4">
          <div
            className={`w-full flex items-center gap-x-5 ${
              isRTL ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {isRTL ? (
              <>
                <div className="grow">
                  <input
                    type="number"
                    id="quizTime"
                    placeholder={t("Modals.EditQuizModal.quizTimePlaceholder")}
                    value={quizTime}
                    onChange={(e) => setQuizTime(Number(e.target.value))}
                    min={1}
                    className={`w-full p-0 bg-transparent border-0 text-gray-800 focus:outline-none focus:ring-0 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    required
                  />
                </div>
                <div
                  className={`flex justify-end items-center gap-x-1.5 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <button
                    type="button"
                    className="size-6 inline-flex justify-center items-center text-sm font-medium rounded-md border border-green-600 bg-green-500 text-white"
                    aria-label="Decrease"
                    onClick={() =>
                      setQuizTime((prev) => (prev > 1 ? prev - 1 : 1))
                    }
                  >
                    <svg
                      className="shrink-0 size-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="size-6 inline-flex justify-center items-center text-sm font-medium rounded-md border border-green-600 bg-green-500 text-white"
                    aria-label="Increase"
                    onClick={() => setQuizTime((prev) => prev + 1)}
                  >
                    <svg
                      className="shrink-0 size-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14"></path>
                      <path d="M12 5v14"></path>
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  className={`flex justify-end items-center gap-x-1.5 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <button
                    type="button"
                    className="size-6 inline-flex justify-center items-center text-sm font-medium rounded-md border border-green-600 bg-green-500 text-white"
                    aria-label="Decrease"
                    onClick={() =>
                      setQuizTime((prev) => (prev > 1 ? prev - 1 : 1))
                    }
                  >
                    <svg
                      className="shrink-0 size-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="size-6 inline-flex justify-center items-center text-sm font-medium rounded-md border border-green-600 bg-green-500 text-white"
                    aria-label="Increase"
                    onClick={() => setQuizTime((prev) => prev + 1)}
                  >
                    <svg
                      className="shrink-0 size-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14"></path>
                      <path d="M12 5v14"></path>
                    </svg>
                  </button>
                </div>

                <div className="grow">
                  <input
                    type="number"
                    id="quizTime"
                    placeholder={t("Modals.EditQuizModal.quizTimePlaceholder")}
                    value={quizTime}
                    onChange={(e) => setQuizTime(Number(e.target.value))}
                    min={1}
                    className={`w-full p-0 bg-transparent border-0 text-gray-800 focus:outline-none focus:ring-0 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    required
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <p
          className={`text-gray-500 text-xs xs:text-sm mb-4 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("Modals.EditQuizModal.timeInputHint")}
        </p>

        {/* Visibility Toggle */}
        <label
          htmlFor="quizVisibility"
          className={`block text-xs xs:text-sm font-medium text-white mb-2 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("Modals.EditQuizModal.visibilityLabel")}
        </label>
        <label className="flex cursor-pointer items-center">
          <div className="relative">
            <input
              type="checkbox"
              checked={quizVisibility === "private"}
              onChange={handleToggleVisibility}
              className="sr-only"
            />
            <div
              className={`block h-7 w-14 rounded-full transition-colors ${
                quizVisibility === "private" ? "bg-primary" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`dot absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                quizVisibility === "private" ? "translate-x-7" : ""
              }`}
            ></div>
          </div>
          <span className="ms-3 text-xs xs:text-sm font-medium">
            {quizVisibility === "public"
              ? t("Modals.EditQuizModal.visibilityPublic")
              : t("Modals.EditQuizModal.visibilityPrivate")}
          </span>
        </label>

        {/* Save & Cancel Buttons */}
        <div
          className={`flex ${
            isRTL ? "space-x-reverse" : ""
          } space-x-4 justify-end mt-6`}
        >
          {isRTL ? (
            <>
              <button
                onClick={handleUpdateQuiz}
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primaryLighter w-auto sm:text-sm"
                disabled={isLoading}
              >
                {t("Modals.EditQuizModal.saveChangesButton")}
              </button>
              <button
                onClick={onClose}
                className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-black font-medium shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger w-auto sm:text-sm"
                disabled={isLoading}
              >
                {t("Modals.EditQuizModal.cancelButton")}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-black font-medium shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger w-auto sm:text-sm"
                disabled={isLoading}
              >
                {t("Modals.EditQuizModal.cancelButton")}
              </button>
              <button
                onClick={handleUpdateQuiz}
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primaryLighter w-auto sm:text-sm"
                disabled={isLoading}
              >
                {t("Modals.EditQuizModal.saveChangesButton")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditQuizModal;
