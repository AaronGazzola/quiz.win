import { Response, quiz, Question } from "@prisma/client";

export interface QuizResultData extends Response {
  quiz: quiz & {
    questions: Question[];
  };
}