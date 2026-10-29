"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import {
  Database,
  KeyRound,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  HardDrive,
} from "lucide-react";

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupabaseSetupModal({ isOpen, onClose }: SupabaseSetupModalProps) {
  const { language } = useLanguage();
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const envTemplate = `NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsIn..."
# Optional: server-only admin key
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsIn..."`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        language === "am"
          ? "Supabase ዳታቤዝ እና የደመና ማከማቻ ማዋቀር"
          : "Connect Supabase Database & Cloud Storage"
      }
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs text-slate-600">
        <p className="leading-relaxed">
          {language === "am"
            ? "Cognita የተጠቃሚ መለያዎችን፣ የጥናት ማስታወሻዎችን፣ ፈተናዎችን እና ዶክመንቶችን በደመና ላይ ለማስቀመጥ Supabaseን ይጠቀማል። በነጻ የራስዎን Supabase ፕሮጀክት ለማገናኘት የሚከተሉትን ደረጃዎች ይከተሉ፦"
            : "Cognita uses Supabase (PostgreSQL, Auth, and Storage) for user accounts, cloud document persistence, and AI study history. Follow these 3 simple steps to connect your project:"}
        </p>

        {/* Step 1: Create Supabase Project */}
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[11px]">
                1
              </span>
              <span>
                {language === "am" ? "በነጻ Supabase ፕሮጀክት ይፍጠሩ" : "Create Free Supabase Project"}
              </span>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-800"
            >
              <span>supabase.com/dashboard</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="text-[11px] text-slate-500 pl-7">
            {language === "am"
              ? "ወደ Supabase Dashboard በመሄድ 'New Project' ይጫኑ እና የይለፍ ቃል ይምረጡ።"
              : "Sign in to Supabase, click 'New Project', and select a project name and database password."}
          </p>
        </div>

        {/* Step 2: Run SQL Migration */}
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[11px]">
                2
              </span>
              <span>
                {language === "am" ? "የዳታቤዝ ሠንጠረዦችን ይፍጠሩ (SQL Migration)" : "Run Database Migration"}
              </span>
            </div>
            <span className="text-[10px] bg-stone-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
              supabase/migrations/
            </span>
          </div>
          <p className="text-[11px] text-slate-500 pl-7">
            {language === "am"
              ? "በ Supabase SQL Editor ውስጥ በፕሮጀክቱ ውስጥ ያለውን supabase/migrations/20261029000000_stage4_schema.sql ፋይል ኮፒ አድርገው ያሂዱ (Run ያድርጉ)።"
              : "In your Supabase dashboard, open SQL Editor, paste the contents of `supabase/migrations/20261029000000_stage4_schema.sql`, and click 'Run'. This creates the tables, RLS security policies, and storage bucket."}
          </p>
        </div>

        {/* Step 3: Add Environment Variables */}
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[11px]">
                3
              </span>
              <span>
                {language === "am" ? "በ .env.local ፋይል ውስጥ ያስገቡ" : "Add Variables to .env.local"}
              </span>
            </div>
            <button
              onClick={handleCopyEnv}
              className="inline-flex items-center gap-1 text-[11px] text-violet-600 hover:text-violet-800 font-medium cursor-pointer"
            >
              {copiedEnv ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy Template</span>
                </>
              )}
            </button>
          </div>
          <div className="pl-7">
            <pre className="p-2.5 bg-stone-900 text-stone-100 rounded-lg font-mono text-[11px] overflow-x-auto select-all">
              {envTemplate}
            </pre>
          </div>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-900 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-semibold">Row Level Security (RLS) Active:</span>{" "}
            {language === "am"
              ? "እያንዳንዱ ተማሪ የራሱን ማስታወሻዎች እና ፈተናዎች ብቻ እንዲያይ በዳታቤዝ ደረጃ ጥበቃ ተደርጓል።"
              : "Every user account is strictly isolated. Database-level RLS policies ensure students can only query and modify their own records."}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-stone-100">
          <Button size="sm" onClick={onClose}>
            {language === "am" ? "ተረድቻለሁ" : "Got It"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
