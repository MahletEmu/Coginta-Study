"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  HelpCircle,
  CalendarCheck,
  TrendingUp,
  GraduationCap,
  User,
} from "lucide-react";
import { DEMO_USER } from "@/lib/mock-data";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({ onNavigate, className }: SidebarProps) {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const { user, profile, isConfigured } = useAuth();

  const navItems = [
    {
      title: t("nav.dashboard"),
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: t("nav.materials"),
      href: "/materials",
      icon: FolderOpen,
      badge: "4",
    },
    {
      title: t("nav.chat"),
      href: "/chat",
      icon: MessageSquare,
    },
    {
      title: t("nav.quiz"),
      href: "/quiz",
      icon: HelpCircle,
    },
    {
      title: t("nav.planner"),
      href: "/planner",
      icon: CalendarCheck,
    },
    {
      title: t("nav.progress"),
      href: "/progress",
      icon: TrendingUp,
    },
  ];

  return (
    <aside
      className={cn(
        "w-64 bg-white border-r border-stone-200 flex flex-col justify-between shrink-0 h-full",
        className
      )}
    >
      <div>
        {/* Logo / App Name */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-stone-100">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Cognita</span>
              <span className="text-[10px] bg-violet-100 text-violet-700 font-semibold px-1.5 py-0.5 rounded-sm">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Study Assistant</p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="p-3">
          <p className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {t("nav.workspace")}
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                    isActive
                      ? "bg-violet-50 text-violet-900 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-stone-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive
                          ? "text-violet-600"
                          : "text-slate-400 group-hover:text-slate-700"
                      )}
                    />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                        isActive
                          ? "bg-violet-200/80 text-violet-800"
                          : "bg-stone-100 text-slate-500"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: User Info / Auth State */}
      <div className="p-3 border-t border-stone-100">
        {user ? (
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-stone-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shrink-0 shadow-2xs">
              {profile?.fullName
                ? profile.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "ST"}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {profile?.fullName || "Student"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {profile?.email || t("nav.student")}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-stone-50 border border-stone-200/80">
              <div className="w-7 h-7 rounded-full bg-stone-200 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                <User className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {language === "am" ? "እንግዳ" : "Guest Mode"}
                </p>
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  {language === "am" ? "አልገቡም" : "Not signed in"}
                </p>
              </div>
            </div>

            <Link
              href="/auth/login"
              onClick={onNavigate}
              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors shadow-2xs"
            >
              <span>{language === "am" ? "ግባ / ተመዝገብ" : "Sign In / Register"}</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
