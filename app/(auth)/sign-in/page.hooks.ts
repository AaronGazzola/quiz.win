"use client";

import { signIn } from "@/lib/auth-client";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getPasswordLengthAction, getUsersWithOrganizationsAction, verifyPasswordAction } from "./page.actions";

export const useGetPasswordLength = () => {
  conditionalLog({hook:"useGetPasswordLength",status:"initialized"},{label:LOG_LABELS.DATA_FETCH});

  return useQuery({
    queryKey: ["passwordLength"],
    queryFn: async () => {
      conditionalLog({hook:"useGetPasswordLength",status:"fetching"},{label:LOG_LABELS.DATA_FETCH});
      const { data, error } = await getPasswordLengthAction();
      if (error) {
        conditionalLog({hook:"useGetPasswordLength",status:"error",error},{label:LOG_LABELS.DATA_FETCH});
        console.error(JSON.stringify({hook:"useGetPasswordLength",error}));
        throw error;
      }
      conditionalLog({hook:"useGetPasswordLength",status:"success",passwordLength:data},{label:LOG_LABELS.DATA_FETCH});
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
    onError: (error: unknown) => {
      console.error(JSON.stringify({ hook: "useVerifyPassword", error }));
      conditionalLog({action:"verifyPasswordMutationError"},{label:LOG_LABELS.AUTH});
      toast.error("Incorrect password");
      onError();
    },
  });
};

export const useGetUsers = (enabled: boolean) => {
  conditionalLog({hook:"useGetUsers_signIn",status:"initialized",enabled},{label:LOG_LABELS.DATA_FETCH});

  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      conditionalLog({hook:"useGetUsers_signIn",status:"fetching"},{label:LOG_LABELS.DATA_FETCH});
      const { data, error } = await getUsersWithOrganizationsAction();
      if (error) {
        conditionalLog({hook:"useGetUsers_signIn",status:"error",error},{label:LOG_LABELS.DATA_FETCH});
        console.error(JSON.stringify({hook:"useGetUsers_signIn",error}));
        throw error;
      }
      conditionalLog({hook:"useGetUsers_signIn",status:"success",userCount:data?.length},{label:LOG_LABELS.DATA_FETCH});
      return data;
    },
    enabled,
    staleTime: Infinity,
  });
};

export const useSignInWithPassword = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { error } = await signIn.email({ email, password });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Successfully signed in");
      router.push("/");
    },
    onError: (error: { message?: string }) => {
      console.error(JSON.stringify({ hook: "useSignInWithPassword", error }));
      toast.error(error?.message || "Failed to sign in");
    },
  });
};
