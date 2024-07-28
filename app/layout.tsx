import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

import Providers from "@/providers/Providers";
import Footer from "@/components/Layout/Footer";
import { poppins } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import Header from "@/components/Layout/Header";

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
          (cn(poppins.className), "flex flex-col  antialiased min-h-screen")
        }
      >
        <Providers>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
