"use client";

import { signIn } from "@/lib/auth-client";
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

export const useVerifyPassword = () => {
  return useMutation({
    mutationFn: async (password: string) => {
      const { data, error } = await verifyPasswordAction(password);
      if (error) throw error;
      return data;
    },
    onError: () => {
      toast.error("Incorrect password");
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
