"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  GraduationCap,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Globe,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail, isConfigured } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await resetPasswordForEmail(email.trim());
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setIsSent(true);
      }
    } catch {
      setErrorMsg(language === "am" ? "የይለፍ ቃል መልሶ ማግኛ ጥያቄው አልተሳካም።" : "Failed to send reset link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setLanguage(language === "en" ? "am" : "en")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors shadow-2xs"
        >
          <Globe className="h-3.5 w-3.5 text-violet-600" />
          <span>{language === "en" ? "አማርኛ" : "English"}</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-violet-600 items-center justify-center text-white shadow-md mb-4">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {language === "am" ? "የይለፍ ቃልዎን ይቀይሩ" : "Reset your Password"}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
          {language === "am"
            ? "የይለፍ ቃል መቀየሪያ ሊንክ ወደ ኢሜይልዎ ይላካል"
            : "Enter your email to receive a password reset link"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="p-6 sm:p-8 border-stone-200/90 shadow-sm">
          {isSent ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {language === "am" ? "ሊንኩ ተልኳል" : "Reset Link Sent"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === "am"
                  ? `የይለፍ ቃል መቀየሪያ መመሪያ ወደ ${email} ተልኳል። እባክዎ ኢሜይልዎን ይመልከቱ።`
                  : `We sent password reset instructions to ${email}. Please check your inbox and spam folder.`}
              </p>
              <div className="pt-3">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="w-full">
                    {language === "am" ? "ወደ መግቢያ ገጽ ተመለስ" : "Back to Sign In"}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === "am" ? "የኢሜይል አድራሻ" : "Email address"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex.chen@student.edu"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{language === "am" ? "በመላክ ላይ..." : "Sending..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === "am" ? "የመቀየሪያ ሊንክ ላክ" : "Send Reset Link"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col items-center gap-3 text-xs text-slate-500">
                <Link
                  href="/auth/login"
                  className="font-semibold text-violet-600 hover:text-violet-800"
                >
                  {language === "am" ? "← ወደ መግቢያ ገጽ ተመለስ" : "← Back to Sign In"}
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
