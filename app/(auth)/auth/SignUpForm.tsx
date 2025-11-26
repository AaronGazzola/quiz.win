"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TestId } from "@/test.types";
import { useState } from "react";
import { useSignUp } from "./page.hooks";

interface SignUpFormProps {
  onToggleMode: () => void;
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signUpMutation = useSignUp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signUpMutation.mutate({ name, email, password });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle data-testid={TestId.AUTH_CREATE_ACCOUNT_HEADING}>Create Account</CardTitle>
        <CardDescription>Sign up to get started with your organization</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              data-testid={TestId.AUTH_NAME_INPUT}
            />
          </div>
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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              data-testid={TestId.AUTH_PASSWORD_INPUT}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={signUpMutation.isPending}
            data-testid={TestId.AUTH_SIGNUP_BUTTON}
          >
            {signUpMutation.isPending ? "Creating account..." : "Create Account"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-primary hover:underline"
              data-testid={TestId.AUTH_SIGNIN_LINK}
            >
              Sign in
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
