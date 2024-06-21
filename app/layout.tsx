import type { Metadata, Viewport } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import NotificationProvider from "@/providers/NotificationProvider";
import ProgressProvider from "@/providers/ProgressProvider";
import "@/styles/globals.css";

import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap", // or other values for Display if applicable
  preload: true,
  fallback: ["Arial", "sans-serif"], // add more fallback fonts if needed
  adjustFontFallback: true,
  subsets: ["latin", "latin-ext"],
});

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
      <body className={poppins.className}>
        <ProgressProvider>
          <NotificationProvider>
            <AntdRegistry>{children}</AntdRegistry>
          </NotificationProvider>
        </ProgressProvider>
      </body>
    </html>
  );
}
