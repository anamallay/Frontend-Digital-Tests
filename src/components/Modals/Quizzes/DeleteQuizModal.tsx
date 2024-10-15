import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../reducer/store/store";
import { deleteQuiz } from "../../../reducer/action/quizzesSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import warningIcon from "../../../assets/Icons/warning.png";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";

interface DeleteModalProps {
  quizId: string;
  onClose: () => void;
}

const DeleteQuizModal: React.FC<DeleteModalProps> = ({ quizId, onClose }) => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async () => {
    try {
      await dispatch(deleteQuiz(quizId));
      onClose();
    } catch (error) {
      console.error("Failed to delete quiz", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-backgroundInner overflow-hidden shadow-xl transform transition-all max-w-lg w-full p-6 border border-primaryLighter rounded-lg">
            <div className="text-center">
              <div className="mb-4">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="w-24 h-24 text-danger mx-auto"
                />
              </div>
              <p
                className={`text-lg text-white mb-4 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {isRTL
                  ? `${t("Modals.DeleteQuizModal.confirmationMessage")}؟`
                  : `${t("Modals.DeleteQuizModal.confirmationMessage")}?`}
              </p>

              <div className="flex items-center text-thirdColor font-semibold mb-6 bg-backgroundOuter p-4 rounded-lg flex-row-reverse">
                <p
                  className={`${isRTL ? "text-right" : "text-left"} ${
                    isRTL ? "mr-2" : "ml-2"
                  }`}
                >
                  <strong>{t("Modals.DeleteQuizModal.warning")}</strong>{" "}
                  {t("Modals.DeleteQuizModal.warningMessage")}
                </p>
                <img src={warningIcon} alt="Warning Icon" className="w-6 h-6" />
              </div>

              <div className="flex justify-center">
                {isRTL ? (
                  <>
                    {/* Confirm button first in LTR */}
                    <button
                      onClick={handleDelete}
                      className="bg-danger text-white py-2 px-4 rounded-lg hover:bg-danger ml-3"
                    >
                      {t("Modals.DeleteQuizModal.confirmButton")}
                    </button>
                    <button
                      onClick={onClose}
                      className="py-2 px-4 bg-white text-black font-medium rounded-lg shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-opacity-50"
                    >
                      {t("Modals.DeleteQuizModal.cancelButton")}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Cancel button first in RTL */}
                    <button
                      onClick={onClose}
                      className="py-2 px-4 bg-white text-black font-medium rounded-lg shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-opacity-50 mr-3"
                    >
                      {t("Modals.DeleteQuizModal.cancelButton")}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-danger text-white py-2 px-4 rounded-lg hover:bg-danger"
                    >
                      {t("Modals.DeleteQuizModal.confirmButton")}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteQuizModal;
