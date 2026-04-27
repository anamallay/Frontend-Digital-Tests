import { QuizType } from "./QuizType";

export type QuestionType = {
  _id: string;
  question: string;
  options: string[];
  correctOption: number;
  quiz: QuizType[];
};
