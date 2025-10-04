"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-4 right-4 h-8 w-8"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      {children}
    </div>
  );
}
