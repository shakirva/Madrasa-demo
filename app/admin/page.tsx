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

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <DashboardLayout>
      {/* ── Greeting ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Assalamu Alaikum 👋</h1>
        <p className="text-gray-500 text-xs lg:text-sm mt-0.5">Darul Huda Madrasa – Admin Overview</p>
      </motion.div>

      {/* ── Stats Grid ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4 mb-4 lg:mb-6"
      >
  <StatCard title="Total Students" value={adminStats.totalStudents} icon={Users} subtitle="Enrolled this year" onClick={() => router.push('/admin/students')} />
  <StatCard title="Present Today" value={adminStats.presentToday} icon={UserCheck} iconColor="text-emerald-600" iconBg="bg-emerald-50" trend="94% rate" trendUp onClick={() => router.push('/admin/present')} />
  <StatCard title="Absent Today" value={adminStats.absentToday} icon={UserX} iconColor="text-red-500" iconBg="bg-red-50" onClick={() => router.push('/admin/absent')} />
  <StatCard title="Teachers" value={adminStats.totalTeachers} icon={GraduationCap} iconColor="text-teal-600" iconBg="bg-teal-50" onClick={() => router.push('/admin/teachers')} />
      </motion.div>

      {/* ── Fee Stats ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-2.5 lg:gap-4 mb-4 lg:mb-6"
      >
        <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 lg:p-5 text-white">
          <p className="text-emerald-100 text-xs lg:text-sm font-medium">Fees Collected</p>
          <p className="text-2xl lg:text-3xl font-bold mt-1">₹{adminStats.feesCollectedThisMonth.toLocaleString()}</p>
          <p className="text-emerald-200 text-[10px] lg:text-xs mt-1">March 2026</p>
        </div>
        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100">
          <p className="text-gray-500 text-xs lg:text-sm font-medium">Fees Pending</p>
          <p className="text-2xl lg:text-3xl font-bold mt-1 text-amber-600">₹{adminStats.feesPending.toLocaleString()}</p>
          <p className="text-gray-400 text-[10px] lg:text-xs mt-1">Awaiting payment</p>
        </div>
      </motion.div>

      {/* ── Charts ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100">
          <SectionHeader title="Attendance Trend" />
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
          <SectionHeader title="Fee Collection (₹)" />
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
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4">
          <ActionCard title="Students" description="Manage admissions" icon={Users} color="emerald" onClick={() => router.push("/admin/students")} />
          <ActionCard title="Fees" description="Fee management" icon={CreditCard} color="teal" onClick={() => router.push("/admin/fees")} />
          <ActionCard title="Exams" description="Create & manage" icon={BookOpen} color="blue" onClick={() => router.push("/admin/exams")} />
          <ActionCard title="Reports" description="Analytics & charts" icon={BarChart3} color="purple" onClick={() => router.push("/admin/reports")} />
          <ActionCard title="Attendance" description="View records" icon={ClipboardList} color="amber" onClick={() => router.push("/admin/reports")} />
          <ActionCard title="Seat Plan" description="Exam arrangement" icon={BookMarked} color="rose" onClick={() => router.push("/admin/seats")} />
          <ActionCard title="Performance" description="Student rankings" icon={TrendingUp} color="teal" onClick={() => router.push("/admin/reports")} />
          <ActionCard title="Config" description="Madrasa settings" icon={Settings} color="emerald" onClick={() => router.push("/admin/config")} />
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
