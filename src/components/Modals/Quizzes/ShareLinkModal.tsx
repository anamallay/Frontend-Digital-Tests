import { useState, useEffect, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizLink: string | null;
}

const ShareLinkModal = forwardRef<HTMLDivElement, ShareLinkModalProps>(
  ({ isOpen, onClose, quizLink }, ref) => {
    const { t } = useTranslation();
    const isRTL = i18n.language === "ar";
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
      if (!isOpen) {
        setIsCopied(false);
      }
    }, [isOpen]);

    if (!isOpen || !quizLink) {
      return null;
    }

    const handleCopyLink = () => {
      if (quizLink) {
        navigator.clipboard
          .writeText(quizLink)
          .then(() => {
            setIsCopied(true);
          })
          .catch((err) => {
            console.error("Failed to copy: ", err);
          });
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-screen">
            <div
              className="bg-backgroundInner overflow-hidden shadow-xl transform transition-all max-w-lg w-full p-6 text-white border border-primaryLighter rounded-lg"
              ref={ref}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                className={`text-xl xs:text-2xl lg:text-3xl font-bold mb-4 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("Modals.ShareLinkModal.title")}
              </h2>
              <p
                className={`mb-4 text-sm xs:text-base lg:text-lg ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("Modals.ShareLinkModal.description")}
              </p>
              <div className="bg-backgroundOuter p-4 rounded mb-4 break-all text-black text-center text-sm xs:text-base lg:text-lg">
                <a
                  href={quizLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-thirdColor break-all"
                >
                  {quizLink}
                </a>
              </div>

              <div className="flex justify-between mt-4">
                {isRTL ? (
                  <>
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-sm xs:text-base lg:text-lg font-medium text-white hover:bg-primaryLighter w-auto"
                      disabled={isCopied}
                    >
                      {isCopied
                        ? t("Modals.ShareLinkModal.copiedButton")
                        : t("Modals.ShareLinkModal.copyButton")}
                    </button>
                    <button
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-sm xs:text-base lg:text-lg font-medium text-black shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger w-auto"
                    >
                      {t("Modals.ShareLinkModal.closeButton")}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-sm xs:text-base lg:text-lg font-medium text-black shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger w-auto"
                    >
                      {t("Modals.ShareLinkModal.closeButton")}
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-sm xs:text-base lg:text-lg font-medium text-white hover:bg-primaryLighter w-auto"
                      disabled={isCopied}
                    >
                      {isCopied
                        ? t("Modals.ShareLinkModal.copiedButton")
                        : t("Modals.ShareLinkModal.copyButton")}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default ShareLinkModal;
