import { create } from "zustand";
import { QuizPlayerState, QuizCreationState, DraftQuestion, QuizForTaking } from "./page.types";

const initialPlayerState = {
  currentQuestionIndex: 0,
  answers: [] as (string | null)[],
  timeSpent: 0,
  isSubmitting: false,
};

export const useQuizPlayerStore = create<QuizPlayerState>()((set) => ({
  ...initialPlayerState,

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
    set(initialPlayerState),
}));

import { nanoid } from "nanoid";

const createEmptyQuestion = (): DraftQuestion => {
  return {
    id: nanoid(),
    question: "",
    options: ["", ""],
    correctAnswer: -1,
    order: 0,
  };
};

const initialCreationState = {
  mode: "take" as const,
  currentQuestionIndex: 0,
  title: "",
  description: "",
  questions: [] as DraftQuestion[],
  isSaving: false,
};

export const useQuizCreationStore = create<QuizCreationState>()((set) => ({
  ...initialCreationState,

  setMode: (mode) => set({ mode }),

  setCurrentQuestion: (index: number) =>
    set({ currentQuestionIndex: index }),

  setTitle: (title: string) => set({ title }),

  setDescription: (description: string) => set({ description }),

  updateQuestion: (index: number, questionUpdate: Partial<DraftQuestion>) =>
    set((state) => {
      const newQuestions = [...state.questions];
      newQuestions[index] = { ...newQuestions[index], ...questionUpdate };
      return { questions: newQuestions };
    }),

  addQuestion: () =>
    set((state) => {
      const newQuestion = createEmptyQuestion();
      newQuestion.order = state.questions.length;
      return {
        questions: [...state.questions, newQuestion],
        currentQuestionIndex: state.questions.length,
      };
    }),

  removeQuestion: (index: number) =>
    set((state) => {
      const newQuestions = state.questions.filter((_, i) => i !== index);
      const reorderedQuestions = newQuestions.map((q, i) => ({
        ...q,
        order: i,
      }));
      return {
        questions: reorderedQuestions,
        currentQuestionIndex: Math.min(
          state.currentQuestionIndex,
          reorderedQuestions.length - 1
        ),
      };
    }),

  reorderQuestions: () =>
    set((state) => ({
      questions: state.questions.map((q, i) => ({ ...q, order: i })),
    })),

  initializeForCreate: () =>
    set({
      mode: "create",
      currentQuestionIndex: 0,
      title: "",
      description: "",
      questions: [createEmptyQuestion()],
      isSaving: false,
    }),

  initializeForEdit: (quiz: QuizForTaking) =>
    set({
      mode: "edit",
      currentQuestionIndex: 0,
      title: quiz.title,
      description: quiz.description || "",
      questions: quiz.Question.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.options.indexOf(q.correctAnswer),
        order: q.order,
      })),
      isSaving: false,
    }),

  reset: () => set(initialCreationState),
}));