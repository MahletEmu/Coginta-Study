import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Cognita | AI Study Assistant",
  description:
    "A clean, simple AI-powered study platform for high school and university students — notes, recall quizzes, and study planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full h-full bg-[#FAF9F6] text-slate-900 font-sans">
        <LanguageProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
