import { Response, Quiz, Question } from "@prisma/client";

export interface QuizResultData extends Response {
  quiz: Quiz & {
    questions: Question[];
  };
}