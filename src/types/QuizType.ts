import { QuestionType } from "./QuestionType";
import { UserType } from "./UserType";

export type QuizType = {
  _id: string;
  title: string;
  description: string;
  time: number;
  visibility: "public" | "private";
  questions: QuestionType[];
  user: UserType;
  createdAt: string;
  updatedAt: string;
};

export type IQuizInput = Omit<
  QuizType,
  "_id" | "user" | "createdAt" | "updatedAt"
> & {};
