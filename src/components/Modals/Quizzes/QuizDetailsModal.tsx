import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { QuizType } from "../../../types/QuizType";
import ShareLinkModal from "./ShareLinkModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShareFromSquare,
  faFileCirclePlus,
  faFileCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../reducer/store/store";
import {
  shareQuizWithCandidate,
  addPublicQuizToLibrary,
  fetchUserLibrary,
} from "../../../reducer/action/librariesSlice";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";
import Loading from "../../../layout/Loading";

interface QuizDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizType | null;
}

const QuizDetailsModal: React.FC<QuizDetailsModalProps> = ({
  isOpen,
  onClose,
  quiz,
}) => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const modalRef = useRef<HTMLDivElement>(null);
  const shareModalRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [quizLink, setQuizLink] = useState<string | null>(null);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (isOpen && quiz) {
      const checkIfAdded = async () => {
        try {
          const library = await dispatch(fetchUserLibrary()).unwrap();
          const addedQuiz = library.find(
            (item: QuizType) => item._id === quiz._id
          );
          if (addedQuiz) setIsAdded(true);
        } catch (error) {
          console.error("Failed to fetch user library", error);
        }
      };

      checkIfAdded();
    }
  }, [isOpen, quiz, dispatch]);

  const handleShareQuiz = async (quiz: QuizType) => {
    try {
      let link: string = "";

      if (quiz.visibility === "private") {
        const response = await dispatch(
          shareQuizWithCandidate({ quizId: quiz._id })
        ).unwrap();
        const token = response.quizLink;
        const frontendUrl = window.location.origin;
        link = `${frontendUrl}/dashboard/add-quiz-to-library/${token}`;
      } else if (quiz.visibility === "public") {
        const frontendUrl = window.location.origin;
        link = `${frontendUrl}/dashboard/add-quiz-to-library/${quiz._id}`;
      }

      setQuizLink(link || "");
      setOpenShareModal(true);
    } catch (error) {
      console.error("Failed to generate quiz link", error);
    }
  };

  const handleAddQuizToLibrary = async () => {
    if (!quiz) return;
    setIsAdding(true);
    try {
      await dispatch(addPublicQuizToLibrary(quiz._id)).unwrap();
      setIsAdded(true);
    } catch (error) {
      console.error("Failed to add quiz to library", error);
    } finally {
      setIsAdding(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickInsideModal =
        modalRef.current && modalRef.current.contains(event.target as Node);
      const isClickInsideShareModal =
        shareModalRef.current &&
        shareModalRef.current.contains(event.target as Node);

      if (!isClickInsideModal && !isClickInsideShareModal) {
        onClose();
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !quiz) return null;

  const modalContent = (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ zIndex: 9999 }}
      dir={isRTL ? "rtl" : "ltr"}
      onClick={onClose}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-backgroundOuter opacity-75"></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        {/* Prevent click propagation within modal */}
        <div
          className="inline-block align-bottom bg-backgroundInner rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-primaryLighter"
          dir={isRTL ? "rtl" : "ltr"}
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-backgroundInner px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-right sm:mt-0 sm:mr-0 w-full">
                <h3
                  className={`text-2xl font-bold text-primary mb-6 ${
                    isRTL ? "text-right" : "text-left"
                  } flex items-center`}
                >
                  {t("QuizDetailsModal.title")}
                </h3>

                <div className="space-y-4">
                  {/* Quiz Details */}
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <label className="block text-secondary mb-2">
                      {t("QuizDetailsModal.labelTitle")}
                    </label>
                    <p className="text-secondary">{quiz.title}</p>
                  </div>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <label className="block text-secondary mb-2">
                      {t("QuizDetailsModal.labelDescription")}
                    </label>
                    <p className="text-secondary">{quiz.description}</p>
                  </div>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <label className="block text-secondary mb-2">
                      {t("QuizDetailsModal.labelTime")}
                    </label>
                    <p className="text-secondary">
                      {quiz.time} {t("QuizDetailsModal.minutes")}
                    </p>
                  </div>
                  {/* New Section for Number of Questions */}
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <label className="block text-secondary mb-2">
                      {t("QuizDetailsModal.labelQuestionsCount")}
                    </label>
                    <p className="text-secondary">
                      {quiz.questions.length} {t("QuizDetailsModal.questions")}
                    </p>
                  </div>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <label className="block text-secondary mb-2">
                      {t("QuizDetailsModal.labelCreatedAt")}
                    </label>
                    <p className="text-thirdColorLighter">
                      {new Date(quiz.createdAt).toLocaleDateString(
                        isRTL ? "ar-EG" : "en-US"
                      )}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end mt-6">
                  <div
                    className={`absolute top-4 ${isRTL ? "left-4" : "right-4"}`}
                  >
                    <button onClick={() => handleShareQuiz(quiz)}>
                      <FontAwesomeIcon
                        icon={faShareFromSquare}
                        flip="horizontal"
                        style={{ color: "#23ab49" }}
                        className="w-10 h-10 "
                      />
                    </button>
                  </div>
                  <div className="flex justify-between w-full">
                    {/* Add to Library Button */}
                    <button
                      onClick={handleAddQuizToLibrary}
                      disabled={isAdding || isAdded}
                    >
                      {isAdding ? (
                        <span>
                          <Loading />
                        </span>
                      ) : isAdded ? (
                        // Show the new icon once added
                        <FontAwesomeIcon
                          icon={faFileCircleCheck}
                          className="text-4xl text-primaryLighter"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faFileCirclePlus}
                          className="text-4xl text-primaryLighter"
                        />
                      )}
                    </button>
                    <div className="absolute bottom-full mb-2 w-max invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-[#F8C358] text-black text-xs rounded-lg px-2 py-1 transition-opacity duration-300">
                      {t("QuizDetailsModal.addQuizTooltip")}
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="py-2 px-4 bg-white text-black font-medium rounded-lg shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-opacity-50"
                    >
                      {t("QuizDetailsModal.closeButton")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {quizLink && (
        <ShareLinkModal
          isOpen={openShareModal}
          onClose={() => setOpenShareModal(false)}
          quizLink={quizLink}
          ref={shareModalRef}
        />
      )}
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default QuizDetailsModal;
