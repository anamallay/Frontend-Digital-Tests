import React from "react";
import warningIcon from "../../../assets/Icons/warning.png";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div
        className="fixed inset-0"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      {/* Modal content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-screen">
          <div
            className="bg-backgroundInner shadow-lg p-6 xs:p-8 lg:p-10 w-full max-w-lg sm:max-w-xl border border-primaryLighter rounded-lg z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className={`text-xl xs:text-2xl lg:text-3xl font-bold text-danger mb-4 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("Modals.DeleteAccountModal.title")}
            </h2>
            <p
              className={`text-secondary text-sm xs:text-base lg:text-lg mb-6 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("Modals.DeleteAccountModal.confirmationMessage")}
            </p>
            <div
              className={`flex items-center text-thirdColor font-semibold mb-6 bg-backgroundOuter p-4 rounded-lg ${
                isRTL ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {isRTL ? (
                <>
                  <strong className="block">
                    {t("Modals.DeleteAccountModal.warningMessage")}
                  </strong>
                  <img
                    src={warningIcon}
                    alt="Warning Icon"
                    className="w-6 h-6 ml-2"
                  />
                </>
              ) : (
                <>
                  <img
                    src={warningIcon}
                    alt="Warning Icon"
                    className="w-6 h-6 mr-2"
                  />
                  <p className="text-left">
                    <strong className="block">
                      {t("Modals.DeleteAccountModal.warningMessage")}
                    </strong>
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-between gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm();
                }}
                className="py-2 px-4 bg-danger text-white font-medium rounded-lg shadow-none hover:bg-dangerLighter focus:outline-none focus:ring-2 focus:ring-danger focus:ring-opacity-50 text-sm xs:text-base lg:text-lg w-auto"
              >
                {t("Modals.DeleteAccountModal.deleteButton")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="py-2 px-4 bg-white text-black font-medium rounded-lg shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-opacity-50 text-sm xs:text-base lg:text-lg w-auto"
              >
                {t("Modals.DeleteAccountModal.cancelButton")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
