import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteScoreModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";

  if (!isOpen) return null;

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
                  className="w-16 h-16 xs:w-24 xs:h-24 text-danger mx-auto"
                />
              </div>
              <p className="text-sm xs:text-base lg:text-lg text-white mb-4">
                {t("Modals.DeleteScoreModal.confirmationMessage")}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={onConfirm}
                  className={`bg-danger text-white py-2 px-4 rounded-lg hover:bg-danger text-sm xs:text-base lg:text-lg ${
                    isRTL ? "ml-2" : "mr-2"
                  }`}
                >
                  {t("Modals.DeleteScoreModal.confirmButton")}
                </button>
                <button
                  onClick={onClose}
                  className="py-2 px-4 bg-white text-black font-medium rounded-lg shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-opacity-50 text-sm xs:text-base lg:text-lg"
                >
                  {t("Modals.DeleteScoreModal.cancelButton")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteScoreModal;
