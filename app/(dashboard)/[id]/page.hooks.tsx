"use client";

import { useQuery } from "@tanstack/react-query";
import { getQuizResultAction } from "./page.actions";

export const useGetQuizResult = (quizId: string, userId?: string) => {
  console.log(JSON.stringify({hook:"useGetQuizResult",quizId,userId}));

  return useQuery({
    queryKey: ["quiz-result", quizId, userId],
    queryFn: async () => {
      console.log(JSON.stringify({hook:"useGetQuizResult",calling:"getQuizResultAction",quizId,userId}));
      const { data, error } = await getQuizResultAction(quizId, userId);
      if (error) {
        console.log(JSON.stringify({hook:"useGetQuizResult",error}));
        throw new Error(error);
      }
      console.log(JSON.stringify({hook:"useGetQuizResult",success:!!data}));
      return data;
    },
    enabled: !!quizId,
  });
};