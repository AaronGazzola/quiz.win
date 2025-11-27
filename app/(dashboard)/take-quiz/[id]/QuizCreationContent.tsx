"use client";

import { useAppStore } from "@/app/layout.stores";
import { cn } from "@/lib/shadcn.utils";
import { TestId } from "@/test.types";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuizCreationStore } from "./page.stores";
import { useCreateQuizWithQuestions, useUpdateQuizMetadata } from "./page.hooks";
import { useEffect, useState } from "react";
import { QuizForTaking } from "./page.types";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";

interface QuizCreationContentProps {
  mode: "create" | "edit";
  quiz?: QuizForTaking;
}

export function QuizCreationContent({ mode, quiz }: QuizCreationContentProps) {
  const router = useRouter();
  const { user, selectedOrganizationIds } = useAppStore();
  const createMutation = useCreateQuizWithQuestions();
  const updateMutation = useUpdateQuizMetadata();

  conditionalLog({
    component: "QuizCreationContent",
    mode,
    hasUser: !!user,
    selectedOrganizationIds,
    hasQuiz: !!quiz
  }, { label: LOG_LABELS.QUIZ });

  const {
    currentQuestionIndex,
    title,
    description,
    questions,
    setCurrentQuestion,
    setTitle,
    setDescription,
    updateQuestion,
    addQuestion,
    removeQuestion,
    initializeForCreate,
    initializeForEdit,
    reset,
  } = useQuizCreationStore();

  const userOrganizations = user?.member?.map(m => ({
    id: m.organizationId,
    name: m.organization.name
  })) || [];

  const [selectedOrgId, setSelectedOrgId] = useState<string>(() => {
    if (mode === "create") {
      return userOrganizations[0]?.id || "";
    }
    return quiz?.organizationId || "";
  });

  useEffect(() => {
    if (mode === "create") {
      initializeForCreate();
    } else if (mode === "edit" && quiz) {
      initializeForEdit(quiz);
    }

    return () => {
      reset();
    };
  }, [mode, quiz, initializeForCreate, initializeForEdit, reset]);

  if (!user) return null;

  if (userOrganizations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-4">
          No Organizations
        </h1>
        <p className="text-muted-foreground mb-4">
          You need to be a member of an organization to create quizzes.
        </p>
        <button
          onClick={() => router.push("/")}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestion(currentQuestionIndex - 1);
    }
  };

  const handleAddOption = () => {
    if (currentQuestion && currentQuestion.options.length < 6) {
      updateQuestion(currentQuestionIndex, {
        options: [...currentQuestion.options, ""],
      });
    }
  };

  const handleRemoveOption = (optionIndex: number) => {
    if (currentQuestion && currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== optionIndex);
      let newCorrectAnswer = currentQuestion.correctAnswer;
      if (currentQuestion.correctAnswer === optionIndex) {
        newCorrectAnswer = -1;
      } else if (currentQuestion.correctAnswer > optionIndex) {
        newCorrectAnswer = currentQuestion.correctAnswer - 1;
      }
      updateQuestion(currentQuestionIndex, {
        options: newOptions,
        correctAnswer: newCorrectAnswer,
      });
    }
  };

  const handleUpdateOption = (optionIndex: number, value: string) => {
    if (currentQuestion) {
      const newOptions = [...currentQuestion.options];
      newOptions[optionIndex] = value;
      updateQuestion(currentQuestionIndex, {
        options: newOptions,
      });
    }
  };

  const handleSetCorrectAnswer = (optionIndex: number) => {
    if (currentQuestion) {
      updateQuestion(currentQuestionIndex, {
        correctAnswer: optionIndex,
      });
    }
  };

  const validateQuiz = (): string | null => {
    if (!title.trim()) return "Quiz title is required";
    if (mode === "create" && !selectedOrgId) return "Please select an organization";
    if (questions.length === 0) return "Quiz must have at least one question";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `Question ${i + 1} text is required`;
      if (q.options.length < 2) return `Question ${i + 1} must have at least 2 options`;
      if (q.options.some(opt => !opt.trim())) return `Question ${i + 1} has empty options`;
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        return `Question ${i + 1} must have a correct answer selected`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateQuiz();
    if (validationError) {
      alert(validationError);
      return;
    }

    if (mode === "create") {
      await createMutation.mutateAsync({
        title,
        description: description || undefined,
        organizationId: selectedOrgId,
        questions: questions.map((q, index) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.options[q.correctAnswer],
          order: index,
        })),
      });
    } else if (mode === "edit" && quiz) {
      await updateMutation.mutateAsync({
        id: quiz.id,
        data: {
          title,
          description: description || undefined,
        },
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto p-6" data-testid={TestId.QUIZ_CREATE_CONTAINER}>
      <div className="mb-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center text-muted-foreground hover:text-foreground mb-4"
          data-testid={TestId.QUIZ_CREATE_BACK_BUTTON}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>

        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-4">
            {mode === "create" ? "Create New Quiz" : "Edit Quiz"}
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="Enter quiz title"
                data-testid={TestId.QUIZ_CREATE_TITLE_INPUT}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="Enter quiz description"
                rows={3}
                data-testid={TestId.QUIZ_CREATE_DESCRIPTION_INPUT}
              />
            </div>

            {mode === "create" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Organization *
                </label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  data-testid={TestId.QUIZ_CREATE_ORGANIZATION_SELECT}
                >
                  <option value="">Select an organization</option>
                  {userOrganizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {mode === "create" && (
            <>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-between mt-6">
                <div data-testid={TestId.QUIZ_CREATE_QUESTION_COUNTER}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-2 mt-2" data-testid={TestId.QUIZ_CREATE_PROGRESS_BAR}>
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {mode === "create" && currentQuestion && (
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-foreground">
                Question {currentQuestionIndex + 1} *
              </label>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(currentQuestionIndex)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                  data-testid={TestId.QUIZ_CREATE_DELETE_QUESTION_BUTTON}
                >
                  Delete Question
                </button>
              )}
            </div>
            <input
              type="text"
              value={currentQuestion.question}
              onChange={(e) => updateQuestion(currentQuestionIndex, { question: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              placeholder="Enter question text"
              data-testid={TestId.QUIZ_CREATE_QUESTION_INPUT}
            />

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-foreground">
                  Answer Options * (Select correct answer)
                </label>
                {currentQuestion.options.length < 6 && (
                  <button
                    onClick={handleAddOption}
                    className="flex items-center text-sm text-primary hover:text-primary/80"
                    data-testid={TestId.QUIZ_CREATE_ADD_OPTION_BUTTON}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Option
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-3">
                    <button
                      onClick={() => handleSetCorrectAnswer(optionIndex)}
                      className={cn(
                        "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        currentQuestion.correctAnswer === optionIndex
                          ? "border-green-500 bg-green-500"
                          : "border-border hover:border-muted-foreground"
                      )}
                      data-testid={`${TestId.QUIZ_CREATE_CORRECT_ANSWER_RADIO}-${optionIndex}`}
                    >
                      {currentQuestion.correctAnswer === optionIndex && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </button>

                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleUpdateOption(optionIndex, e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      placeholder={`Option ${optionIndex + 1}`}
                      data-testid={`${TestId.QUIZ_CREATE_OPTION_INPUT}-${optionIndex}`}
                    />

                    {currentQuestion.options.length > 2 && (
                      <button
                        onClick={() => handleRemoveOption(optionIndex)}
                        className="flex-shrink-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        data-testid={`${TestId.QUIZ_CREATE_REMOVE_OPTION_BUTTON}-${optionIndex}`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-border">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-4 py-2 text-muted-foreground border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid={TestId.QUIZ_CREATE_PREVIOUS_BUTTON}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="flex space-x-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={cn(
                    "w-8 h-8 rounded-full text-sm font-medium border-2",
                    index === currentQuestionIndex
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  )}
                  data-testid={`${TestId.QUIZ_CREATE_QUESTION_NAV_DOT}-${index}`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={addQuestion}
                className="w-8 h-8 rounded-full text-sm font-medium border-2 border-dashed border-primary text-primary hover:bg-primary/10"
                data-testid={TestId.QUIZ_CREATE_ADD_QUESTION_BUTTON}
              >
                <Plus className="w-4 h-4 mx-auto" />
              </button>
            </div>

            <button
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
              className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid={TestId.QUIZ_CREATE_NEXT_BUTTON}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-muted"
          disabled={isSaving}
          data-testid={TestId.QUIZ_CREATE_CANCEL_BUTTON}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid={TestId.QUIZ_CREATE_SAVE_BUTTON}
        >
          {isSaving ? "Saving..." : mode === "create" ? "Create Quiz" : "Update Quiz"}
        </button>
      </div>
    </div>
  );
}
