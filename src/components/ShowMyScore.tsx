import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState, AppDispatch } from "../reducer/store/store";
import { fetchSingleScore } from "../reducer/action/scoresSlice";
import { IAnswer } from "../types/ScoreType";
import { QuestionType } from "../types/QuestionType";
import Loading from "../layout/Loading";
import { useTranslation } from "react-i18next";
import i18n from "../utils/i18n";

const ShowMyScore: React.FC = () => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();

  const {
    singleScore: score,
    isLoadingSingleScore,
    errorSingleScore,
  } = useSelector((state: RootState) => state.scores);

  useEffect(() => {
    if (id) {
      dispatch(fetchSingleScore(id));
    }
  }, [dispatch, id]);

  if (isLoadingSingleScore) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 bg-black z-50">
        <Loading />
      </div>
    );
  }

  if (errorSingleScore || !score) {
    return (
      <div className="text-red-500 text-center">
        {errorSingleScore || t("ShowMyScore.error")}
      </div>
    );
  }

  const { quiz, answers } = score;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 min-h-screen text-secondary">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 text-center">
        {t("ShowMyScore.title")}
      </h2>
      <div className="bg-backgroundInner text-secondary p-4 sm:p-6 lg:p-8 shadow-lg rounded-lg max-w-xl mx-auto border border-primaryLighter">
        <h3
          className={`text-lg sm:text-xl lg:text-2xl font-semibold mb-4 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("ShowMyScore.quizTitle")} {quiz.title}
        </h3>
        <p
          className={`text-md sm:text-lg lg:text-xl mb-4 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {t("ShowMyScore.score")}{" "}
          <span className="font-bold text-primary">{score.score}%</span>
        </p>

        <div>
          <h4
            className={`text-md sm:text-lg lg:text-xl font-semibold mb-4 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {t("ShowMyScore.questionsAndAnswers")}
          </h4>
          <ul className="space-y-6">
            {quiz.questions.map((questionItem: QuestionType, index: number) => {
              const userAnswer: IAnswer | undefined = answers.find(
                (answer) =>
                  answer.question._id.toString() === questionItem._id.toString()
              );

              const isCorrect = userAnswer?.isCorrect;

              return (
                <li
                  key={questionItem._id}
                  className={`text-sm sm:text-base lg:text-lg p-4 rounded shadow ${
                    isCorrect
                      ? "bg-backgroundOuter border-l-4 border-green-500"
                      : "bg-backgroundOuter border-l-4 border-red-500"
                  } ${isRTL ? "text-right" : "text-left"}`}
                >
                  <div className="mb-4 text-secondary">
                    <span className="font-bold">
                      {t("ShowMyScore.question")} {index + 1}:
                    </span>{" "}
                    {questionItem.question}
                  </div>
                  <ul
                    className={`ml-4 space-y-2 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {questionItem.options.map(
                      (option: string, optionIndex: number) => {
                        const isSelected =
                          optionIndex === userAnswer?.selectedOption;
                        const isOptionCorrect =
                          optionIndex === questionItem.correctOption;

                        return (
                          <li
                            key={optionIndex}
                            className={`p-2 rounded text-sm sm:text-base lg:text-lg ${
                              isOptionCorrect
                                ? "bg-green-200 font-semibold text-black"
                                : isSelected && !isCorrect
                                ? "bg-red-200 font-semibold text-black"
                                : "bg-gray-100 text-black"
                            }`}
                          >
                            {isRTL ? (
                              <>
                                {isOptionCorrect && (
                                  <span className="text-black font-bold">
                                    ✓{" "}
                                  </span>
                                )}
                                {isSelected && !isOptionCorrect && (
                                  <span className="text-black font-bold">
                                    ✗{" "}
                                  </span>
                                )}
                                {option}{" "}
                              </>
                            ) : (
                              <>
                                {option}
                                {isOptionCorrect && (
                                  <span className="text-black font-bold">
                                    {" "}
                                    ✓
                                  </span>
                                )}
                                {isSelected && !isOptionCorrect && (
                                  <span className="text-black font-bold">
                                    {" "}
                                    ✗
                                  </span>
                                )}
                              </>
                            )}
                          </li>
                        );
                      }
                    )}
                  </ul>
                  <div
                    className={`mt-4 p-3 rounded text-center text-md sm:text-lg lg:text-xl font-semibold text-black ${
                      isCorrect ? "bg-green-200" : "bg-red-200"
                    }`}
                  >
                    {isCorrect
                      ? t("ShowMyScore.correctAnswer")
                      : t("ShowMyScore.wrongAnswer")}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShowMyScore;
