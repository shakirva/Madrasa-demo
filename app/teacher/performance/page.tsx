"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader, SectionHeader } from "@/components/ui/PageHeader";
import { performanceRankingData, parentCooperationData, homeworkCompletionData } from "@/mock-data";
import { Star, Crown } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLanguageStore } from "@/store/language";
import { t as tr } from "@/lib/i18n";

export default function TeacherPerformancePage() {
  const { lang } = useLanguageStore();
  const [filter, setFilter] = useState<"weekly" | "monthly">("monthly");

  const bestBoy = performanceRankingData.find((s) => s.gender === "male");
  const bestGirl = performanceRankingData.find((s) => s.gender === "female");

  return (
    <DashboardLayout>
      <PageHeader title={tr("teacherPages", "performanceTitle", lang)} subtitle={tr("teacherPages", "performanceSub", lang)} icon={Star} back backHref="/teacher" />

      {/* Filter */}
      <div className="flex gap-2 mb-5 bg-white border border-gray-100 rounded-xl p-1 w-fit">
        {(["weekly", "monthly"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>{f === "weekly" ? tr("teacherPages", "weekly", lang) : tr("teacherPages", "monthly", lang)}</button>
        ))}
      </div>

      {/* Best of Month */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[bestBoy, bestGirl].filter(Boolean).map((s) => (
          <motion.div
            key={s!.studentId}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-linear-to-br from-amber-400 to-orange-400 rounded-2xl p-4 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <Crown className="w-6 h-6" />
              <span className="text-xs font-medium opacity-80">{s!.gender === "male" ? tr("teacherPages", "bestBoy", lang) : tr("teacherPages", "bestGirl", lang)}</span>
            </div>
            <p className="font-bold">{s!.name.split(" ")[0]}</p>
            <p className="text-sm opacity-80 mt-0.5">{tr("teacherPages", "score", lang)}: {s!.total}</p>
          </motion.div>
        ))}
      </div>

      {/* Rankings */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
        <SectionHeader title={tr("teacherPages", "classRankings", lang)} />
        <div className="space-y-3">
          {performanceRankingData.map((s, i) => (
            <div key={s.studentId} className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-200 text-gray-600" : i === 2 ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-500"}`}>
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                  {s.crown && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-xs text-gray-500">{tr("teacherPages", "exam", lang)}: {s.examScore}</span>
                  <span className="text-xs text-gray-500">{tr("teacherPages", "ibadahLabel", lang)}: {s.ibadah}</span>
                  <span className="text-xs text-gray-500">{tr("teacherPages", "hw", lang)}: {s.homework}</span>
                </div>
                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(s.total / 400) * 100}%` }} />
                </div>
              </div>
              <span className="text-base font-bold text-emerald-700">{s.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <SectionHeader title={tr("teacherPages", "hwCompletion", lang)} />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={homeworkCompletionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              <Bar dataKey="completed" name={tr("common", "completed", lang)} fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="missing" name={tr("common", "absent", lang)} fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <SectionHeader title={tr("teacherPages", "parentCoop", lang)} />
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={parentCooperationData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                  {parentCooperationData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {parentCooperationData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-sm text-gray-700">{d.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
