import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../reducer/store/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import {
  fetchUserLibrary,
  removeQuizFromLibrary,
} from "../../../reducer/action/librariesSlice";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";

interface DeleteModalProps {
  quizId: string;
  onClose: () => void;
}

const DeleteLibraryModal: React.FC<DeleteModalProps> = ({
  quizId,
  onClose,
}) => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = () => {
    dispatch(removeQuizFromLibrary(quizId)).then(() => {
      dispatch(fetchUserLibrary());
      onClose();
    });
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
                  className="w-16 h-16 sm:w-24 sm:h-24 text-danger mx-auto"
                />
              </div>
              <p className="text-base sm:text-lg md:text-xl text-white mb-4">
                {t("Modals.DeleteLibraryModal.confirmationMessage")}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={handleDelete}
                  className={`bg-danger text-white py-2 px-4 rounded-lg hover:bg-danger ${
                    isRTL ? "ml-3" : "mr-3"
                  }`}
                >
                  {t("Modals.DeleteLibraryModal.confirmButton")}
                </button>
                <button
                  onClick={onClose}
                  className="py-2 px-4 bg-white text-black font-medium rounded-lg shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-opacity-50"
                >
                  {t("Modals.DeleteLibraryModal.cancelButton")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteLibraryModal;
