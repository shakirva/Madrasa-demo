"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { useLanguageStore } from "@/store/language";
import { committeeSummary } from "@/mock-data";
import {
  ClipboardList, CheckCircle2, XCircle, AlertTriangle, TrendingUp,
} from "lucide-react";

const d = committeeSummary;

function Bar({ value, color = "bg-emerald-500", height = "h-2" }: { value: number; color?: string; height?: string }) {
  const safe = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full ${height} bg-gray-100 rounded-full overflow-hidden`}>
      <div className={`${height} ${color} rounded-full`} style={{ width: `${safe}%` }} />
    </div>
  );
}

function attColor(v: number) {
  if (v >= 85) return { text: "text-emerald-600", bg: "bg-emerald-50", bar: "bg-emerald-500" };
  if (v >= 70) return { text: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-400" };
  return { text: "text-red-600", bg: "bg-red-50", bar: "bg-red-400" };
}

export default function CommitteeAttendancePage() {
  const { lang } = useLanguageStore();

  const totalToday = d.attendance.todayPresent + d.attendance.todayAbsent;
  const todayPct = Math.round((d.attendance.todayPresent / totalToday) * 100);

  const statCards = [
    {
      label: lang === "ml" ? "ഒട്ടാകെ ഹാജർ %" : "Overall Attendance",
      value: `${d.attendance.overallPct}%`,
      sub: lang === "ml" ? "ആകെ ശ.ശ." : "Average",
      icon: TrendingUp, color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200",
    },
    {
      label: lang === "ml" ? "ഇന്ന് ഹാജർ" : "Present Today",
      value: `${d.attendance.todayPresent}`,
      sub: `${todayPct}% ${lang === "ml" ? "ആകെ" : "of total"}`,
      icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200",
    },
    {
      label: lang === "ml" ? "ഇന്ന് ഗൈർഹാജർ" : "Absent Today",
      value: `${d.attendance.todayAbsent}`,
      sub: `${100 - todayPct}% ${lang === "ml" ? "ആകെ" : "of total"}`,
      icon: XCircle, color: "text-red-700", bg: "bg-red-50", border: "border-red-200",
    },
    {
      label: lang === "ml" ? "കുറഞ്ഞ ഹാജർ" : "Low Attendance",
      value: `${d.attendance.lowAttendanceStudents}`,
      sub: lang === "ml" ? "വിദ്യാർ. — ശ്രദ്ധ ആവശ്യം" : "students need attention",
      icon: AlertTriangle, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200",
    },
  ];

  const maxPresentInWeek = Math.max(...d.attendance.weeklyTrend.map((w) => w.present + w.absent));

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="bg-linear-to-r from-teal-600 to-cyan-600 rounded-3xl p-5 lg:p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-teal-200 text-xs font-semibold uppercase tracking-widest">
                {lang === "ml" ? "കമ്മിറ്റി" : "Management Committee"}
              </p>
              <h1 className="text-xl font-bold">
                {lang === "ml" ? "ഹാജർ നിരീക്ഷണം" : "Attendance Monitoring"}
              </h1>
            </div>
          </div>
          {/* Today's visual */}
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-teal-200 font-semibold">
                {lang === "ml" ? "ഇന്നത്തെ ഹാജർ" : "Today's Attendance"} — {todayPct}%
              </span>
              <span className="text-sm font-bold">{d.attendance.todayPresent} / {totalToday}</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden flex">
              <div className="bg-emerald-400 rounded-full transition-all" style={{ width: `${todayPct}%` }} />
              <div className="bg-red-400 flex-1" />
            </div>
            <div className="flex gap-6 mt-2 text-xs text-teal-200">
              <span>🟢 {lang === "ml" ? "ഹാജർ" : "Present"}: {d.attendance.todayPresent}</span>
              <span>🔴 {lang === "ml" ? "ഗൈർഹാജർ" : "Absent"}: {d.attendance.todayAbsent}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`bg-white rounded-2xl border ${s.border} p-4 shadow-sm`}
          >
            <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs font-semibold text-gray-700 mt-0.5">{s.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly trend bar chart */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5"
      >
        <div className="flex items-center gap-2 mb-5">
          <ClipboardList className="w-4.5 h-4.5 text-teal-700" />
          <p className="font-bold text-gray-800">
            {lang === "ml" ? "ആഴ്ചതോറുമുള്ള ഹാജർ" : "Weekly Attendance Trend"}
          </p>
        </div>
        {/* Bar chart */}
        <div className="flex items-end gap-2 h-36">
          {d.attendance.weeklyTrend.map((w, i) => {
            const total = w.present + w.absent;
            const presentH = maxPresentInWeek === 0 ? 0 : Math.round((w.present / maxPresentInWeek) * 100);
            const absentH = maxPresentInWeek === 0 ? 0 : Math.round((w.absent / maxPresentInWeek) * 100);
            const pPct = total === 0 ? 0 : Math.round((w.present / total) * 100);
            return (
              <motion.div key={w.day} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.3 + i * 0.07 }}
                className="flex-1 flex flex-col items-center gap-0.5"
              >
                <div className="w-full flex flex-col-reverse gap-0.5 items-center" style={{ height: "100px" }}>
                  <div className="w-full bg-emerald-500 rounded-t" style={{ height: `${presentH}%` }} />
                  <div className="w-full bg-red-400 rounded-b" style={{ height: `${absentH}%` }} />
                </div>
                <p className="text-[10px] font-bold text-gray-600">{lang === "ml" ? w.day_ml : w.day}</p>
                <p className="text-[9px] text-gray-400">{pPct}%</p>
              </motion.div>
            );
          })}
        </div>
        <div className="flex gap-5 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-gray-600 font-medium">{lang === "ml" ? "ഹാജർ" : "Present"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-400" />
            <span className="text-gray-600 font-medium">{lang === "ml" ? "ഗൈർഹാജർ" : "Absent"}</span>
          </div>
        </div>
      </motion.div>

      {/* Class-wise attendance from classStats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5"
      >
        <p className="font-bold text-gray-800 mb-4">
          {lang === "ml" ? "ക്ലാസ് തിരിച്ചുള്ള ഹാജർ" : "Class-wise Attendance"}
        </p>
        <div className="space-y-3">
          {d.academic.classStats.map((cls, i) => {
            const c = attColor(cls.attendancePct);
            return (
              <motion.div key={cls.className} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.36 + i * 0.05 }}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-gray-700">{cls.className}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{cls.attendancePct}%</span>
                </div>
                <Bar value={cls.attendancePct} color={c.bar} height="h-2.5" />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Low attendance alert */}
      {d.attendance.lowAttendanceStudents > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-orange-800">
              {lang === "ml"
                ? `${d.attendance.lowAttendanceStudents} വിദ്യാർത്ഥികൾക്ക് കുറഞ്ഞ ഹാജർ`
                : `${d.attendance.lowAttendanceStudents} students with low attendance`}
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              {lang === "ml"
                ? "ഈ വിദ്യാർത്ഥികളുടെ രക്ഷിതാക്കളുമായി ബന്ധപ്പെടേണ്ടതാണ്"
                : "Parents should be contacted and followed up immediately"}
            </p>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
