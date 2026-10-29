"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Globe,
  Database,
} from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const { signUp, isConfigured } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccessConfirmation, setIsSuccessConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg(language === "am" ? "እባክዎ ሁሉንም መስኮች ይሙሉ" : "Please fill out all fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg(language === "am" ? "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት" : "Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(language === "am" ? "የይለፍ ቃሎች አይመሳሰሉም" : "Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signUp(email.trim(), password, fullName.trim());
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.requiresConfirmation) {
        setIsSuccessConfirmation(true);
      } else {
        router.push("/");
      }
    } catch {
      setErrorMsg(language === "am" ? "መለያ በመፍጠር ላይ ስህተት ተፈጥሯል" : "Failed to register account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Language Switcher */}
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
          {language === "am" ? "የ Cognita አባል ይሁኑ" : "Create your Cognita Account"}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
          {language === "am"
            ? "የግል AI ጥናት ማስታወሻዎችን እና የደመና ማከማቻን ያግኙ"
            : "Cloud-synced study materials, AI-generated quizzes & task tracking"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="p-6 sm:p-8 border-stone-200/90 shadow-sm">
          {!isConfigured && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Database className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">
                  {language === "am" ? "Supabase አልተገናኘም (Demo Mode)" : "Supabase Not Connected (Demo Mode)"}
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {language === "am"
                    ? "የቀጥታ ምዝገባን ለመጠቀም በ .env.local ውስጥ Supabase ያዋቅሩ። በአማራጭ በ Demo Mode መቀጠል ይችላሉ።"
                    : "Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to register accounts."}
                </p>
                <div className="pt-1">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 font-bold text-violet-700 hover:text-violet-900 underline"
                  >
                    <span>{language === "am" ? "እንደ እንግዳ ቀጥል" : "Continue in Guest Mode"}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {isSuccessConfirmation ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {language === "am" ? "ኢሜይልዎን ያረጋግጡ" : "Check Your Email"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === "am"
                  ? `የማረጋገጫ መልዕክት ወደ ${email} ተልኳል። እባክዎ ኢሜይልዎን ከፍተው ሊንኩን በመጫን አካውንትዎን ያግብሩ።`
                  : `We sent a confirmation link to ${email}. Please check your inbox to activate your account.`}
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
                    {language === "am" ? "ሙሉ ስም" : "Full Name"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={language === "am" ? "ሙሉ ስምዎን ያስገቡ" : "e.g. Mahlet Bekele"}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors"
                    />
                  </div>
                </div>

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
                      placeholder="student@example.edu"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === "am" ? "የይለፍ ቃል (ቢያንስ 6 ፊደላት)" : "Password (min 6 characters)"}
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
                    {language === "am" ? "የይለፍ ቃል ያረጋግጡ" : "Confirm Password"}
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
                      <span>{language === "am" ? "በመመዝገብ ላይ..." : "Registering..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === "am" ? "መለያ ፍጠር" : "Create Account"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col items-center gap-3 text-xs text-slate-500">
                <p>
                  {language === "am" ? "መለያ አለዎት?" : "Already have an account?"}{" "}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-violet-600 hover:text-violet-800"
                  >
                    {language === "am" ? "ይግቡ" : "Sign in"}
                  </Link>
                </p>

                <Link
                  href="/"
                  className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {language === "am" ? "← ወደ ዋናው ገጽ ተመለስ" : "← Back to Dashboard"}
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
