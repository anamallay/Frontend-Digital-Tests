import React from "react";
import { useNavigate } from "react-router-dom";
import { QuizType } from "../../../types/QuizType";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";

interface QuizStartModalProps {
  quiz: QuizType | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const QuizStartModal: React.FC<QuizStartModalProps> = ({
  quiz,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  if (!isOpen || !quiz) return null;

  const handleStartQuiz = () => {
    onConfirm();
    navigate(`/dashboard/library/${quiz._id}`);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-backgroundInner overflow-hidden shadow-xl transform transition-all w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl border border-primaryLighter rounded-lg">
            <div className="p-6">
              <h3
                className={`text-lg leading-6 font-medium text-secondary ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("Modals.QuizStartModal.startQuizTitle", {
                  quizTitle: quiz.title,
                })}
              </h3>
              <div className="mt-4 space-y-6">
                <p
                  className={`text-sm text-secondary ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t("Modals.QuizStartModal.confirmationMessage")}
                </p>
              </div>
            </div>
            <div className="px-4 py-3 sm:px-6 sm:flex">
              <button
                type="button"
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primaryLighter sm:w-auto sm:text-sm ${
                  isRTL ? "ml-3" : "mr-3"
                }`}
                onClick={handleStartQuiz}
              >
                {t("Modals.QuizStartModal.confirmButton")}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-100 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                {t("Modals.QuizStartModal.cancelButton")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizStartModal;
