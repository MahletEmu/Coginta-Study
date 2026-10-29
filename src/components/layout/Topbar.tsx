"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  Database,
  ChevronDown,
  Globe,
  Check,
} from "lucide-react";
import { DEMO_USER } from "@/lib/mock-data";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { SearchModal } from "@/components/layout/SearchModal";
import { SupabaseSetupModal } from "@/components/layout/SupabaseSetupModal";

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, isConfigured, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close language menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLanguageMenu(false);
      }
    };
    if (showLanguageMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLanguageMenu]);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getPageTitle = () => {
    if (pathname === "/") return t("nav.dashboard");
    if (pathname.startsWith("/materials")) return t("nav.materials");
    if (pathname.startsWith("/chat")) return t("nav.chat");
    if (pathname.startsWith("/quiz")) return t("nav.quiz");
    if (pathname.startsWith("/planner")) return t("nav.planner");
    if (pathname.startsWith("/progress")) return t("nav.progress");
    return t("nav.dashboard");
  };

  const notifications = [
    {
      id: "n1",
      title: language === "am" ? "የባዮሎጂ ፈተና ተጠናቋል" : "Biology Quiz Completed",
      time: "15m",
      desc: language === "am" ? "100% ውጤት ተመዝግቧል" : "100% score recorded",
      unread: true,
    },
    {
      id: "n2",
      title: language === "am" ? "የጥናት ማስታወሻ ተመዝግቧል" : "Study Note Added",
      time: "2h",
      desc: language === "am" ? "አልጎሪዝም ማስታወሻ ለጥናት ዝግጁ ነው" : "Algorithm summary is ready to review",
      unread: false,
    },
  ];

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right: Search, Language Switcher, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Trigger Button (Desktop) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="relative hidden md:flex items-center w-48 lg:w-60 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-400 hover:text-slate-600 transition-all cursor-pointer text-left group"
          title={language === "am" ? "ፈልግ" : "Search"}
        >
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-hover:text-violet-600 transition-colors" />
          <span className="truncate">{t("topbar.searchPlaceholder")}</span>
        </button>

        {/* Mobile Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Language Switcher Dropdown (🌐 Eng ⌄) */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-stone-100 transition-colors cursor-pointer group"
            title={language === "am" ? "ቋንቋ ይቀይሩ (Change Language)" : "Change Language"}
            aria-expanded={showLanguageMenu}
          >
            <Globe className="h-4 w-4 text-slate-700 group-hover:text-violet-600 transition-colors" />
            <span className="text-xs font-semibold tracking-tight text-slate-800">
              {language === "am" ? "አማ" : "Eng"}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200",
                showLanguageMenu && "rotate-180 text-violet-600"
              )}
            />
          </button>

          {showLanguageMenu && (
            <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-xl border border-stone-200 shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setLanguage("en");
                  setShowLanguageMenu(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer",
                  language === "en"
                    ? "bg-violet-50 text-violet-700 font-semibold"
                    : "text-slate-700 hover:bg-stone-50"
                )}
              >
                <span>English</span>
                {language === "en" && (
                  <Check className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                )}
              </button>

              <button
                onClick={() => {
                  setLanguage("am");
                  setShowLanguageMenu(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer",
                  language === "am"
                    ? "bg-violet-50 text-violet-700 font-semibold"
                    : "text-slate-700 hover:bg-stone-50"
                )}
              >
                <span>አማርኛ</span>
                {language === "am" && (
                  <Check className="h-3.5 w-3.5 text-violet-600 shrink-0" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-600 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-stone-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  {t("topbar.notifications")}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setUnreadCount(0)}
                    className="text-[11px] text-violet-600 hover:text-violet-800 font-medium cursor-pointer"
                  >
                    {t("topbar.markRead")}
                  </button>
                )}
              </div>
              <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-800">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Pill / Avatar / Auth dropdown */}
        <div className="relative pl-2 border-l border-stone-200">
          {user ? (
            <div>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shadow-xs">
                  {profile?.fullName
                    ? profile.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "ST"}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-none">
                    {profile?.fullName || "Student"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
                    {profile?.email || t("nav.student")}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden xl:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-stone-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {profile?.fullName || "Student"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {profile?.email}
                    </p>
                    <span className="inline-block mt-1 text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-1.5 py-0.5 rounded font-semibold">
                      Cloud Account Active
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>{language === "am" ? "ውጣ" : "Sign Out"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <User className="h-3.5 w-3.5" />
                <span>{language === "am" ? "ግባ" : "Sign In"}</span>
              </Link>
              <Link
                href="/auth/register"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
              >
                <span>{language === "am" ? "ተመዝገብ" : "Register"}</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Global Spotlight Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Supabase Database Connection Modal */}
      <SupabaseSetupModal
        isOpen={showDbModal}
        onClose={() => setShowDbModal(false)}
      />
    </header>
  );
}
