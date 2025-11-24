"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getQuizForTakingAction, submitResponseAction, getExistingResponseAction } from "./page.actions";
import { createQuizWithQuestionsAction, updateQuizMetadataAction, CreateQuizWithQuestionsInput } from "@/app/(dashboard)/page.actions";
import { SubmitResponseData } from "./page.types";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";
import { useQuizCreationStore } from "./page.stores";

export const useGetQuizForTaking = (quizId: string) => {
  const enabled = !!quizId;
  conditionalLog({hook:"useGetQuizForTaking",status:"initialized",enabled,quizId},{label:LOG_LABELS.DATA_FETCH});
  conditionalLog({hook:"useGetQuizForTaking",quizId,enabled},{label:LOG_LABELS.QUIZ});

  return useQuery({
    queryKey: ["quiz-taking", quizId],
    queryFn: async () => {
      conditionalLog({hook:"useGetQuizForTaking",status:"fetching",quizId},{label:LOG_LABELS.DATA_FETCH});
      conditionalLog({hook:"useGetQuizForTaking",action:"callingAction",quizId},{label:LOG_LABELS.QUIZ});
      const { data, error } = await getQuizForTakingAction(quizId);
      if (error) {
        conditionalLog({hook:"useGetQuizForTaking",status:"error",error},{label:LOG_LABELS.DATA_FETCH});
        conditionalLog({hook:"useGetQuizForTaking",quizId,error},{label:LOG_LABELS.QUIZ});
        throw new Error(error);
      }
      conditionalLog({hook:"useGetQuizForTaking",status:"success",hasData:!!data,title:data?.title},{label:LOG_LABELS.DATA_FETCH});
      conditionalLog({hook:"useGetQuizForTaking",quizId,success:true,title:data?.title},{label:LOG_LABELS.QUIZ});
      return data;
    },
    enabled,
  });
};

export const useSubmitResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubmitResponseData) => {
      const { data: response, error } = await submitResponseAction(data);
      if (error) throw new Error(error);
      return response;
    },
    onSuccess: () => {
      toast.success("Quiz completed successfully!");
      queryClient.invalidateQueries({ queryKey: ["gamification-profile"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
    },
    onError: (error: Error) => {
      console.error(JSON.stringify({ hook: "useSubmitResponse", error }));
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

export const useCreateQuizWithQuestions = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuizWithQuestionsInput) => {
      const { data: quiz, error } = await createQuizWithQuestionsAction(data);
      if (error) throw new Error(error);
      return quiz;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz created successfully!");
      useQuizCreationStore.getState().reset();
      router.push("/");
    },
    onError: (error: Error) => {
      console.error(JSON.stringify({ hook: "useCreateQuizWithQuestions", error }));
      toast.error(error.message || "Failed to create quiz");
    },
  });
};

export const useUpdateQuizMetadata = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title: string; description?: string } }) => {
      const { data: quiz, error } = await updateQuizMetadataAction(id, data);
      if (error) throw new Error(error);
      return quiz;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz updated successfully!");
      useQuizCreationStore.getState().reset();
      router.push("/");
    },
    onError: (error: Error) => {
      console.error(JSON.stringify({ hook: "useUpdateQuizMetadata", error }));
      toast.error(error.message || "Failed to update quiz");
    },
  });
};