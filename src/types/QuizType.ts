import { QuestionType } from "./QuestionType";
import { PopulatedUserSummary } from "./UserType";

export type QuizType = {
  _id: string;
  title: string;
  description: string;
  time: number;
  visibility: "public" | "private";
  questions: QuestionType[];
  // Endpoints that populate the user field return a PopulatedUserSummary;
  // endpoints that don't (e.g. raw library ObjectId refs) return a string.
  // Narrow with `isPopulatedUser` before reading subfields.
  user: string | PopulatedUserSummary;
  createdAt: string;
  updatedAt: string;
};

export type IQuizInput = Omit<
  QuizType,
  "_id" | "user" | "createdAt" | "updatedAt"
> & {};
