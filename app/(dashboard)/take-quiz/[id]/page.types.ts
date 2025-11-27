import { quiz, Question, Response } from "@prisma/client";

export type QuizMode = "create" | "edit" | "take" | "review";

export interface QuizForTaking extends quiz {
  Question: Question[];
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

export interface DraftQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  order: number;
}

export interface QuizCreationState {
  mode: QuizMode;
  currentQuestionIndex: number;
  title: string;
  description: string;
  questions: DraftQuestion[];
  isSaving: boolean;
  setMode: (mode: QuizMode) => void;
  setCurrentQuestion: (index: number) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  updateQuestion: (index: number, question: Partial<DraftQuestion>) => void;
  addQuestion: () => void;
  removeQuestion: (index: number) => void;
  reorderQuestions: () => void;
  initializeForCreate: () => void;
  initializeForEdit: (quiz: QuizForTaking) => void;
  reset: () => void;
}