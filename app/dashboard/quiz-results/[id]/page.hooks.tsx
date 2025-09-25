"use client";

import { useQuery } from "@tanstack/react-query";
import { getQuizResultAction } from "./page.actions";

export const useGetQuizResult = (quizId: string) => {
  return useQuery({
    queryKey: ["quiz-result", quizId],
    queryFn: async () => {
      const { data, error } = await getQuizResultAction(quizId);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!quizId,
  });
};