"use client";

import { useQuery } from "@tanstack/react-query";
import { getQuizResultAction } from "./page.actions";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";

export const useGetQuizResult = (quizId: string, userId?: string) => {
  const enabled = !!quizId;
  conditionalLog({hook:"useGetQuizResult",status:"initialized",enabled,quizId,userId},{label:LOG_LABELS.DATA_FETCH});

  return useQuery({
    queryKey: ["quiz-result", quizId, userId],
    queryFn: async () => {
      conditionalLog({hook:"useGetQuizResult",status:"fetching",quizId,userId},{label:LOG_LABELS.DATA_FETCH});
      const { data, error } = await getQuizResultAction(quizId, userId);
      if (error) {
        conditionalLog({hook:"useGetQuizResult",status:"error",error},{label:LOG_LABELS.DATA_FETCH});
        throw new Error(error);
      }
      conditionalLog({hook:"useGetQuizResult",status:"success",hasData:!!data},{label:LOG_LABELS.DATA_FETCH});
      return data;
    },
    enabled,
  });
};