import { create } from "zustand";
import { QuizPlayerState } from "./page.types";

const initialState = {
  currentQuestionIndex: 0,
  answers: [] as (string | null)[],
  timeSpent: 0,
  isSubmitting: false,
};

export const useQuizPlayerStore = create<QuizPlayerState>()((set) => ({
  ...initialState,

  setCurrentQuestion: (index: number) =>
    set({ currentQuestionIndex: index }),

  setAnswer: (questionIndex: number, answer: string | null) =>
    set((state) => {
      const newAnswers = [...state.answers];
      newAnswers[questionIndex] = answer;
      return { answers: newAnswers };
    }),

  completeQuiz: () =>
    set({ isSubmitting: true }),

  initializeAnswers: (questionCount: number) =>
    set({ answers: new Array(questionCount).fill(null) }),

  resetQuiz: () =>
    set(initialState),
}));