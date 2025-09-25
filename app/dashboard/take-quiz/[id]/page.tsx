"use client";

import { useGetUser } from "@/app/layout.hooks";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/shadcn.utils";
import { useGetQuizForTaking, useSubmitResponse, useGetExistingResponse } from "./page.hooks";
import { useQuizPlayerStore } from "./page.stores";

export default function TakeQuizPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: user } = useGetUser();
  const quizId = Array.isArray(id) ? id[0] : id;

  const { data: quiz, isLoading: quizLoading } = useGetQuizForTaking(quizId || "");
  const { data: existingResponse } = useGetExistingResponse(quizId || "");
  const submitResponseMutation = useSubmitResponse();

  const {
    currentQuestionIndex,
    answers,
    isSubmitting,
    setCurrentQuestion,
    setAnswer,
    completeQuiz,
    initializeAnswers
  } = useQuizPlayerStore();

  const [startTime] = useState(Date.now());

  if (!user) return null;

  if (quizLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Quiz not found</h1>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800"
        >
          Go back
        </button>
      </div>
    );
  }

  if (existingResponse && existingResponse.score !== null) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Quiz Already Completed</h1>
        <p className="text-gray-600 mb-4">
          You completed this quiz on {new Date(existingResponse.completedAt).toLocaleDateString()}
        </p>
        <p className="text-xl font-semibold text-green-600 mb-6">
          Score: {Math.round((existingResponse.score || 0) * 100)}%
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (answers.length === 0 && quiz.questions.length > 0) {
    initializeAnswers(quiz.questions.length);
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const currentAnswer = answers[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setAnswer(currentQuestionIndex, answer);
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestion(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    const responses = quiz.questions.map((question, index) => ({
      questionId: question.id,
      selectedAnswer: answers[index],
      isCorrect: answers[index] === question.correctAnswer
    }));

    const score = responses.filter(r => r.isCorrect).length / responses.length;
    const timeSpentMinutes = Math.round((Date.now() - startTime) / 60000);

    await submitResponseMutation.mutateAsync({
      quizId: quiz.id,
      answers: responses,
      score,
      timeSpent: timeSpentMinutes
    });

    completeQuiz();
    router.push(`/dashboard/quiz-results/${quiz.id}`);
  };

  const answeredCount = answers.filter(answer => answer !== null).length;
  const allAnswered = answeredCount === quiz.questions.length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-gray-600 mt-1">{quiz.description}</p>
            )}
          </div>
          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
            <div className="mt-1">
              {answeredCount} of {quiz.questions.length} answered
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {currentQuestion && (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className={cn(
                    "flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors",
                    currentAnswer === option
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
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
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    )}
                  >
                    {currentAnswer === option && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="flex space-x-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={cn(
                    "w-8 h-8 rounded-full text-sm font-medium border-2",
                    index === currentQuestionIndex
                      ? "border-blue-500 bg-blue-500 text-white"
                      : answers[index] !== null
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
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
                {submitResponseMutation.isPending || isSubmitting ? "Submitting..." : "Submit Quiz"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isLastQuestion}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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