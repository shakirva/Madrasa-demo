"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, ClipboardList, BookOpen, FileText,
  CreditCard, BarChart3, Bell, Settings, Star, BookMarked,
  UserCircle, Home, GraduationCap, Moon
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

const adminLinks = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/students", icon: Users, label: "Students" },
  { href: "/admin/fees", icon: CreditCard, label: "Fees" },
  { href: "/admin/exams", icon: GraduationCap, label: "Exams" },
  { href: "/admin/reports", icon: BarChart3, label: "Reports" },
  { href: "/admin/seats", icon: BookMarked, label: "Seats" },
  { href: "/admin/config", icon: Settings, label: "Config" },
];

const teacherLinks = [
  { href: "/teacher", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/teacher/attendance", icon: ClipboardList, label: "Attendance" },
  { href: "/teacher/homework", icon: BookOpen, label: "Homework" },
  { href: "/teacher/diary", icon: FileText, label: "Diary" },
  { href: "/teacher/ibadah", icon: Moon, label: "Ibadah" },
  { href: "/teacher/exams", icon: GraduationCap, label: "Exams" },
  { href: "/teacher/performance", icon: Star, label: "Performance" },
];

const parentLinks = [
  { href: "/parent", icon: Home, label: "Home" },
  { href: "/parent/attendance", icon: ClipboardList, label: "Attendance" },
  { href: "/parent/homework", icon: BookOpen, label: "Homework" },
  { href: "/parent/fees", icon: CreditCard, label: "Fees" },
  { href: "/parent/results", icon: GraduationCap, label: "Results" },
  { href: "/parent/notifications", icon: Bell, label: "Alerts" },
];

function getLinksByRole(role: string) {
  if (role === "admin") return adminLinks;
  if (role === "teacher") return teacherLinks;
  return parentLinks;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  if (!user) return null;
  const links = getLinksByRole(user.role);

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <BookMarked className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Darul Huda</p>
            <p className="text-xs text-gray-500">Madrasa</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-emerald-700 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/admin" && href !== "/teacher" && href !== "/parent" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Notifications link */}
      <div className="p-4 border-t border-gray-100">
        <Link href={`/${user.role}/notifications`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
          <Bell className="w-5 h-5" />
          Notifications
        </Link>
        <button
          onClick={() => { logout(); window.location.href = "/"; }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full mt-1"
        >
          <UserCircle className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  if (!user) return null;
  const links = getLinksByRole(user.role).slice(0, 5);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe">
      <div className="flex items-stretch justify-around px-1">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/admin" && href !== "/teacher" && href !== "/parent" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 px-2 min-w-0 flex-1 relative transition-all active:scale-95",
                active ? "text-emerald-600" : "text-gray-400"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-500 rounded-full" />
              )}
              <div className={cn(
                "flex items-center justify-center rounded-xl transition-all",
                active ? "bg-emerald-50 w-10 h-7" : "w-10 h-7"
              )}>
                <Icon className={cn("w-5 h-5 shrink-0", active && "stroke-[2.5]")} />
              </div>
              <span className={cn("text-[10px] font-semibold leading-none", active ? "text-emerald-600" : "text-gray-400")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
