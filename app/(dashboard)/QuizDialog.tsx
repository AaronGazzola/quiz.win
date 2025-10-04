"use client";

import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Label from "@radix-ui/react-label";
import { cn } from "@/lib/shadcn.utils";
import { useCreateQuiz, useUpdateQuiz } from "./page.hooks";
import { QuizWithDetails } from "./page.types";

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz?: QuizWithDetails | null;
  organizationId: string;
}

interface QuestionData {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  order: number;
}

export function QuizDialog({ open, onOpenChange, quiz, organizationId }: QuizDialogProps) {
  const [title, setTitle] = useState(quiz?.title || "");
  const [description, setDescription] = useState(quiz?.description || "");
  const [questions, setQuestions] = useState<QuestionData[]>(
    quiz?.Question.map((q, index) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      order: q.order || index,
    })) || [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        order: 0,
      },
    ]
  );

  const createMutation = useCreateQuiz();
  const updateMutation = useUpdateQuiz();

  const isEditing = !!quiz;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    if (!title.trim()) return;

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: quiz.id,
          data: { title, description },
        });
      } else {
        await createMutation.mutateAsync({
          title,
          description,
          organizationId,
        });
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save quiz:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setQuestions([
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        order: 0,
      },
    ]);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        order: questions.length,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof QuestionData, value: string | number | string[]) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options.length < 6) {
      updated[questionIndex].options.push("");
      setQuestions(updated);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options.length > 2) {
      updated[questionIndex].options.splice(optionIndex, 1);
      if (updated[questionIndex].correctAnswer === updated[questionIndex].options[optionIndex]) {
        updated[questionIndex].correctAnswer = "";
      }
      setQuestions(updated);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b">
              <Dialog.Title className="text-xl font-semibold">
                {isEditing ? "Edit Quiz" : "Create New Quiz"}
              </Dialog.Title>
              <Dialog.Close className="p-1 hover:bg-gray-100 rounded-md">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label.Root htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Quiz Title*
                  </Label.Root>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter quiz title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <Label.Root htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </Label.Root>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter quiz description (optional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {!isEditing && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                    <button
                      onClick={addQuestion}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </button>
                  </div>

                  <div className="space-y-6">
                    {questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Question {questionIndex + 1}</h4>
                          {questions.length > 1 && (
                            <button
                              onClick={() => removeQuestion(questionIndex)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-md"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label.Root className="block text-sm font-medium text-gray-700 mb-1">
                              Question Text*
                            </Label.Root>
                            <textarea
                              value={question.question}
                              onChange={(e) => updateQuestion(questionIndex, "question", e.target.value)}
                              placeholder="Enter the question"
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label.Root className="block text-sm font-medium text-gray-700">
                                Answer Options*
                              </Label.Root>
                              {question.options.length < 6 && (
                                <button
                                  onClick={() => addOption(questionIndex)}
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  Add Option
                                </button>
                              )}
                            </div>

                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`correct-${questionIndex}`}
                                    checked={question.correctAnswer === option && option !== ""}
                                    onChange={() => updateQuestion(questionIndex, "correctAnswer", option)}
                                    className="text-blue-600"
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                                    placeholder={`Option ${optionIndex + 1}`}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                  {question.options.length > 2 && (
                                    <button
                                      onClick={() => removeOption(questionIndex, optionIndex)}
                                      className="p-1 text-red-500 hover:bg-red-50 rounded-md"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {question.correctAnswer && (
                              <p className="text-sm text-green-600 mt-2">
                                Correct answer: {question.correctAnswer}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  onOpenChange(false);
                  resetForm();
                }}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || !title.trim()}
                className={cn(
                  "px-4 py-2 text-white rounded-md disabled:opacity-50",
                  isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isLoading ? "Saving..." : isEditing ? "Update Quiz" : "Create Quiz"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}