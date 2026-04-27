import { QuestionType } from "./QuestionType";
import { QuizType } from "./QuizType";
import { UserType } from "./UserType";

export type IAnswer = {
  question: QuestionType;
  selectedOption: number;
  isCorrect: boolean;
};
export type ScoreType = {
  _id: string;
  quiz: QuizType;
  user: UserType[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: IAnswer[];
};
