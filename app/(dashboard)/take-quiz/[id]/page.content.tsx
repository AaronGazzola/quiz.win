"use client";

import { useGetUser } from "@/app/layout.hooks";
import { queryClient } from "@/app/layout.providers";
import { cn } from "@/lib/shadcn.utils";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useGetExistingResponse,
  useGetQuizForTaking,
  useSubmitResponse,
} from "./page.hooks";
import { useQuizPlayerStore } from "./page.stores";

export function TakeQuizPageContent() {
  const { id } = useParams();
  const router = useRouter();
  const { data: user } = useGetUser();
  const quizId = Array.isArray(id) ? id[0] : id;

  const { data: quiz, isLoading: quizLoading } = useGetQuizForTaking(
    quizId || ""
  );
  const { data: existingResponse, isLoading: responseLoading } =
    useGetExistingResponse(quizId || "");
  const submitResponseMutation = useSubmitResponse();

  const {
    currentQuestionIndex,
    answers,
    isSubmitting,
    setCurrentQuestion,
    setAnswer,
    initializeAnswers,
    resetQuiz,
  } = useQuizPlayerStore();

  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (quiz && answers.length === 0 && quiz.Question.length > 0) {
      initializeAnswers(quiz.Question.length);
    }
  }, [quiz, answers.length, initializeAnswers]);

  if (!user) return null;

  if (quizLoading || responseLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/2 mb-6"></div>
          <div className="h-4 bg-muted rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-3/4"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-muted rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (quiz?.Question && currentQuestionIndex < quiz.Question.length - 1) {
      setCurrentQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestion(currentQuestionIndex - 1);
    }
  };

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-4">
          Quiz not found
        </h1>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Go back
        </button>
      </div>
    );
  }

  if (existingResponse && existingResponse.score !== null) {
    const userAnswers = Array.isArray(existingResponse.answers)
      ? (existingResponse.answers as {
          questionId: string;
          selectedAnswer: string;
          isCorrect: boolean;
        }[])
      : [];
    const scorePercentage = Math.round((existingResponse.score || 0) * 100);
    const correctAnswers = userAnswers.filter((a) => a.isCorrect).length;
    const currentQuestion = quiz.Question[currentQuestionIndex];
    const currentUserAnswer = userAnswers.find(
      (a) => a.questionId === currentQuestion?.id
    );
    const progress = ((currentQuestionIndex + 1) / quiz.Question.length) * 100;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </button>

          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 mr-2" />
                  {quiz.title} - Review
                </h1>
                {quiz.description && (
                  <p className="text-muted-foreground mt-1">
                    {quiz.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {scorePercentage}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {correctAnswers} of {quiz.Question.length} correct
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Completed on{" "}
                {new Date(existingResponse.completedAt).toLocaleDateString()}
              </div>
              <div>
                Question {currentQuestionIndex + 1} of {quiz.Question.length}
              </div>
            </div>

            <div className="w-full bg-muted rounded-full h-2 mt-4">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {currentQuestion && (
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-medium text-foreground mb-4">
                {currentQuestion.question}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option, optionIndex) => {
                  const isUserSelected =
                    currentUserAnswer?.selectedAnswer === option;
                  const isCorrect = currentQuestion.correctAnswer === option;
                  const isUserCorrect =
                    currentUserAnswer?.isCorrect && isUserSelected;
                  const isUserWrong =
                    !currentUserAnswer?.isCorrect && isUserSelected;

                  return (
                    <div
                      key={optionIndex}
                      className={cn(
                        "flex items-center p-4 border-2 rounded-lg",
                        isUserCorrect
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20 dark:border-green-500"
                          : isUserWrong
                            ? "border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-500"
                            : isCorrect
                              ? "border-green-300 bg-green-50/50 dark:bg-green-900/20 dark:border-green-500"
                              : "border-border bg-muted"
                      )}
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center",
                          isUserSelected
                            ? isUserCorrect
                              ? "border-green-500 bg-green-500"
                              : "border-red-500 bg-red-500"
                            : isCorrect
                              ? "border-green-500 bg-green-500"
                              : "border-border"
                        )}
                      >
                        {(isUserSelected || isCorrect) && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "flex-1",
                          isUserSelected || isCorrect
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {option}
                      </span>
                      {isUserSelected && (
                        <span className="ml-2 text-sm font-medium text-muted-foreground">
                          Your answer
                        </span>
                      )}
                      {isCorrect && !isUserSelected && (
                        <span className="ml-2 text-sm font-medium text-green-600 dark:text-green-400">
                          Correct answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {currentUserAnswer && (
                <div className="mt-4 p-3 rounded-lg bg-muted border border-border">
                  <div className="flex items-center text-sm">
                    {currentUserAnswer.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <span
                      className={cn(
                        "font-medium",
                        currentUserAnswer.isCorrect
                          ? "text-green-700 dark:text-green-300"
                          : "text-red-700 dark:text-red-300"
                      )}
                    >
                      {currentUserAnswer.isCorrect ? "Correct!" : "Incorrect"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-border">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex items-center px-4 py-2 text-muted-foreground border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              <div className="flex space-x-2">
                {quiz.Question.map((_, index) => {
                  const questionAnswer = userAnswers.find(
                    (a) => a.questionId === quiz.Question[index].id
                  );
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={cn(
                        "w-8 h-8 rounded-full text-sm font-medium border-2",
                        index === currentQuestionIndex
                          ? "border-primary bg-primary text-primary-foreground"
                          : questionAnswer?.isCorrect
                            ? "border-green-500 bg-green-500 text-white"
                            : questionAnswer
                              ? "border-red-500 bg-red-500 text-white"
                              : "border-border text-muted-foreground hover:border-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === quiz.Question.length - 1}
                className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentQuestion = quiz.Question[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.Question.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.Question.length - 1;
  const currentAnswer = answers[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setAnswer(currentQuestionIndex, answer);
  };

  const handleSubmitQuiz = async () => {
    const responses = quiz.Question.map((question, index) => ({
      questionId: question.id,
      selectedAnswer: answers[index],
      isCorrect: answers[index] === question.correctAnswer,
    }));

    const score =
      responses.filter((r) => r.isCorrect).length / responses.length;
    const timeSpentMinutes = Math.round((Date.now() - startTime) / 60000);

    await submitResponseMutation.mutateAsync({
      quizId: quiz.id,
      answers: responses,
      score,
      timeSpent: timeSpentMinutes,
    });

    queryClient.invalidateQueries({ queryKey: ["existing-response", quiz.id] });
    resetQuiz();
    setCurrentQuestion(0);
  };

  const answeredCount = answers.filter((answer) => answer !== null).length;
  const allAnswered = answeredCount === quiz.Question.length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className="text-muted-foreground mt-1">{quiz.description}</p>
            )}
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Question {currentQuestionIndex + 1} of {quiz.Question.length}
            </div>
            <div className="mt-1">
              {answeredCount} of {quiz.Question.length} answered
            </div>
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-2 mb-8">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {currentQuestion && (
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-foreground mb-4">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className={cn(
                    "flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors",
                    currentAnswer === option
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={currentAnswer === option}
                    onChange={() => handleAnswerSelect(option)}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "flex-shrink-0 w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center",
                      currentAnswer === option
                        ? "border-primary bg-primary"
                        : "border-border"
                    )}
                  >
                    {currentAnswer === option && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-foreground">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-border">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-4 py-2 text-muted-foreground border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="flex space-x-2">
              {quiz.Question.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={cn(
                    "w-8 h-8 rounded-full text-sm font-medium border-2",
                    index === currentQuestionIndex
                      ? "border-primary bg-primary text-primary-foreground"
                      : answers[index] !== null
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {isLastQuestion && allAnswered ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitResponseMutation.isPending || isSubmitting}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitResponseMutation.isPending || isSubmitting
                  ? "Submitting..."
                  : "Submit Quiz"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isLastQuestion}
                className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
