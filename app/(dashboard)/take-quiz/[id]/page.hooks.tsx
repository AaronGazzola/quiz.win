"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getQuizForTakingAction, submitResponseAction, getExistingResponseAction } from "./page.actions";
import { SubmitResponseData } from "./page.types";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";

export const useGetQuizForTaking = (quizId: string) => {
  const enabled = !!quizId;
  conditionalLog({hook:"useGetQuizForTaking",status:"initialized",enabled,quizId},{label:LOG_LABELS.DATA_FETCH});

  return useQuery({
    queryKey: ["quiz-taking", quizId],
    queryFn: async () => {
      conditionalLog({hook:"useGetQuizForTaking",status:"fetching",quizId},{label:LOG_LABELS.DATA_FETCH});
      const { data, error } = await getQuizForTakingAction(quizId);
      if (error) {
        conditionalLog({hook:"useGetQuizForTaking",status:"error",error},{label:LOG_LABELS.DATA_FETCH});
        throw new Error(error);
      }
      conditionalLog({hook:"useGetQuizForTaking",status:"success",hasData:!!data,title:data?.title},{label:LOG_LABELS.DATA_FETCH});
      return data;
    },
    enabled,
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
  const enabled = !!quizId;
  conditionalLog({hook:"useGetExistingResponse",status:"initialized",enabled,quizId},{label:LOG_LABELS.DATA_FETCH});

  return useQuery({
    queryKey: ["existing-response", quizId],
    queryFn: async () => {
      conditionalLog({hook:"useGetExistingResponse",status:"fetching",quizId},{label:LOG_LABELS.DATA_FETCH});
      const { data, error } = await getExistingResponseAction(quizId);
      if (error) {
        conditionalLog({hook:"useGetExistingResponse",status:"error",error},{label:LOG_LABELS.DATA_FETCH});
        throw new Error(error);
      }
      conditionalLog({hook:"useGetExistingResponse",status:"success",hasData:!!data},{label:LOG_LABELS.DATA_FETCH});
      return data;
    },
    enabled,
  });
};