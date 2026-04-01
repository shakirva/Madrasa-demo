"use client";
import { Sidebar, BottomNav } from "@/components/Navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { useLanguageStore } from "@/store/language";
import { t } from "@/lib/i18n";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const { lang } = useLanguageStore();

  const roleLabel = (role: string) =>
    t("common", role as "admin" | "teacher" | "parent", lang);

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Sidebar />
      {/* Main */}
      <div className="lg:ml-64">

        {/* ── Mobile top bar ─────────────────────────────────── */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-0 flex items-center justify-between" style={{ minHeight: 56 }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white font-extrabold text-xs tracking-wide">DH</span>
            </div>
            <div className="leading-tight">
              <p className="font-bold text-gray-900 text-sm leading-none">{t("common", "appName", lang)}</p>
              <p className="text-[10px] text-emerald-600 font-semibold capitalize mt-0.5">{roleLabel(user?.role ?? "")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href={`/${user?.role}/notifications`}
              className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center active:scale-95 transition-transform"
            >
              <Bell className="w-4.5 h-4.5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </Link>
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.name?.charAt(0) ?? "U"}
            </div>
          </div>
        </header>

        {/* ── Desktop top bar ────────────────────────────────── */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-[#faf9f6]/90 backdrop-blur-md border-b border-gray-100 px-8 py-4 items-center justify-between">
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString(lang === "ml" ? "ml-IN" : "en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href={`/${user?.role}/notifications`} className="p-2 rounded-xl bg-white border border-gray-200 relative hover:bg-gray-50">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
              <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {user?.name?.charAt(0) ?? "U"}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 pb-28 lg:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
