import { QuizType } from "./QuizType";

export type UserRole = "Admin" | "User";

export type UserType = {
  data: any;
  _id: string;
  name: string;
  username: string;
  email?: string;
  password: string;
  role: UserRole;
  active: boolean;
  library: QuizType[];
  quizzes: QuizType[];
};

export type IUserInput = Omit<UserType, "_id" | "data" | "library" | "quizzes">;
