import type { Metadata, Viewport } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import NotificationProvider from "@/providers/NotificationProvider";
import ProgressProvider from "@/providers/ProgressProvider";

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
      <body>
        <ProgressProvider>
          <NotificationProvider>
            <AntdRegistry>{children}</AntdRegistry>
          </NotificationProvider>
        </ProgressProvider>
      </body>
    </html>
  );
}
