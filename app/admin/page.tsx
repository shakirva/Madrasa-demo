"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard, ActionCard } from "@/components/ui/Cards";
import { SectionHeader } from "@/components/ui/PageHeader";
import { adminStats, monthlyAttendanceData, feeCollectionData } from "@/mock-data";
import {
  Users, UserCheck, UserX, CreditCard, BookOpen, BarChart3,
  Settings, GraduationCap, BookMarked, TrendingUp, ClipboardList
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import { useLanguageStore } from "@/store/language";
import { t } from "@/lib/i18n";

export default function AdminDashboard() {
  const router = useRouter();
  const { lang } = useLanguageStore();

  return (
    <DashboardLayout>
      {/* ── Greeting ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t("common", "greeting", lang)}</h1>
        <p className="text-gray-500 text-xs lg:text-sm mt-0.5">{t("adminDash", "adminOverview", lang)}</p>
      </motion.div>

      {/* ── Stats Grid ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4 mb-4 lg:mb-6"
      >
  <StatCard title={t("adminDash", "totalStudents", lang)} value={adminStats.totalStudents} icon={Users} subtitle={t("common", "enrolled", lang)} onClick={() => router.push('/admin/students')} />
  <StatCard title={t("adminDash", "presentToday", lang)} value={adminStats.presentToday} icon={UserCheck} iconColor="text-emerald-600" iconBg="bg-emerald-50" trend={`94% ${t("common", "rate", lang)}`} trendUp onClick={() => router.push('/admin/present')} />
  <StatCard title={t("adminDash", "absentToday", lang)} value={adminStats.absentToday} icon={UserX} iconColor="text-red-500" iconBg="bg-red-50" onClick={() => router.push('/admin/absent')} />
  <StatCard title={t("common", "teachers", lang)} value={adminStats.totalTeachers} icon={GraduationCap} iconColor="text-teal-600" iconBg="bg-teal-50" onClick={() => router.push('/admin/teachers')} />
      </motion.div>

      {/* ── Fee Stats ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-2.5 lg:gap-4 mb-4 lg:mb-6"
      >
        <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 lg:p-5 text-white">
          <p className="text-emerald-100 text-xs lg:text-sm font-medium">{t("adminDash", "feesCollected", lang)}</p>
          <p className="text-2xl lg:text-3xl font-bold mt-1">₹{adminStats.feesCollectedThisMonth.toLocaleString()}</p>
          <p className="text-emerald-200 text-[10px] lg:text-xs mt-1">{lang === "ml" ? "മാർച്ച് 2026" : "March 2026"}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100">
          <p className="text-gray-500 text-xs lg:text-sm font-medium">{t("adminDash", "feesPending", lang)}</p>
          <p className="text-2xl lg:text-3xl font-bold mt-1 text-amber-600">₹{adminStats.feesPending.toLocaleString()}</p>
          <p className="text-gray-400 text-[10px] lg:text-xs mt-1">{t("common", "awaitingPayment", lang)}</p>
        </div>
      </motion.div>

      {/* ── Charts ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100">
          <SectionHeader title={t("adminDash", "attendanceTrend", lang)} />
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={monthlyAttendanceData}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} width={28} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Area type="monotone" dataKey="rate" stroke="#059669" strokeWidth={2} fill="url(#colorRate)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100">
          <SectionHeader title={t("adminDash", "feeCollection", lang)} />
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={feeCollectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} width={28} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Bar dataKey="collected" fill="#059669" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pending" fill="#fbbf24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <SectionHeader title={t("adminDash", "quickActions", lang)} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4">
          <ActionCard title={t("common", "students", lang)} description={t("adminDash", "manageAdmissions", lang)} icon={Users} color="emerald" onClick={() => router.push("/admin/students")} />
          <ActionCard title={t("nav", "fees", lang)} description={t("adminDash", "feeManagement", lang)} icon={CreditCard} color="teal" onClick={() => router.push("/admin/fees")} />
          <ActionCard title={t("nav", "exams", lang)} description={t("adminDash", "createManage", lang)} icon={BookOpen} color="blue" onClick={() => router.push("/admin/exams")} />
          <ActionCard title={t("nav", "reports", lang)} description={t("adminDash", "analyticsCharts", lang)} icon={BarChart3} color="purple" onClick={() => router.push("/admin/reports")} />
          <ActionCard title={t("nav", "attendance", lang)} description={t("adminDash", "viewRecords", lang)} icon={ClipboardList} color="amber" onClick={() => router.push("/admin/reports")} />
          <ActionCard title={t("adminDash", "seatPlan", lang)} description={t("adminDash", "examArrangement", lang)} icon={BookMarked} color="rose" onClick={() => router.push("/admin/seats")} />
          <ActionCard title={t("nav", "performance", lang)} description={t("adminDash", "studentRankings", lang)} icon={TrendingUp} color="teal" onClick={() => router.push("/admin/reports")} />
          <ActionCard title={t("nav", "config", lang)} description={t("adminDash", "madrasaSettings", lang)} icon={Settings} color="emerald" onClick={() => router.push("/admin/config")} />
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
