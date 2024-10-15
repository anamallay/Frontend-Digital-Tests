import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteQuestionModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";

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
                {isRTL
                  ? `${t("Modals.DeleteQuestionModal.confirmationMessage")} ؟`
                  : `? ${t("Modals.DeleteQuestionModal.confirmationMessage")}`}
              </p>
              <div className="flex justify-center">
                {isRTL ? (
                  <>
                    {/* Confirm button comes first for RTL */}
                    <button
                      onClick={onConfirm}
                      className="bg-danger text-white py-2 px-4 rounded-lg hover:bg-danger ml-3"
                    >
                      {t("Modals.DeleteQuestionModal.confirmButton")}
                    </button>
                    <button
                      onClick={onClose}
                      className="py-2 px-4 bg-white text-black font-medium rounded-lg shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-opacity-50"
                    >
                      {t("Modals.DeleteQuestionModal.cancelButton")}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Cancel button comes first for LTR */}
                    <button
                      onClick={onClose}
                      className="py-2 px-4 bg-white text-black font-medium rounded-lg shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-opacity-50 mr-3"
                    >
                      {t("Modals.DeleteQuestionModal.cancelButton")}
                    </button>
                    <button
                      onClick={onConfirm}
                      className="bg-danger text-white py-2 px-4 rounded-lg hover:bg-danger"
                    >
                      {t("Modals.DeleteQuestionModal.confirmButton")}
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

export default DeleteQuestionModal;
