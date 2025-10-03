import { Response, Assessment, Question } from "@prisma/client";

export interface QuizResultData extends Response {
  assessment: Assessment & {
    questions: Question[];
  };
}