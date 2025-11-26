"use client";

import { useState } from "react";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { AuthMode } from "./page.types";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin");

  const toggleMode = () => {
    setMode((prev) => (prev === "signin" ? "signup" : "signin"));
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {mode === "signin" ? (
        <SignInForm onToggleMode={toggleMode} />
      ) : (
        <SignUpForm onToggleMode={toggleMode} />
      )}
    </div>
  );
}
