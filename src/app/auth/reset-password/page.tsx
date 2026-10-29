"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  GraduationCap,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const { language } = useLanguage();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg(language === "am" ? "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት" : "Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(language === "am" ? "የይለፍ ቃሎች አይመሳሰሉም" : "Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await updatePassword(password);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch {
      setErrorMsg(language === "am" ? "የይለፍ ቃል መቀየር አልተሳካም።" : "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-violet-600 items-center justify-center text-white shadow-md mb-4">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {language === "am" ? "አዲስ የይለፍ ቃል ያስገቡ" : "Create New Password"}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
          {language === "am"
            ? "እባክዎ ጠንካራ አዲስ የይለፍ ቃል ያስገቡ"
            : "Enter and confirm your new password"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="p-6 sm:p-8 border-stone-200/90 shadow-sm">
          {isSuccess ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {language === "am" ? "የይለፍ ቃል ተቀይሯል!" : "Password Updated!"}
              </h3>
              <p className="text-xs text-slate-500">
                {language === "am"
                  ? "ወደ ዋናው ገጽ በማዛወር ላይ..."
                  : "Redirecting you to the dashboard..."}
              </p>
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
                    {language === "am" ? "አዲስ የይለፍ ቃል" : "New Password"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === "am" ? "የይለፍ ቃል ያረጋግጡ" : "Confirm New Password"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
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
                      <span>{language === "am" ? "በመቀየር ላይ..." : "Updating..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === "am" ? "የይለፍ ቃል ቀይር" : "Update Password"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
