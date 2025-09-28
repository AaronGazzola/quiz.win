"use client";

import { useQuery } from "@tanstack/react-query";
import { getQuizResultAction } from "./page.actions";

export const useGetQuizResult = (quizId: string, userId?: string) => {

  return useQuery({
    queryKey: ["quiz-result", quizId, userId],
    queryFn: async () => {
      const { data, error } = await getQuizResultAction(quizId, userId);
      if (error) {
        throw new Error(error);
      }
      return data;
    },
    enabled: !!quizId,
  });
};