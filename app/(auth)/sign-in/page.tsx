"use client";

import { useState, Suspense } from "react";
import { signIn } from "@/lib/auth-client";
import { useSearchParams } from "next/navigation";
import DevSignInButtons from "./DevSignInButtons";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await signIn.magicLink({
        email,
        callbackURL: callbackUrl,
      });
      setIsEmailSent(true);
    } catch (error) {
      console.error("Failed to send magic link:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
        <p className="text-muted-foreground mb-4">
          We&apos;ve sent a magic link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Click the link in your email to sign in. The link will expire in 5 minutes.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Welcome to LMS</h2>
        <p className="text-muted-foreground mt-2">Sign in with your email address</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Send Magic Link"}
        </button>
      </form>

      <DevSignInButtons onSigningIn={(email) => setEmail(email)} />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}