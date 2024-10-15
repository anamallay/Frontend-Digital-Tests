import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { fetchQuizzes } from "../../reducer/action/quizzesSlice";
import { AppDispatch, RootState } from "../../reducer/store/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileCirclePlus,
  faFileCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import Loading from "../../layout/Loading";
import {
  addPublicQuizToLibrary,
  fetchUserLibrary,
} from "../../reducer/action/librariesSlice";
import QuizDetailsModal from "../Modals/Quizzes/QuizDetailsModal";
import { QuizType } from "../../types/QuizType";

const PublicQuiz = () => {
  const { isLoggedIn } = useSelector((state: RootState) => state.users);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { quizzes, isLoading, totalPages } = useSelector(
    (state: RootState) => state.quizzes
  );

  const [page, setPage] = useState(1);
  const limit = 6;

  const [selectedQuiz, setSelectedQuiz] = useState<QuizType | null>(null);
  const [addedQuizzes, setAddedQuizzes] = useState<string[]>([]);

  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchQuizzes({ page, limit }));
  }, [dispatch, page]);

  useEffect(() => {
    if (quizId) {
      const quiz = quizzes.find((q) => q._id === quizId);
      if (quiz) {
        setSelectedQuiz(quiz);
      }
    }
  }, [quizId, quizzes]);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const library = await dispatch(fetchUserLibrary()).unwrap();
        setAddedQuizzes(library.map((quiz: QuizType) => quiz._id));
      } catch (error) {
        console.error("Failed to fetch user library", error);
      }
    };

    if (isLoggedIn) {
      fetchLibrary();
    }
  }, [dispatch, isLoggedIn]);

  const handleAddPublicQuiz = async (quizId: string) => {
    if (!isLoggedIn) {
      window.location.href = "/login";
    } else {
      try {
        await dispatch(addPublicQuizToLibrary(quizId)).unwrap();
        setAddedQuizzes((prev) => [...prev, quizId]);
      } catch (error) {
        console.error("Failed to add quiz to library", error);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleCloseModal = () => {
    setSelectedQuiz(null);
    navigate("/public");
  };

  const isRTL = i18n.language === "ar";

  const generatePageNumbers = (totalPages: number, currentPage: number) => {
    const maxVisiblePages = 5;
    const pages: number[] = [];

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push(-1);
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push(-1);
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers(totalPages, page);

  return (
    <section
      className={`text-secondary mt-10 sm:mt-16 lg:mt-24 flex flex-col items-center justify-start w-[90%] mx-auto ${
        isRTL ? "rtl" : "ltr"
      }`}
      style={{ minHeight: "75vh" }}
    >
      {/* Quizzes List */}
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <ul className="flex flex-col space-y-4 items-start mt-10 sm:mt-14">
          {/* Loading State */}
          {isLoading && (
            <li className="fixed inset-0 flex items-center justify-center bg-opacity-20 z-50">
              <Loading />
            </li>
          )}

          {/* Quiz List */}
          {!isLoading && quizzes?.length > 0
            ? quizzes.map((quiz) => (
                <li
                  key={quiz._id}
                  onClick={() => navigate(`/public/quiz/${quiz._id}`)}
                  className={`container mx-auto relative bg-backgroundInner text-secondary p-4 sm:p-6 shadow-lg flex flex-col justify-between h-full transition-transform transform border border-primaryLighter rounded-lg cursor-pointer hover:scale-105 hover:shadow-xl w-full sm:w-4/5 lg:w-3/4 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {/* Quiz Title */}
                  <div className="flex-grow">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 text-th">
                      {quiz.title || t("PublicQuiz.no_title")}
                    </h3>
                    <p
                      className="text-gray-400 text-xs sm:text-sm lg:text-base"
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      <span className="font-bold">
                        {t("PublicQuiz.description_label")}
                      </span>
                      :{" "}
                      <span className="text-thirdColor">
                        {quiz.description}
                      </span>
                    </p>
                  </div>

                  <div
                    className={`absolute bottom-1 ${
                      isRTL ? "left-20" : "right-20"
                    }`}
                  >
                    {!isLoading ? (
                      <div className="relative group">
                        {/* Add to Library Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddPublicQuiz(quiz._id);
                          }}
                          disabled={addedQuizzes.includes(quiz._id)}
                          className="w-8 h-8 rounded-full bg-transparent focus:outline-none"
                        >
                          <FontAwesomeIcon
                            icon={
                              addedQuizzes.includes(quiz._id)
                                ? faFileCircleCheck
                                : faFileCirclePlus
                            }
                            className="text-2xl sm:text-3xl text-primaryLighter"
                            aria-label={t("PublicQuiz.add_to_library")}
                          />
                        </button>
                        {/* Tooltip */}
                        <div
                          className={`absolute ${
                            isRTL ? "right-0" : "left-0"
                          } bottom-full mb-2 w-max invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-[#F8C358] text-black text-xs rounded-lg px-2 py-1 transition-opacity duration-300`}
                        >
                          {addedQuizzes.includes(quiz._id)
                            ? t("PublicQuiz.already_added")
                            : t("PublicQuiz.add_to_library")}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Loading />
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <p
                    className={`absolute bottom-2 ${
                      isRTL ? "left-4" : "right-4"
                    } text-xs sm:text-sm lg:text-base text-blue-400 font-normal`}
                  >
                    {quiz.user?.username || t("PublicQuiz.unknown_user")}@
                  </p>
                </li>
              ))
            : !isLoading && (
                <li
                  className="text-secondary text-center col-span-full"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  {t("PublicQuiz.no_quizzes")}
                </li>
              )}
        </ul>

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex space-x-2 mt-6 mb-6 justify-end text-secondary">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              title="previous"
              type="button"
              className="inline-flex items-center justify-center w-8 h-8 py-0 border rounded-md shadow-md bg-backgroundInner dark:border-secondary disabled:bg-secondaryDarker disabled:text-secondary disabled:cursor-not-allowed cursor-pointer mx-2"
            >
              <svg
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Page Numbers */}
            {pageNumbers.map((pageNum, index) =>
              pageNum === -1 ? (
                <span
                  key={index}
                  className="inline-flex items-center justify-center w-8 h-8 text-sm font-semibold mx-2"
                >
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => handlePageChange(pageNum)}
                  type="button"
                  title={`Page ${pageNum}`}
                  className={`inline-flex items-center justify-center w-8 h-8 text-sm font-semibold border rounded shadow-md dark:bg-backgroundInner border-primaryLighter mx-2 ${
                    pageNum === page
                      ? "dark:text-primary dark:border-primary border-solid border"
                      : ""
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              title="next"
              type="button"
              className="inline-flex items-center justify-center w-8 h-8 py-0 border rounded-md shadow-md bg-backgroundInner dark:border-secondary disabled:bg-secondaryDarker disabled:text-secondary disabled:cursor-not-allowed cursor-pointer mx-2"
            >
              <svg
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </div>

      {selectedQuiz && (
        <QuizDetailsModal
          isOpen={true}
          quiz={selectedQuiz}
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
};

export default PublicQuiz;
