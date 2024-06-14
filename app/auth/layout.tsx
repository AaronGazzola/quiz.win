import React from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center px-2">
      {children}
    </main>
  );
}
