"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader, SectionHeader } from "@/components/ui/PageHeader";
import {
  monthlyAttendanceData, feeCollectionData, parentCooperationData,
  homeworkCompletionData, performanceRankingData, adminStats
} from "@/mock-data";
import { BarChart3, Crown } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { motion } from "framer-motion";

export default function AdminReportsPage() {
  const bestBoy = performanceRankingData.find((s) => s.gender === "male" && s.crown);
  const bestGirl = performanceRankingData.find((s) => s.gender === "female" && s.crown);

  return (
    <DashboardLayout>
      <PageHeader title="Reports & Analytics" subtitle="Full overview" icon={BarChart3} />

      {/* Best of Month */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[bestBoy, bestGirl].filter(Boolean).map((s) => (
          <motion.div
            key={s!.studentId}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-linear-to-br from-amber-400 to-amber-500 rounded-2xl p-4 text-white text-center"
          >
            <Crown className="w-6 h-6 mx-auto mb-2" />
            <p className="text-xs font-medium opacity-80">{s!.gender === "male" ? "Best Boy" : "Best Girl"} of Month</p>
            <p className="font-bold text-sm mt-1">{s!.name.split(" ")[0]}</p>
            <p className="text-xs opacity-80 mt-0.5">Score: {s!.total}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <SectionHeader title="Monthly Attendance Rate (%)" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyAttendanceData}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Area type="monotone" dataKey="rate" stroke="#059669" strokeWidth={2.5} fill="url(#attGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <SectionHeader title="Fee Collection vs Pending (₹)" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={feeCollectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Legend />
              <Bar dataKey="collected" name="Collected" fill="#059669" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="#fbbf24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <SectionHeader title="Parent Cooperation" />
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={parentCooperationData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {parentCooperationData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {parentCooperationData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-sm text-gray-700">{d.name}</span>
                    <span className="text-sm font-bold text-gray-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <SectionHeader title="Homework Completion (%)" />
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={homeworkCompletionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Bar dataKey="completed" name="Done" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="missing" name="Missing" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Rankings */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <SectionHeader title="Student Performance Ranking" />
          <div className="space-y-3">
            {performanceRankingData.map((s, i) => (
              <div key={s.studentId} className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-500"}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                    {s.crown && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                  </div>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-xs text-gray-500">Exam: {s.examScore}</span>
                    <span className="text-xs text-gray-500">Ibadah: {s.ibadah}</span>
                    <span className="text-xs text-gray-500">HW: {s.homework}</span>
                  </div>
                </div>
                <span className="text-base font-bold text-emerald-700">{s.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Avg Attendance", value: "91%", color: "emerald" },
            { label: "HW Completion", value: `${adminStats.homeworkCompletionRate}%`, color: "teal" },
            { label: "Fee Collection", value: "64%", color: "amber" },
            { label: "Active Parents", value: "60%", color: "blue" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`bg-${color}-50 rounded-2xl p-4 text-center`}>
              <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
              <p className={`text-xs text-${color}-600 mt-1`}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
