"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { X } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // If on an auth route, render bare without navigation chrome
  if (pathname.startsWith("/auth")) {
    return <main className="min-h-screen bg-[#FAF9F6]">{children}</main>;
  }

  return (
    <div className="flex h-screen w-full bg-[#FAF9F6] overflow-hidden text-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="absolute top-3 right-3 z-20">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
