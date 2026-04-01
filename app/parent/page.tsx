"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SectionHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { students, attendanceRecords, homeworkList, feesRecords, notifications } from "@/mock-data";
import { ActionCard } from "@/components/ui/Cards";
import { ClipboardList, BookOpen, CreditCard, GraduationCap, Bell, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLanguageStore } from "@/store/language";
import { t } from "@/lib/i18n";

export default function ParentDashboard() {
  const router = useRouter();
  const { lang } = useLanguageStore();
  // P001 has two children: S001 (Ahmed) and S006 (Umar)
  const myChildren = students.filter((s) => ["S001", "S006"].includes(s.id));
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const todayAtt = (studentId: string) => {
    const rec = attendanceRecords[0]?.records.find((r) => r.studentId === studentId);
    return rec?.status ?? "absent";
  };

  const pendingHW = (studentId: string) =>
    homeworkList.flatMap((hw) => hw.studentStatuses).filter((ss) => ss.studentId === studentId && ss.status === "red").length;

  const feePending = feesRecords.some((f) => ["S001", "S006"].includes(f.studentId) && f.status !== "paid");

  return (
    <DashboardLayout>
      {/* ── Greeting ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t("common", "greeting", lang)}</h1>
        <p className="text-gray-500 text-xs lg:text-sm mt-0.5">{t("parentDash", "welcome", lang)}, Abdullah Rahman</p>
      </motion.div>

      {/* ── Children Cards ─────────────────────────────────────── */}
      <SectionHeader title={t("parentDash", "myChildren", lang)} className="mb-2" />
      <div className="space-y-3 mb-5">
        {myChildren.map((child, i) => (
          <motion.div
            key={child.id}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-4 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-base lg:text-lg shrink-0">
                {child.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm lg:text-base truncate">{child.name}</p>
                <p className="text-xs text-gray-500">{child.class} · {child.admissionNumber}</p>
              </div>
              <StatusBadge status={todayAtt(child.id) as "present" | "absent"} size="sm" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                <p className="text-[10px] text-gray-500 font-medium">{t("nav", "attendance", lang)}</p>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">{t("common", "today", lang)} ✓</p>
              </div>
              <div className={`rounded-xl p-2 text-center border ${pendingHW(child.id) > 0 ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"}`}>
                <p className="text-[10px] text-gray-500 font-medium">{t("nav", "homework", lang)}</p>
                <p className={`text-xs font-bold mt-0.5 ${pendingHW(child.id) > 0 ? "text-red-600" : "text-emerald-700"}`}>
                  {pendingHW(child.id) > 0 ? `${pendingHW(child.id)} ${t("parentDash", "due", lang)}` : t("parentDash", "allDone", lang)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                <p className="text-[10px] text-gray-500 font-medium">{t("common", "class", lang)}</p>
                <p className="text-xs font-bold text-gray-700 mt-0.5">{child.class}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <SectionHeader title={t("parentDash", "quickAccess", lang)} className="mb-2" />
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2.5 mb-5">
        {[
          { title: t("nav", "attendance", lang), desc: t("parentDash", "history", lang),        icon: ClipboardList, color: "emerald" as const, href: "/parent/attendance" },
          { title: t("nav", "homework", lang),   desc: t("parentDash", "markComplete", lang),  icon: BookOpen,      color: "teal" as const,    href: "/parent/homework",      badge: 2 },
          { title: t("nav", "fees", lang),       desc: feePending ? t("parentDash", "due", lang) : t("parentDash", "ok", lang),  icon: CreditCard, color: feePending ? "amber" as const : "emerald" as const, href: "/parent/fees" },
          { title: t("nav", "results", lang),    desc: t("parentDash", "reportCards", lang),   icon: GraduationCap, color: "blue" as const,    href: "/parent/results" },
          { title: t("nav", "alerts", lang),     desc: t("parentDash", "messages", lang),       icon: Bell,          color: "rose" as const,    href: "/parent/notifications", badge: unreadNotifs },
          { title: t("nav", "diary", lang),      desc: t("parentDash", "teacherNotes", lang),  icon: FileText,      color: "purple" as const,  href: "/parent/notifications" },
        ].map(({ title, desc, icon, color, href, badge }) => (
          <ActionCard key={title} title={title} description={desc} icon={icon} color={color} badge={badge} onClick={() => router.push(href)} />
        ))}
      </div>

      {/* ── Announcement ──────────────────────────────────────── */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
        <p className="text-sm font-semibold text-emerald-800">{t("parentDash", "announcement", lang)}</p>
        <p className="text-xs text-emerald-700 mt-1 leading-relaxed">{t("parentDash", "annualExam", lang)}</p>
      </div>
    </DashboardLayout>
  );
}
