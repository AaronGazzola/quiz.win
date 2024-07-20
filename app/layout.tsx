import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

import Providers from "@/providers/Providers";
import cn from "classnames";
import Footer from "@/components/Layout/Footer";
import Header from "@/components/Layout/Header";
import { poppins } from "@/styles/fonts";

export const metadata: Metadata = {
  title: "Quiz.Win",
  description:
    "Play, Learn, Win! Create and complete gamified quizzes at Quiz.Win",
  authors: { name: "Aaron Gazzola" },
  keywords: "quiz, gamified learning, play, learn, win, education, games",
  robots: "index, follow",
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

// TODO: update theme color
export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={
          (cn(poppins.className),
          "min-h-screen flex flex-col border border-black relative dark:bg-slate-800 antialiased")
        }
      >
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
