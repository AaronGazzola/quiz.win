"use client";

import { useAdminAccess, useGetUser } from "@/app/layout.hooks";
import { cn } from "@/lib/shadcn.utils";
import { CheckCircle, ChevronLeft, Clock, Trophy, XCircle } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGetQuizResult } from "./page.hooks";

export function QuizResultPageContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user } = useGetUser();
  const hasAdminAccess = useAdminAccess();
  const quizId = Array.isArray(id) ? id[0] : id;
  const userId = searchParams.get("userId") || undefined;
  const isViewingOtherUser = userId && user && userId !== user.id;

  const { data: result, isLoading } = useGetQuizResult(quizId || "", userId);

  if (!user) return null;

  if (isViewingOtherUser) {
    if (!hasAdminAccess) {
      return (
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have permission to view other users&apos; quiz
            results.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-primary hover:text-primary/80"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/2 mb-6"></div>
          <div className="h-32 bg-muted rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-muted rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-4">
          Result not found
        </h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const response = result;
  const { quiz } = result;
  const scorePercentage = Math.round((response.score || 0) * 100);
  const answers = Array.isArray(response.answers)
    ? (response.answers as {
        questionId: string;
        selectedAnswer: string;
        isCorrect: boolean;
      }[])
    : [];
  const correctAnswers = answers.filter(
    (a) => (a as { isCorrect: boolean }).isCorrect
  ).length;
  const totalQuestions = answers.length;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Trophy className="w-8 h-8 text-green-600" />;
    if (score >= 60) return <CheckCircle className="w-8 h-8 text-yellow-600" />;
    return <XCircle className="w-8 h-8 text-red-600" />;
  };

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

        <div className="text-center bg-card border border-border rounded-lg p-8 mb-6">
          <div className="flex justify-center mb-4">
            {getScoreIcon(scorePercentage)}
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Quiz Complete!
          </h1>
          <h2 className="text-xl text-muted-foreground mb-6">{quiz.title}</h2>

          <div
            className={cn(
              "text-6xl font-bold mb-4",
              getScoreColor(scorePercentage)
            )}
          >
            {scorePercentage}%
          </div>

          <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="font-semibold text-foreground">
                {correctAnswers}
              </div>
              <div>Correct</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">
                {totalQuestions - correctAnswers}
              </div>
              <div>Incorrect</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">
                {totalQuestions}
              </div>
              <div>Total Questions</div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-1" />
            Completed on {new Date(
              response.completedAt
            ).toLocaleDateString()}{" "}
            at {new Date(response.completedAt).toLocaleTimeString()}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Question Review
          </h3>

          <div className="space-y-4">
            {answers.map(
              (
                answer: {
                  questionId: string;
                  selectedAnswer: string;
                  isCorrect: boolean;
                },
                index: number
              ) => {
                const question = quiz.Question.find(
                  (q: { id: string }) => q.id === answer.questionId
                );
                if (!question) return null;

                return (
                  <div
                    key={answer.questionId}
                    className={cn(
                      "border-l-4 pl-4 py-3",
                      answer.isCorrect
                        ? "border-green-400 bg-green-50 dark:bg-green-950/20"
                        : "border-red-400 bg-red-50 dark:bg-red-950/20"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {answer.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mr-2" />
                          )}
                          <span className="font-medium text-foreground">
                            Question {index + 1}
                          </span>
                        </div>

                        <p className="text-foreground mb-3">
                          {question.question}
                        </p>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Your answer:{" "}
                            </span>
                            <span
                              className={cn(
                                answer.isCorrect
                                  ? "text-green-700 dark:text-green-300"
                                  : "text-red-700 dark:text-red-300"
                              )}
                            >
                              {answer.selectedAnswer || "No answer selected"}
                            </span>
                          </div>

                          {!answer.isCorrect && (
                            <div>
                              <span className="font-medium text-muted-foreground">
                                Correct answer:{" "}
                              </span>
                              <span className="text-green-700 dark:text-green-300">
                                {question.correctAnswer}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
