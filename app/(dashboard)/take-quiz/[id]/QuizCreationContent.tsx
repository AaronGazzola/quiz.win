"use client";

import { useAppStore } from "@/app/layout.stores";
import { cn } from "@/lib/shadcn.utils";
import { TestId } from "@/test.types";
import { ChevronLeft, ChevronRight, Plus, X, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuizCreationStore } from "./page.stores";
import { useCreateQuizWithQuestions, useUpdateQuizMetadata } from "./page.hooks";
import { useEffect, useState, useRef, DragEvent } from "react";
import { QuizForTaking, QuizImportJSON } from "./page.types";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

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
    populateFromJSON,
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

  const [isDragging, setIsDragging] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const dragCounterRef = useRef(0);

  const validateImportJSON = (data: unknown): data is QuizImportJSON => {
    if (!data || typeof data !== "object") return false;
    const json = data as Record<string, unknown>;
    if (typeof json.title !== "string" || !json.title.trim()) return false;
    if (!Array.isArray(json.questions) || json.questions.length === 0) return false;
    for (const q of json.questions) {
      if (typeof q !== "object" || !q) return false;
      const question = q as Record<string, unknown>;
      if (typeof question.question !== "string" || !question.question.trim()) return false;
      if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 6) return false;
      if (question.options.some((opt: unknown) => typeof opt !== "string" || !(opt as string).trim())) return false;
      if (typeof question.correctAnswer !== "number" || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) return false;
    }
    return true;
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (mode !== "create") return;

    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(f => f.name.endsWith(".json"));
    if (!jsonFile) {
      toast.error("Please drop a JSON file");
      return;
    }

    try {
      const text = await jsonFile.text();
      const data = JSON.parse(text);
      if (!validateImportJSON(data)) {
        toast.error("Invalid JSON format. Check the expected structure.");
        return;
      }
      populateFromJSON(data);
      toast.success(`Imported quiz with ${data.questions.length} questions`);
    } catch {
      toast.error("Failed to parse JSON file");
    }
  };

  const handleJsonPasteSubmit = () => {
    if (!jsonInput.trim()) {
      toast.error("Please paste JSON content");
      return;
    }

    try {
      const data = JSON.parse(jsonInput);
      if (!validateImportJSON(data)) {
        toast.error("Invalid JSON format. Check the expected structure.");
        return;
      }
      populateFromJSON(data);
      toast.success(`Imported quiz with ${data.questions.length} questions`);
      setJsonInput("");
      setIsPopoverOpen(false);
    } catch {
      toast.error("Failed to parse JSON");
    }
  };

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

  const aiPrompt = `Generate a quiz in JSON format with the following structure:

{
  "title": "Quiz Title",
  "description": "Optional description",
  "questions": [
    {
      "question": "What is the question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Requirements:
- title: Required string
- description: Optional string
- questions: Array of at least 1 question
- Each question needs:
  - question: string (the question text)
  - options: array of 2-6 strings
  - correctAnswer: 0-based index of correct option

Example prompt: "Create a 5-question quiz about [topic]"`;

  return (
    <div
      className="relative max-w-4xl mx-auto p-6"
      data-testid={TestId.QUIZ_CREATE_CONTAINER}
      onDragEnter={mode === "create" ? handleDragEnter : undefined}
      onDragLeave={mode === "create" ? handleDragLeave : undefined}
      onDragOver={mode === "create" ? handleDragOver : undefined}
      onDrop={mode === "create" ? handleDrop : undefined}
    >
      {isDragging && mode === "create" && (
        <div
          className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center pointer-events-none"
          data-testid={TestId.QUIZ_CREATE_JSON_DROP_OVERLAY}
        >
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-2 text-primary" />
            <p className="text-lg font-medium text-primary">Drop JSON file to import quiz</p>
          </div>
        </div>
      )}

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
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {mode === "create" ? "Create New Quiz" : "Edit Quiz"}
            </h1>
            {mode === "create" && (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted gap-1"
                    data-testid={TestId.QUIZ_CREATE_JSON_IMPORT_BADGE}
                  >
                    <Upload className="w-3 h-3" />
                    Drop JSON
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-96" align="end">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Paste Quiz JSON</h4>
                      <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-border rounded-md bg-background text-foreground font-mono h-32 resize-none"
                        placeholder='{"title": "...", "questions": [...]}'
                        data-testid={TestId.QUIZ_CREATE_JSON_IMPORT_TEXTAREA}
                      />
                      <button
                        onClick={handleJsonPasteSubmit}
                        className="w-full px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        data-testid={TestId.QUIZ_CREATE_JSON_IMPORT_BUTTON}
                      >
                        Import JSON
                      </button>
                    </div>

                    <div className="border-t border-border pt-4 space-y-2">
                      <h4 className="font-medium">AI Prompt for Quiz Generation</h4>
                      <p className="text-sm text-muted-foreground">
                        Copy this prompt and use it with your preferred AI to generate quiz JSON.
                      </p>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-48 whitespace-pre-wrap">
                        {aiPrompt}
                      </pre>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiPrompt);
                          toast.success("Prompt copied to clipboard");
                        }}
                        className="w-full px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted"
                        data-testid={TestId.QUIZ_CREATE_JSON_IMPORT_COPY_PROMPT_BUTTON}
                      >
                        Copy Prompt
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

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
