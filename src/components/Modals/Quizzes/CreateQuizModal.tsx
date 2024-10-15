import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../reducer/store/store";
import { IQuizInput } from "../../../types/QuizType";
import {
  createQuiz,
  fetchUserQuizzes,
} from "../../../reducer/action/quizzesSlice";
import { useTranslation } from "react-i18next";
import i18n from "../../../utils/i18n";

interface CreateQuizModalProps {
  onClose: () => void;
  isOpen: boolean;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  onClose,
  isOpen,
}) => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();

  const [newQuiz, setNewQuiz] = useState<IQuizInput>({
    title: "",
    description: "",
    time: 0,
    visibility: "public",
    questions: [],
  });

  const [error, setError] = useState<string | null>(null);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newQuiz.time || newQuiz.time <= 0) {
      setError(t("Modals.CreateQuizModal.error.quizTimeRequired"));
      return;
    }

    const quizToSubmit = { ...newQuiz };

    try {
      await dispatch(createQuiz(quizToSubmit)).unwrap();
      dispatch(fetchUserQuizzes());
      onClose();
    } catch (error) {
      setError(t("Modals.CreateQuizModal.error.quizCreationFailed"));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewQuiz({
      ...newQuiz,
      [name]: name === "time" ? parseInt(value) : value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-backgroundInner rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg w-full text-black">
            <div className="p-6 border border-primaryLighter rounded-lg">
              <h3
                className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-4 text-secondary ${
                  isRTL ? "text-right" : "text-left"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              >
                {t("Modals.CreateQuizModal.createNewQuiz")}
              </h3>

              {error && (
                <p
                  className={`text-red-600 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  {error}
                </p>
              )}
              <form onSubmit={handleCreateQuiz} className="space-y-4">
                <div className="mb-4">
                  <label
                    className={`block text-secondary mb-2 text-sm sm:text-base lg:text-lg ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    {t("Modals.CreateQuizModal.quizTitleLabel")}
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={newQuiz.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm sm:text-base lg:text-lg ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    className={`block text-secondary mb-2 text-sm sm:text-base lg:text-lg ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    {t("Modals.CreateQuizModal.quizDescriptionLabel")}
                  </label>

                  <input
                    type="text"
                    name="description"
                    value={newQuiz.description}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm sm:text-base lg:text-lg ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    className={`block text-secondary mb-2 text-sm sm:text-base lg:text-lg ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    {t("Modals.CreateQuizModal.quizTimeLabel")}
                  </label>

                  <div className="py-2 px-3 bg-gray-100 rounded-lg">
                    <div className="w-full flex justify-between items-center gap-x-5">
                      <div className="grow">
                        <input
                          className="w-full p-0 bg-transparent border-0 text-gray-800 focus:outline-none focus:ring-0"
                          style={{ MozAppearance: "textfield" }}
                          type="number"
                          name="time"
                          value={newQuiz.time}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="flex justify-end items-center gap-x-1.5">
                        <button
                          type="button"
                          className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-green-600 bg-green-500 text-white shadow-sm hover:bg-green-600 focus:outline-none focus:bg-green-600 disabled:opacity-50 disabled:pointer-events-none"
                          aria-label={t("Modals.CreateQuizModal.decreaseTime")}
                          onClick={() =>
                            setNewQuiz((prev) => ({
                              ...prev,
                              time: prev.time > 0 ? prev.time - 1 : 0,
                            }))
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
                          className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-green-600 bg-green-500 text-white shadow-sm hover:bg-green-600 focus:outline-none focus:bg-green-600"
                          aria-label={t("Modals.CreateQuizModal.increaseTime")}
                          onClick={() =>
                            setNewQuiz((prev) => ({
                              ...prev,
                              time: prev.time + 1,
                            }))
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
                            <path d="M12 5v14"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    className={`block font-medium text-secondary mb-2 text-sm sm:text-base lg:text-lg ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    {t("Modals.CreateQuizModal.quizVisibilityLabel")}
                  </label>

                  <select
                    name="visibility"
                    value={newQuiz.visibility}
                    onChange={handleChange}
                    className={`font-bold text-primary w-full px-4 py-3 border border-gray-500 rounded-lg bg-secondary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors duration-300 ease-in-out text-sm sm:text-base lg:text-lg ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                    dir={isRTL ? "rtl" : "ltr"}
                    required
                  >
                    <option value="public">
                      {t("Modals.CreateQuizModal.publicOption")}
                    </option>
                    <option value="private">
                      {t("Modals.CreateQuizModal.privateOption")}
                    </option>
                  </select>
                </div>

                <div className="flex justify-between">
                  {isRTL ? (
                    <>
                      {/* In RTL, Cancel button comes first */}
                      <button
                        type="button"
                        className="py-2 px-4 bg-white text-black font-medium rounded-lg shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-opacity-50 sm:w-auto"
                        onClick={onClose}
                      >
                        {t("Modals.CreateQuizModal.cancelButton")}
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primaryLighter sm:w-auto"
                      >
                        {t("Modals.CreateQuizModal.createButton")}
                      </button>
                    </>
                  ) : (
                    <>
                      {/* In LTR, Create button comes first */}
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primaryLighter sm:w-auto"
                      >
                        {t("Modals.CreateQuizModal.createButton")}
                      </button>
                      <button
                        type="button"
                        className="py-2 px-4 bg-white text-black font-medium rounded-lg shadow-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-opacity-50 sm:w-auto"
                        onClick={onClose}
                      >
                        {t("Modals.CreateQuizModal.cancelButton")}
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizModal;
