import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { QuestionType } from "../../../types/QuestionType";
import { AppDispatch } from "../../../reducer/store/store";
import { updateQuestionInQuiz } from "../../../reducer/action/questionsSlice";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";

interface EditQuestionDetailModalProps {
  question: QuestionType | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditQuestionDetailModal: React.FC<EditQuestionDetailModalProps> = ({
  question,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();

  const [editedQuestion, setEditedQuestion] = useState<string>("");
  const [editedOptions, setEditedOptions] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);
  const [editedCorrectOption, setEditedCorrectOption] = useState<number>(0);

  useEffect(() => {
    if (question) {
      setEditedQuestion(question.question);
      setEditedOptions(question.options);
      setEditedCorrectOption(question.correctOption);
    }
  }, [question]);

  if (!isOpen || !question) return null;

  const handleUpdateQuestion = () => {
    if (question) {
      const updatedData = {
        question: editedQuestion,
        options: editedOptions,
        correctOption: editedCorrectOption,
      };
      dispatch(
        updateQuestionInQuiz({
          questionId: question._id,
          questionData: updatedData,
        })
      )
        .unwrap()
        .then(() => {
          onClose();
        })
        .catch((error) => {
          console.error("Failed to update question: ", error);
        });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-backgroundInner shadow-lg p-8 w-full max-w-xl border border-primaryLighter rounded-lg">
            <h2
              className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 text-secondary ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("Modals.EditQuestionDetailModal.title")}
            </h2>

            <div className="mb-4">
              <h3
                className={`text-base md:text-lg font-medium text-secondary ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("Modals.EditQuestionDetailModal.questionLabel")}
              </h3>

              <input
                type="text"
                value={editedQuestion}
                onChange={(e) => setEditedQuestion(e.target.value)}
                className={`border border-gray-300 rounded-lg p-2 w-full mb-2 text-sm md:text-base text-black focus:ring-2 focus:outline-none focus:ring-primary focus:border-primary ${
                  isRTL ? "text-right" : "text-left"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              />

              <h4
                className={`text-sm md:text-md font-medium mb-2 text-secondary ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("Modals.EditQuestionDetailModal.optionsLabel")}
              </h4>

              {editedOptions.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const updatedOptions = [...editedOptions];
                    updatedOptions[index] = e.target.value;
                    setEditedOptions(updatedOptions);
                  }}
                  className={`border border-gray-300 rounded-lg p-2 w-full mb-2 text-sm md:text-base text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              ))}

              <h4
                className={`text-sm md:text-md font-medium mt-4 mb-2 text-secondary ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("Modals.EditQuestionDetailModal.correctOptionLabel")}
              </h4>

              <select
                value={editedCorrectOption}
                onChange={(e) => setEditedCorrectOption(Number(e.target.value))}
                className={`border border-gray-300 rounded-lg p-2 w-full text-sm md:text-base text-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                  isRTL ? "text-right" : "text-left"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              >
                {editedOptions.map((_, index) => (
                  <option key={index} value={index}>
                    {t("Modals.EditQuestionDetailModal.correctOptionValue", {
                      optionNumber: index + 1,
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={handleUpdateQuestion}
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-2 py-2 md:px-4 md:py-2 text-sm md:text-base transition-colors"
              >
                {t("Modals.EditQuestionDetailModal.updateButton")}
              </button>
              <button
                onClick={onClose}
                className="py-2 px-2 md:px-4 bg-white text-black font-medium rounded-lg shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-opacity-50 text-sm md:text-base"
              >
                {t("Modals.EditQuestionDetailModal.closeButton")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionDetailModal;
