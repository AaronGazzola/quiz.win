import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quiz.Win",
  description:
    "Play, Learn, Win! Create and complete gamified quizzes at Quiz.Win",
  authors: { name: "Aaron Gazzola" },
  keywords: "quiz, gamified learning, play, learn, win, education, games",
  viewport: "width=device-width, initial-scale=1.0",
  robots: "index, follow",
  themeColor: "#ffffff",
  openGraph: {
    title: "Quiz.Win",
    description:
      "Play, Learn, Win! Create and complete gamified quizzes at Quiz.Win",
    type: "website",
    url: "https://quiz.win",
    siteName: "Quiz.Win",
    images: "https://quiz.win/images/logo.png",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
