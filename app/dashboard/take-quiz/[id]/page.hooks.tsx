"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getQuizForTakingAction, submitResponseAction, getExistingResponseAction } from "./page.actions";
import { SubmitResponseData } from "./page.types";

export const useGetQuizForTaking = (quizId: string) => {
  return useQuery({
    queryKey: ["quiz-taking", quizId],
    queryFn: async () => {
      const { data, error } = await getQuizForTakingAction(quizId);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!quizId,
  });
};

export const useSubmitResponse = () => {
  return useMutation({
    mutationFn: async (data: SubmitResponseData) => {
      const { data: response, error } = await submitResponseAction(data);
      if (error) throw new Error(error);
      return response;
    },
    onSuccess: () => {
      toast.success("Quiz completed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit quiz responses");
    },
  });
};

export const useGetExistingResponse = (quizId: string) => {
  return useQuery({
    queryKey: ["existing-response", quizId],
    queryFn: async () => {
      const { data, error } = await getExistingResponseAction(quizId);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!quizId,
  });
};