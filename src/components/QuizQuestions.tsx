import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../reducer/store/store";
import { fetchQuizFromLibrary } from "../reducer/action/questionsSlice";
import { QuestionType } from "../types/QuestionType";
import {
  startQuiz,
  submitAndEndQuiz,
} from "../reducer/action/quizProgressSlice";
import { fetchUserLibrary } from "../reducer/action/librariesSlice";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useTranslation } from "react-i18next";
import i18n from "../utils/i18n";
import Loading from "../layout/Loading";

const QuizQuestions: React.FC = () => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { quiz: quizId } = useParams<{ quiz: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { library } = useSelector((state: RootState) => state.library);

  useEffect(() => {
    dispatch(fetchUserLibrary());
  }, [dispatch]);

  const quiz = library.find((quiz) => quiz._id === quizId);

  const navigate = useNavigate();

  const [answers, setAnswers] = useState<number[]>(() =>
    JSON.parse(localStorage.getItem("answers") || "[]")
  );

  const [currentQuestion, setCurrentQuestion] = useState<number>(() =>
    JSON.parse(localStorage.getItem("currentQuestion") || "0")
  );

  const { questions, isLoading, error } = useSelector(
    (state: RootState) => state.questions
  );

  const { isQuizInProgress, startTime, initialTime, currentQuizId } =
    useSelector((state: RootState) => state.quizProgress);

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (startTime && initialTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      return initialTime - elapsed > 0 ? initialTime - elapsed : 0;
    } else if (quiz?.time) {
      return quiz.time * 60;
    } else {
      return 0;
    }
  });

  useEffect(() => {
    if (quizId && quiz) {
      dispatch(fetchQuizFromLibrary(quizId))
        .then((action) => {
          if (fetchQuizFromLibrary.fulfilled.match(action)) {
            const fetchedQuestions = action.payload as QuestionType[];

            if (fetchedQuestions.length === 0) {
              console.error(t("QuizQuestions.noQuestionsFound"));
              navigate("/dashboard/library");
              return;
            }

            if (answers.length === 0) {
              setAnswers(new Array(fetchedQuestions.length).fill(-1));
            }

            if (!isQuizInProgress || currentQuizId !== quizId) {
              const totalTime = quiz.time * 60;
              dispatch(startQuiz({ quizId, totalTime }));
              setTimeLeft(totalTime);
            }
          } else {
            console.error("Failed to fetch quiz");
          }
        })
        .catch((error) => {
          console.error("Error fetching quiz:", error);
        });
    }
  }, [dispatch, quizId, navigate, quiz, t]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isQuizInProgress && currentQuizId === quizId) {
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - (startTime || 0)) / 1000);
        const remainingTime = initialTime - elapsed;
        if (remainingTime <= 0) {
          if (timeLeft > 0) {
            setTimeLeft(0);
            clearInterval(timer);
            handleSubmit();
          }
        } else {
          setTimeLeft(remainingTime);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [
    isQuizInProgress,
    startTime,
    initialTime,
    currentQuizId,
    quizId,
    timeLeft,
  ]);

  useEffect(() => {
    localStorage.setItem("answers", JSON.stringify(answers));
    localStorage.setItem("currentQuestion", JSON.stringify(currentQuestion));
  }, [answers, currentQuestion]);

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = answerIndex;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = () => {
    if (quizId) {
      dispatch(submitAndEndQuiz(quizId, answers))
        .then(() => {
          navigate("/dashboard/library");
        })
        .catch((error) => {
          console.error("Failed to submit quiz", error);
        });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-opacity-20 z-50">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">{t("QuizQuestions.loadingError")}</div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 xs:px-2 sm:px-6 md:px-4 lg:px-8">
        <div className="flex flex-col items-center justify-start p-4 xs:p-6 sm:p-10 md:p-12 bg-backgroundInner rounded-lg shadow-lg w-full max-w-2xl mx-auto my-44 mt-60 border border-primaryLighter">
          <div className="flex items-center justify-between w-full">
            {isRTL ? (
              <>
                <h2
                  className={`text-xl xs:text-2xl font-bold text-secondary ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {quiz?.title}
                </h2>

                {/* Timer Display */}
                <CountdownCircleTimer
                  isPlaying={isQuizInProgress}
                  duration={(quiz?.time ?? 1) * 60}
                  initialRemainingTime={timeLeft}
                  colors={["#23AB49", "#F9C74F", "#FE324B", "#FE324B"]}
                  colorsTime={[
                    (quiz?.time ?? 1) * 60 * 0.5,
                    (quiz?.time ?? 1) * 60 * 0.25,
                    (quiz?.time ?? 1) * 60 * 0.1,
                    0,
                  ]}
                  size={60}
                  strokeWidth={4}
                  onComplete={() => {
                    handleSubmit();
                    return { shouldRepeat: false };
                  }}
                >
                  {({ remainingTime }) => {
                    let textColor;
                    if (remainingTime <= (quiz?.time ?? 1) * 60 * 0.1) {
                      textColor = "text-red-500";
                    } else if (remainingTime <= (quiz?.time ?? 1) * 60 * 0.25) {
                      textColor = "text-yellow-500";
                    } else if (remainingTime <= (quiz?.time ?? 1) * 60 * 0.5) {
                      textColor = "text-green-500";
                    } else {
                      textColor = "text-primary";
                    }

                    return (
                      <div
                        className={`${textColor} text-sm xs:text-md font-bold`}
                      >
                        {formatTime(remainingTime)}
                      </div>
                    );
                  }}
                </CountdownCircleTimer>
              </>
            ) : (
              <>
                {/* Timer Display */}
                <CountdownCircleTimer
                  isPlaying={isQuizInProgress}
                  duration={(quiz?.time ?? 1) * 60}
                  initialRemainingTime={timeLeft}
                  colors={["#23AB49", "#F9C74F", "#FE324B", "#FE324B"]}
                  colorsTime={[
                    (quiz?.time ?? 1) * 60 * 0.5,
                    (quiz?.time ?? 1) * 60 * 0.25,
                    (quiz?.time ?? 1) * 60 * 0.1,
                    0,
                  ]}
                  size={60}
                  strokeWidth={4}
                  onComplete={() => {
                    handleSubmit();
                    return { shouldRepeat: false };
                  }}
                >
                  {({ remainingTime }) => {
                    let textColor;
                    if (remainingTime <= (quiz?.time ?? 1) * 60 * 0.1) {
                      textColor = "text-red-500";
                    } else if (remainingTime <= (quiz?.time ?? 1) * 60 * 0.25) {
                      textColor = "text-yellow-500";
                    } else if (remainingTime <= (quiz?.time ?? 1) * 60 * 0.5) {
                      textColor = "text-green-500";
                    } else {
                      textColor = "text-primary";
                    }

                    return (
                      <div
                        className={`${textColor} text-sm xs:text-md font-bold`}
                      >
                        {formatTime(remainingTime)}
                      </div>
                    );
                  }}
                </CountdownCircleTimer>
                <h2
                  className={`text-xl xs:text-2xl font-bold text-secondary ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {quiz?.title}
                </h2>
              </>
            )}
          </div>

          <div className="w-full" dir={isRTL ? "rtl" : "ltr"}>
            {questions.length > 0 && (
              <div
                key={questions[currentQuestion]._id}
                className="mb-4 xs:mb-6"
              >
                <h4
                  className={`text-base xs:text-lg font-semibold mb-2 xs:mb-4 text-gray-200 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {currentQuestion + 1}. {questions[currentQuestion].question}
                </h4>

                <div className="space-y-2">
                  {questions[currentQuestion].options &&
                  questions[currentQuestion].options.length > 0 ? (
                    questions[currentQuestion].options.map(
                      (option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className="flex items-center text-thirdColor mb-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion}`}
                            value={optionIndex}
                            checked={answers[currentQuestion] === optionIndex}
                            onChange={() =>
                              handleAnswerChange(currentQuestion, optionIndex)
                            }
                            className="relative float-right mt-0.5 h-5 w-5 appearance-none rounded-full border-2 border-solid border-secondary-500 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-checkbox before:shadow-transparent before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-black/60 focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-black/60 focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-checkbox checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-200 dark:checked:border-primary"
                          />
                          <span className={`${isRTL ? "mr-2" : "ml-2"}`}>
                            {option}
                          </span>
                        </label>
                      )
                    )
                  ) : (
                    <p className="text-red-500">
                      {t("QuizQuestions.noOptionsAvailable")}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between w-full mt-4 xs:mt-8 space-x-4">
            {isRTL ? (
              <>
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 xs:px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                >
                  {t("QuizQuestions.previous")}
                </button>
                <button
                  type="button"
                  className="bg-primary text-white px-4 xs:px-6 py-2 rounded-lg hover:bg-primaryLighter transition"
                  onClick={handleNextQuestion}
                  disabled={currentQuestion === questions.length - 1}
                >
                  {t("QuizQuestions.next")}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="bg-primary text-white px-4 xs:px-6 py-2 rounded-lg hover:bg-primaryLighter transition"
                  onClick={handleNextQuestion}
                  disabled={currentQuestion === questions.length - 1}
                >
                  {t("QuizQuestions.next")}
                </button>
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 xs:px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                >
                  {t("QuizQuestions.previous")}
                </button>
              </>
            )}
          </div>

          {/* Submit and Cancel Buttons */}
          <div
            className={`flex ${
              isRTL ? "justify-end " : "justify-start"
            } w-full mt-4 xs:mt-8`}
          >
            <button
              type="button"
              className="bg-primary text-white px-4 xs:px-6 py-2 rounded-lg hover:bg-primaryLighter transition"
              onClick={handleSubmit}
            >
              {t("QuizQuestions.submitAnswers")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestions;
