"use client";

import { configuration } from "@/configuration";
import { signIn, signUp } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppStore } from "../../layout.stores";
import { getUserAction } from "../../layout.actions";
import { SignInData, SignUpData } from "./page.types";
import { createOrganizationAfterSignUpAction } from "./page.actions";

export const useSignIn = () => {
  const { setUser } = useAppStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (signInData: SignInData) => {
      const { error } = await signIn.email({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) throw error;

      const { data: userData, error: userError } = await getUserAction();
      if (userError) throw new Error(userError);

      return userData;
    },
    onSuccess: (data) => {
      if (data) {
        setUser(data);
      }
      toast.success("Successfully signed in");
      router.push(configuration.paths.home);
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to sign in");
    },
  });
};

export const useSignUp = () => {
  const { setUser } = useAppStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (signUpData: SignUpData) => {
      console.log("🔵 [HOOK] Starting sign-up mutation");

      const { error } = await signUp.email({
        email: signUpData.email,
        password: signUpData.password,
        name: signUpData.name,
      });

      if (error) {
        console.error("🔴 [HOOK] Sign-up email failed:", error);
        throw error;
      }

      console.log("🔵 [HOOK] Sign-up email succeeded");

      const organizationName = `${signUpData.name}'s Organization`;
      const slug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      console.log("🔵 [HOOK] Calling org creation action", { organizationName, slug });

      const orgResult = await createOrganizationAfterSignUpAction(
        organizationName,
        slug
      );

      console.log("🔵 [HOOK] Org action result:", JSON.stringify(orgResult));

      if (orgResult.error) {
        console.error("🔴 [HOOK] Org creation failed:", orgResult.error);
        throw new Error(orgResult.error);
      }

      console.log("🔵 [HOOK] Calling getUserAction");

      const { data: userData, error: userError } = await getUserAction();

      console.log("🔵 [HOOK] getUserAction result:", { hasData: !!userData, hasError: !!userError });

      if (userError) {
        console.error("🔴 [HOOK] getUserAction failed:", userError);
        throw new Error(userError);
      }

      console.log("🔵 [HOOK] Mutation completed successfully");
      return userData;
    },
    onSuccess: (data) => {
      console.log("🟢 [HOOK] onSuccess called, redirecting to:", configuration.paths.home);
      if (data) {
        setUser(data);
      }
      toast.success("Account created successfully");
      router.push(configuration.paths.home);
    },
    onError: (error: { message?: string }) => {
      console.error("🔴 [HOOK] onError called:", error?.message);
      toast.error(error?.message || "Failed to create account");
    },
  });
};
