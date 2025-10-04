"use client";

import { signIn } from "@/lib/auth-client";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getPasswordLengthAction, getUsersWithOrganizationsAction, verifyPasswordAction } from "./page.actions";

export const useGetPasswordLength = () => {
  return useQuery({
    queryKey: ["passwordLength"],
    queryFn: async () => {
      const { data, error } = await getPasswordLengthAction();
      if (error) throw error;
      return data;
    },
    staleTime: Infinity,
  });
};

export const useVerifyPassword = (onSuccess: (isValid: boolean) => void, onError: () => void) => {
  return useMutation({
    mutationFn: async (password: string) => {
      conditionalLog({action:"verifyPasswordMutation",passwordLength:password.length},{label:LOG_LABELS.AUTH});
      const { data, error } = await verifyPasswordAction(password);
      conditionalLog({verifyResult:{data,error}},{label:LOG_LABELS.AUTH});
      if (error) throw error;
      return data ?? false;
    },
    onSuccess: (isValid) => {
      conditionalLog({action:"verifyPasswordSuccess",isValid},{label:LOG_LABELS.AUTH});
      onSuccess(isValid);
    },
    onError: () => {
      conditionalLog({action:"verifyPasswordMutationError"},{label:LOG_LABELS.AUTH});
      toast.error("Incorrect password");
      onError();
    },
  });
};

export const useGetUsers = (enabled: boolean) => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await getUsersWithOrganizationsAction();
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: Infinity,
  });
};

export const useSignInWithPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { error } = await signIn.email({ email, password });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Successfully signed in");
      router.push("/");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to sign in");
    },
  });
};
