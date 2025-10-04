import { quiz, Question, Response } from "@prisma/client";

export interface QuizForTaking extends quiz {
  questions: Question[];
}

export interface QuizPlayerState {
  currentQuestionIndex: number;
  answers: (string | null)[];
  timeSpent: number;
  isSubmitting: boolean;
  setCurrentQuestion: (index: number) => void;
  setAnswer: (questionIndex: number, answer: string | null) => void;
  completeQuiz: () => void;
  initializeAnswers: (questionCount: number) => void;
  resetQuiz: () => void;
}

export interface QuizResponseData {
  questionId: string;
  selectedAnswer: string | null;
  isCorrect: boolean;
}

export interface SubmitResponseData {
  quizId: string;
  answers: QuizResponseData[];
  score: number;
  timeSpent: number;
}

export interface ResponseWithDetails extends Response {
  quiz?: quiz;
}