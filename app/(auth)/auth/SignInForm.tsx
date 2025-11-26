"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TestId } from "@/test.types";
import { useState } from "react";
import { useSignIn } from "./page.hooks";

interface SignInFormProps {
  onToggleMode: () => void;
}

export function SignInForm({ onToggleMode }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signInMutation = useSignIn();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signInMutation.mutate({ email, password });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid={TestId.AUTH_EMAIL_INPUT}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid={TestId.AUTH_PASSWORD_INPUT}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={signInMutation.isPending}
            data-testid={TestId.AUTH_SIGNIN_BUTTON}
          >
            {signInMutation.isPending ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary hover:underline"
              data-testid={TestId.AUTH_SIGNUP_LINK}
            >
              Sign up
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
