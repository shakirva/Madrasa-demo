"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { useLanguageStore } from "@/store/language";
import { committeeSummary, CommitteeClassStat } from "@/mock-data";
import {
  Users, GraduationCap, CreditCard, TrendingUp, TrendingDown,
  CheckCircle2, AlertCircle, Clock, Vote, Moon, BookOpen,
  Star, BarChart3, Bell, School, Trophy,
  IndianRupee, Calendar,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Tiny helpers
// ─────────────────────────────────────────────────────────────────────────────

const d = committeeSummary;

function pct(v: number, max: number) {
  return max === 0 ? 0 : Math.min(100, Math.round((v / max) * 100));
}

function Bar({ value, color = "bg-emerald-500", height = "h-2" }: { value: number; color?: string; height?: string }) {
  return (
    <div className={`w-full ${height} bg-gray-100 rounded-full overflow-hidden`}>
      <div className={`${height} ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, color = "text-emerald-700", bg = "bg-emerald-100" }: {
  icon: typeof Users; title: string; subtitle?: string; color?: string; bg?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className={`w-4.5 h-4.5 ${color}`} />
      </div>
      <div>
        <h2 className="text-base font-bold text-gray-900 leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mini bar-chart for attendance/fee trends
// ─────────────────────────────────────────────────────────────────────────────

function MiniBarChart({ data, valueKey, maxValue, color }: {
  data: Record<string, unknown>[];
  valueKey: string;
  maxValue: number;
  color: string;
}) {
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((item, i) => {
        const val = item[valueKey] as number;
        const h = pct(val, maxValue);
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full flex flex-col justify-end" style={{ height: 52 }}>
              <div className={`w-full ${color} rounded-t-sm transition-all duration-700`} style={{ height: `${h}%` }} />
            </div>
            <span className="text-[9px] text-gray-400 leading-none truncate w-full text-center">{item["month"] as string || item["day"] as string}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Priority badge
// ─────────────────────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const map = {
    high:   { color: "bg-red-100 text-red-700",    dot: "bg-red-500"    },
    medium: { color: "bg-amber-100 text-amber-700", dot: "bg-amber-500"  },
    low:    { color: "bg-gray-100 text-gray-600",   dot: "bg-gray-400"   },
  };
  const m = map[priority];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export default function CommitteeDashboard() {
  const { lang } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<"overview" | "finance" | "students" | "elections">("overview");

  const tabs = [
    { key: "overview" as const,   label: lang === "ml" ? "അവലോകനം"   : "Overview",  icon: BarChart3   },
    { key: "finance" as const,    label: lang === "ml" ? "ഫിനാൻസ്"    : "Finance",   icon: IndianRupee },
    { key: "students" as const,   label: lang === "ml" ? "വിദ്യാർ."    : "Students",  icon: GraduationCap },
    { key: "elections" as const,  label: lang === "ml" ? "തിരഞ്ഞെടുപ്പ്" : "Elections", icon: Vote        },
  ];

  return (
    <DashboardLayout>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="bg-linear-to-r from-emerald-700 to-teal-600 rounded-3xl p-5 lg:p-6 text-white">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-emerald-200 text-xs font-semibold uppercase tracking-widest mb-1">
                {lang === "ml" ? "മാനേജ്‌മെന്റ് കമ്മിറ്റി" : "Management Committee"}
              </p>
              <h1 className="text-xl lg:text-2xl font-bold leading-tight">
                {lang === "ml" ? d.madrasa.name_ml : d.madrasa.name}
              </h1>
              <p className="text-emerald-200 text-sm mt-1">
                {lang === "ml" ? d.madrasa.location_ml : d.madrasa.location} · {lang === "ml" ? "സെഷൻ" : "Session"} {d.madrasa.session}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-white/15 rounded-2xl px-4 py-2 text-center">
                <p className="text-2xl font-black">{d.overview.totalStudents}</p>
                <p className="text-emerald-200 text-[10px] font-semibold uppercase">{lang === "ml" ? "വിദ്യാർത്ഥികൾ" : "Students"}</p>
              </div>
            </div>
          </div>

          {/* Quick glance row */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              { label: lang === "ml" ? "അദ്ധ്യാ." : "Teachers",  value: d.overview.totalTeachers,  icon: "👨‍🏫" },
              { label: lang === "ml" ? "ക്ലാസ്"   : "Classes",   value: d.overview.totalClasses,    icon: "🏫" },
              { label: lang === "ml" ? "ഹാജർ"    : "Attendance", value: `${d.attendance.overallPct}%`, icon: "✅" },
              { label: lang === "ml" ? "ഫീസ്"    : "Fee Coll.",  value: `${d.fees.collectionPct}%`,    icon: "💰" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-2.5 text-center">
                <p className="text-base lg:text-xl">{s.icon}</p>
                <p className="text-sm font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-emerald-200 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              activeTab === tab.key
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* ── Alerts ────────────────────────────────────────────── */}
          <div className="space-y-2">
            {d.announcements.filter((a) => a.priority === "high").map((a) => (
              <div key={a.id} className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-red-800">{lang === "ml" ? a.title_ml : a.title}</p>
                  <p className="text-xs text-red-400 mt-0.5">{a.date}</p>
                </div>
                <PriorityBadge priority={a.priority} />
              </div>
            ))}
          </div>

          {/* ── 6-stat grid ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: Users,        label: lang === "ml" ? "ആകെ വിദ്യാർ."  : "Total Students",   value: d.overview.totalStudents,      color: "text-emerald-700", bg: "bg-emerald-50",  sub: `${d.overview.totalClasses} classes` },
              { icon: CheckCircle2, label: lang === "ml" ? "ഇന്ന് ഹാജർ"   : "Present Today",    value: d.attendance.todayPresent,     color: "text-green-700",  bg: "bg-green-50",    sub: `${d.attendance.todayAbsent} absent` },
              { icon: IndianRupee,  label: lang === "ml" ? "ഫീസ് പിരിച്ചത്" : "Fees Collected",   value: `₹${(d.fees.collectedSoFar/1000).toFixed(0)}K`, color: "text-teal-700", bg: "bg-teal-50", sub: `${d.fees.collectionPct}% of target` },
              { icon: AlertCircle,  label: lang === "ml" ? "ഫീസ് ബാക്കി"   : "Fees Pending",     value: `₹${(d.fees.pendingAmount/1000).toFixed(0)}K`, color: "text-orange-700", bg: "bg-orange-50", sub: `${d.fees.unpaidStudents} students` },
              { icon: Vote,         label: lang === "ml" ? "സജീവ തിരഞ്ഞ."  : "Active Elections", value: d.elections.activeCount,       color: "text-purple-700", bg: "bg-purple-50",   sub: `${d.elections.completedCount} completed` },
              { icon: GraduationCap,label: lang === "ml" ? "പരീക്ഷ ഫലം"   : "Exam Pass Rate",   value: `${d.academic.passRate}%`,     color: "text-blue-700",   bg: "bg-blue-50",     sub: `Avg: ${d.academic.lastExamAvgScore}%` },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
              >
                <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                  <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
                </div>
                <p className="text-xl lg:text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-xs font-semibold text-gray-700 leading-tight mt-0.5">{s.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* ── Attendance + Fee mini charts ──────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Attendance trend */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <SectionHeader icon={CheckCircle2} title={lang === "ml" ? "ഹാജർ ട്രെൻഡ്" : "Attendance Trend"} color="text-green-700" bg="bg-green-50" />
                <span className="text-xl font-black text-green-700">{d.attendance.overallPct}%</span>
              </div>
              <MiniBarChart
                data={d.attendance.weeklyTrend as unknown as Record<string, unknown>[]}
                valueKey="present"
                maxValue={d.overview.totalStudents}
                color="bg-green-400"
              />
              {d.attendance.lowAttendanceStudents > 0 && (
                <p className="text-[11px] text-orange-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {d.attendance.lowAttendanceStudents} {lang === "ml" ? "വിദ്യാർ. കുറഞ്ഞ ഹാജർ" : "students with low attendance"}
                </p>
              )}
            </div>

            {/* Fee trend */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <SectionHeader icon={IndianRupee} title={lang === "ml" ? "ഫീസ് ട്രെൻഡ്" : "Monthly Fee Collection"} color="text-teal-700" bg="bg-teal-50" />
                <span className="text-xl font-black text-teal-700">{d.fees.collectionPct}%</span>
              </div>
              <MiniBarChart
                data={d.fees.monthlyTrend as unknown as Record<string, unknown>[]}
                valueKey="collected"
                maxValue={Math.max(...d.fees.monthlyTrend.map((m) => m.collected))}
                color="bg-teal-400"
              />
              <div className="flex items-center gap-3 mt-2 text-[11px]">
                <span className="text-teal-700 font-semibold">
                  ₹{(d.fees.collectedSoFar / 1000).toFixed(0)}K {lang === "ml" ? "പിരിച്ചു" : "collected"}
                </span>
                <span className="text-gray-400">·</span>
                <span className="text-orange-600 font-semibold">
                  ₹{(d.fees.pendingAmount / 1000).toFixed(0)}K {lang === "ml" ? "ബാക്കി" : "pending"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Announcements ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <SectionHeader icon={Bell} title={lang === "ml" ? "അറിയിപ്പുകൾ" : "Announcements & Deadlines"} color="text-amber-700" bg="bg-amber-50" />
            <div className="space-y-2.5">
              {d.announcements.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{lang === "ml" ? a.title_ml : a.title}</p>
                      <p className="text-[11px] text-gray-400">{a.date}</p>
                    </div>
                  </div>
                  <PriorityBadge priority={a.priority} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB: FINANCE
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "finance" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: lang === "ml" ? "വার്‍ഷിക ലക്ഷ്യം" : "Annual Target",    value: `₹${(d.fees.totalAnnualTarget/1000).toFixed(0)}K`, color: "text-gray-700",    bg: "bg-gray-50",    icon: CreditCard },
              { label: lang === "ml" ? "പിരിച്ചത്"        : "Collected",         value: `₹${(d.fees.collectedSoFar/1000).toFixed(0)}K`,  color: "text-teal-700",    bg: "bg-teal-50",    icon: TrendingUp  },
              { label: lang === "ml" ? "ബാക്കി"           : "Pending",           value: `₹${(d.fees.pendingAmount/1000).toFixed(0)}K`,   color: "text-orange-700",  bg: "bg-orange-50",  icon: TrendingDown },
              { label: lang === "ml" ? "കൃത്യനിഷ്‌ഠ"       : "Collection Rate",   value: `${d.fees.collectionPct}%`,                      color: "text-emerald-700", bg: "bg-emerald-50", icon: CheckCircle2 },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-xl font-black text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Collection progress */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-gray-800">{lang === "ml" ? "ഫീസ് ശേഖരണ പ്രോഗ്രസ്" : "Fee Collection Progress"}</p>
              <span className="text-sm font-black text-teal-700">{d.fees.collectionPct}%</span>
            </div>
            <Bar value={d.fees.collectionPct} color="bg-teal-500" height="h-3" />
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{d.fees.paidStudents} {lang === "ml" ? "പേർ അടച്ചു" : "paid"}</span>
              <span>{d.fees.unpaidStudents} {lang === "ml" ? "പേർ ബാക്കി" : "pending"}</span>
            </div>
          </div>

          {/* Monthly breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="font-bold text-gray-800 mb-4">{lang === "ml" ? "മാസ തിരിച്ച് ഫീസ്" : "Monthly Fee Breakdown"}</p>
            <div className="space-y-3">
              {d.fees.monthlyTrend.map((m) => (
                <div key={m.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700">{lang === "ml" ? m.month_ml : m.month}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-teal-700 font-bold">₹{(m.collected/1000).toFixed(1)}K</span>
                      <span className="text-gray-400">/ ₹{(m.target/1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  <Bar value={pct(m.collected, m.target)} color={m.collected >= m.target ? "bg-teal-500" : "bg-amber-400"} height="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Student payment status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-2" />
              <p className="text-2xl font-black text-emerald-700">{d.fees.paidStudents}</p>
              <p className="text-xs text-emerald-600 font-semibold">{lang === "ml" ? "ഫീസ് അടച്ചു" : "Fees Paid"}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
              <Clock className="w-6 h-6 text-orange-500 mb-2" />
              <p className="text-2xl font-black text-orange-600">{d.fees.unpaidStudents}</p>
              <p className="text-xs text-orange-600 font-semibold">{lang === "ml" ? "ഫീസ് ബാക്കി" : "Fees Pending"}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB: STUDENTS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "students" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* Academic summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: lang === "ml" ? "ശ.ശ. സ്‌കോർ"     : "Avg Exam Score", value: `${d.academic.lastExamAvgScore}%`, icon: BarChart3,     color: "text-blue-700",   bg: "bg-blue-50"   },
              { label: lang === "ml" ? "പാസ് നിരക്ക്"    : "Pass Rate",      value: `${d.academic.passRate}%`,        icon: CheckCircle2, color: "text-green-700",  bg: "bg-green-50"  },
              { label: lang === "ml" ? "ഖുർആൻ പൂർത്തി"  : "Quran Progress", value: `${d.ibadah.quranCompletionPct}%`,icon: BookOpen,     color: "text-teal-700",   bg: "bg-teal-50"   },
              { label: lang === "ml" ? "ഹാജർ %"          : "Attendance",     value: `${d.attendance.overallPct}%`,    icon: School,       color: "text-emerald-700",bg: "bg-emerald-50"},
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mb-2`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-xl font-black text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Class-wise stats table */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="font-bold text-gray-800 mb-4">{lang === "ml" ? "ക്ലാസ് തിരിച്ച് സ്ഥിതി" : "Class-wise Performance"}</p>
            <div className="space-y-3">
              {d.academic.classStats.map((cls: CommitteeClassStat) => (
                <div key={cls.className} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">{cls.className}</span>
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{cls.students} {lang === "ml" ? "പേർ" : "students"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold">
                      <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full">{cls.avgScore}% {lang === "ml" ? "ശ.ശ." : "avg"}</span>
                      <span className={`px-1.5 py-0.5 rounded-full ${cls.attendancePct >= 88 ? "text-green-700 bg-green-50" : "text-orange-600 bg-orange-50"}`}>
                        {cls.attendancePct}% {lang === "ml" ? "ഹാജർ" : "att."}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-14">{lang === "ml" ? "ഹാജർ" : "Attend."}</span>
                      <Bar value={cls.attendancePct} color={cls.attendancePct >= 88 ? "bg-green-400" : "bg-orange-400"} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-14">{lang === "ml" ? "HW" : "Homework"}</span>
                      <Bar value={cls.hwCompletion} color="bg-teal-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top students */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <SectionHeader icon={Star} title={lang === "ml" ? "മികവ് കൈവരിച്ചവർ" : "Top Achievers"} color="text-amber-700" bg="bg-amber-50" />
            <div className="space-y-2.5">
              {d.academic.topStudents.map((s, i) => (
                <div key={i} className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-base shrink-0">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "⭐"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.class}</p>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 shrink-0 text-right">
                    {lang === "ml" ? s.achievement_ml : s.achievement}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ibadah section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <SectionHeader icon={Moon} title={lang === "ml" ? "ഇബാദത്ത് & ഖുർആൻ" : "Ibadah & Quran"} color="text-green-700" bg="bg-green-50" />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-green-50 border border-green-100 rounded-2xl p-3 text-center">
                <p className="text-2xl font-black text-green-700">{d.ibadah.quranCompletionPct}%</p>
                <p className="text-[11px] text-green-600">{lang === "ml" ? "ഖുർആൻ പൂർത്തി" : "Quran Completion"}</p>
              </div>
              <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3 text-center">
                <p className="text-2xl font-black text-teal-700">{d.ibadah.prayerTrackedStudents}</p>
                <p className="text-[11px] text-teal-600">{lang === "ml" ? "നമസ്‌കാരം ട്രാക്ക്" : "Prayer Tracked"}</p>
              </div>
            </div>
            <p className="text-xs font-bold text-gray-600 mb-2">{lang === "ml" ? "ഇബാദത്ത് ചാമ്പ്യൻ" : "Ibadah Champions"}</p>
            {d.ibadah.ibadahChampions.map((c, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <span className="text-base">{i === 0 ? "🌟" : i === 1 ? "✨" : "⭐"}</span>
                <span className="text-sm font-semibold text-gray-800 flex-1">{c.name}</span>
                <span className="text-xs text-gray-500">{c.class}</span>
                <span className="text-xs font-black text-emerald-700">{c.score}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB: ELECTIONS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "elections" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* Election stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center mb-2">
                <Vote className="w-4.5 h-4.5 text-emerald-700" />
              </div>
              <p className="text-3xl font-black text-emerald-700">{d.elections.activeCount}</p>
              <p className="text-xs font-semibold text-gray-600 mt-0.5">{lang === "ml" ? "സജീവ തിരഞ്ഞെടുപ്പ്" : "Active Elections"}</p>
              <div className="flex items-center gap-1 mt-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-emerald-600 font-bold">LIVE</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center mb-2">
                <Trophy className="w-4.5 h-4.5 text-teal-700" />
              </div>
              <p className="text-3xl font-black text-teal-700">{d.elections.completedCount}</p>
              <p className="text-xs font-semibold text-gray-600 mt-0.5">{lang === "ml" ? "പൂർത്തിയായ" : "Completed Elections"}</p>
              <p className="text-[10px] text-gray-400 mt-2">{lang === "ml" ? "ഫലം പ്രസിദ്ധീകരിച്ചു" : "Results published"}</p>
            </div>
          </div>

          {/* SKSBV Union Members */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <SectionHeader icon={Users} title={lang === "ml" ? "SKSBV ഓഫീസ്-ബെയറർ" : "SKSBV Union Office-Bearers"} color="text-teal-700" bg="bg-teal-50" />
            <div className="space-y-2">
              {d.elections.sksbvUnionMembers.map((m, i) => {
                const isPending = m.name === "Pending Election";
                const emojis = ["🎖️", "👑", "📋", "✍️", "💰"];
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border ${isPending ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-100"}`}>
                    <span className="text-xl shrink-0">{emojis[i]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                        {lang === "ml" ? m.post_ml : m.post}
                      </p>
                      <p className={`text-sm font-bold ${isPending ? "text-amber-700" : "text-gray-900"}`}>
                        {isPending ? (lang === "ml" ? "⏳ തിരഞ്ഞെടുപ്പ് നടക്കുന്നു" : "⏳ Election in progress") : m.name}
                      </p>
                    </div>
                    {isPending ? (
                      <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded-full shrink-0">PENDING</span>
                    ) : (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-full shrink-0">ELECTED</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Election health */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-emerald-800 mb-1">
              {lang === "ml" ? "📊 ആകെ {total} തിരഞ്ഞെടുപ്പ്" : `📊 ${d.elections.activeCount + d.elections.completedCount} Total Elections`}
            </p>
            <Bar value={pct(d.elections.completedCount, d.elections.activeCount + d.elections.completedCount)} color="bg-emerald-500" height="h-2.5" />
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-emerald-700 font-semibold">{d.elections.completedCount} {lang === "ml" ? "പൂർത്തി" : "completed"}</span>
              <span className="text-amber-600 font-semibold">{d.elections.activeCount} {lang === "ml" ? "സജീവം" : "active"}</span>
            </div>
          </div>

          {/* Recent announcements related to elections */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <SectionHeader icon={Bell} title={lang === "ml" ? "തിരഞ്ഞെടുപ്പ് അറിയിപ്പ്" : "Election Notices"} color="text-amber-700" bg="bg-amber-50" />
            {d.announcements
              .filter((a) => a.title.toLowerCase().includes("election") || a.title_ml.includes("തിരഞ്ഞെടുപ്പ്"))
              .map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-2 mb-3 last:mb-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{lang === "ml" ? a.title_ml : a.title}</p>
                    <p className="text-xs text-gray-400">{a.date}</p>
                  </div>
                  <PriorityBadge priority={a.priority} />
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Bottom padding for mobile nav */}
      <div className="h-6" />
    </DashboardLayout>
  );
}
