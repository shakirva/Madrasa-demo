"use client";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { students, attendanceRecords } from "@/mock-data";
import {
  ClipboardList, ChevronLeft, ChevronRight, Check, X,
  Clock, FileText, BarChart2, Users, Bell, Save,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Tooltip, CartesianGrid,
} from "recharts";
import { useLanguageStore } from "@/store/language";
import { t as tr } from "@/lib/i18n";

// ── Types ─────────────────────────────────────────────────────────────────
type AttStatus = "present" | "absent" | "late" | "excused";
type ViewTab = "mark" | "history" | "stats";

const STATUS_META: Record<AttStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  present: { label: "present", color: "text-emerald-700", bg: "bg-emerald-600", border: "border-emerald-200", icon: <Check className="w-4 h-4" /> },
  absent:  { label: "absent",  color: "text-red-600",     bg: "bg-red-500",     border: "border-red-200",     icon: <X className="w-4 h-4" /> },
  late:    { label: "late",    color: "text-amber-700",   bg: "bg-amber-500",   border: "border-amber-200",   icon: <Clock className="w-4 h-4" /> },
  excused: { label: "excused", color: "text-blue-700",    bg: "bg-blue-500",    border: "border-blue-200",    icon: <FileText className="w-4 h-4" /> },
};

const STATUS_ROW_BG: Record<AttStatus, string> = {
  present: "bg-emerald-50 border-emerald-200",
  absent:  "bg-red-50    border-red-200",
  late:    "bg-amber-50  border-amber-200",
  excused: "bg-blue-50   border-blue-200",
};

// last 8 working days (Mon-Sat)
const DATES = [
  "2026-03-17","2026-03-14","2026-03-13","2026-03-12",
  "2026-03-11","2026-03-10","2026-03-07","2026-03-06",
];

function fmtDate(d: string, lang: "en" | "ml" = "en") {
  return new Date(d).toLocaleDateString(lang === "ml" ? "ml-IN" : "en-GB", { weekday:"short", day:"2-digit", month:"short" });
}

function getStudent(id: string) {
  return students.find((s) => s.id === id);
}

// ── Component ─────────────────────────────────────────────────────────────
export default function TeacherAttendancePage() {
  const { lang } = useLanguageStore();
  const [activeClass, setActiveClass]   = useState("Class 4");
  const [dateIdx,     setDateIdx]       = useState(0);   // index into DATES
  const [view,        setView]          = useState<ViewTab>("mark");
  const [saved,       setSaved]         = useState(false);
  const [showRemark,  setShowRemark]    = useState<string | null>(null);  // studentId

  const selectedDate = DATES[dateIdx];
  const classStudents = useMemo(
    () => students.filter((s) => s.class === activeClass),
    [activeClass]
  );

  // Seed from mock data if available, else default to "present"
  const seedRecord = attendanceRecords.find(
    (r) => r.date === selectedDate && r.classId === activeClass
  );

  const [attendance, setAttendance] = useState<Record<string, AttStatus>>(() =>
    Object.fromEntries(
      classStudents.map((s) => [
        s.id,
        (seedRecord?.records.find((r) => r.studentId === s.id)?.status as AttStatus) ?? "present",
      ])
    )
  );
  const [remarks, setRemarks] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      classStudents.map((s) => [
        s.id,
        seedRecord?.records.find((r) => r.studentId === s.id)?.remark ?? "",
      ])
    )
  );

  // re-seed when date or class changes
  const changeContext = (newClass: string, newDateIdx: number) => {
    const newStudents = students.filter((s) => s.class === newClass);
    const rec = attendanceRecords.find(
      (r) => r.date === DATES[newDateIdx] && r.classId === newClass
    );
    setAttendance(Object.fromEntries(
      newStudents.map((s) => [
        s.id,
        (rec?.records.find((r) => r.studentId === s.id)?.status as AttStatus) ?? "present",
      ])
    ));
    setRemarks(Object.fromEntries(
      newStudents.map((s) => [
        s.id,
        rec?.records.find((r) => r.studentId === s.id)?.remark ?? "",
      ])
    ));
    setSaved(false);
  };

  const markAll = (status: AttStatus) => {
    setAttendance(Object.fromEntries(classStudents.map((s) => [s.id, status])));
    setSaved(false);
  };

  const counts = useMemo(() => {
    const vals = Object.values(attendance);
    return {
      present: vals.filter((v) => v === "present").length,
      absent:  vals.filter((v) => v === "absent").length,
      late:    vals.filter((v) => v === "late").length,
      excused: vals.filter((v) => v === "excused").length,
      total:   classStudents.length,
    };
  }, [attendance, classStudents]);

  const pct = counts.total > 0 ? Math.round((counts.present / counts.total) * 100) : 0;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // ── Per-student historical attendance stats ──
  const studentStats = useMemo(() =>
    classStudents.map((stu) => {
      const recs = attendanceRecords
        .filter((r) => r.classId === activeClass)
        .map((r) => r.records.find((x) => x.studentId === stu.id))
        .filter(Boolean);
      const present = recs.filter((r) => r?.status === "present").length;
      const absent  = recs.filter((r) => r?.status === "absent").length;
      const late    = recs.filter((r) => r?.status === "late").length;
      const total   = recs.length;
      return { stu, present, absent, late, total, pct: total > 0 ? Math.round((present / total) * 100) : 0 };
    }),
  [classStudents, activeClass]);

  // ── Weekly heatmap data (last 8 days × students) ──
  const heatmapDates = DATES.slice(0, 6);

  // ── History records for selected class ──
  const historyRecs = attendanceRecords
    .filter((r) => r.classId === activeClass)
    .sort((a, b) => b.date.localeCompare(a.date));

  // ── Bar chart data for stats tab ──
  const barData = historyRecs.slice(0, 8).reverse().map((rec) => ({
    date: new Date(rec.date).toLocaleDateString("en-GB", { day:"2-digit", month:"short" }),
    P: rec.records.filter((r) => r.status === "present").length,
    A: rec.records.filter((r) => r.status === "absent").length,
    L: rec.records.filter((r) => r.status === "late").length,
  }));

  return (
    <DashboardLayout>
      <PageHeader
        title={tr("teacherPages", "attendanceTitle", lang)}
        subtitle={`${activeClass} · ${fmtDate(selectedDate, lang)}`}
        icon={ClipboardList}
        back
        backHref="/teacher"
      />

      {/* ── Class selector ── */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {["Class 4","Class 3","Class 2"].map((cls) => (
          <button key={cls} onClick={() => { setActiveClass(cls); changeContext(cls, dateIdx); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all",
              activeClass === cls ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500"
            )}
          >
            <Users className="w-3.5 h-3.5" />{cls}
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full font-bold",
              activeClass === cls ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            )}>
              {students.filter((s) => s.class === cls).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Date navigator ── */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => { const n = Math.min(dateIdx+1, DATES.length-1); setDateIdx(n); changeContext(activeClass, n); }}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0"
          disabled={dateIdx >= DATES.length - 1}
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 overflow-x-auto flex gap-1.5 scrollbar-hide">
          {DATES.map((d, i) => (
            <button key={d} onClick={() => { setDateIdx(i); changeContext(activeClass, i); }}
              className={cn(
                "flex flex-col items-center px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all min-w-13",
                i === dateIdx ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-500"
              )}
            >
              <span className="font-bold">{new Date(d).toLocaleDateString("en-GB", { day:"2-digit" })}</span>
              <span className="opacity-70">{new Date(d).toLocaleDateString("en-GB", { weekday:"short" })}</span>
            </button>
          ))}
        </div>
        <button onClick={() => { const n = Math.max(dateIdx-1, 0); setDateIdx(n); changeContext(activeClass, n); }}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0"
          disabled={dateIdx === 0}
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* ── View tabs ── */}
      <div className="flex gap-1.5 mb-5 bg-gray-100 p-1 rounded-2xl">
        {([["mark",tr("teacherPages","markAtt",lang),"✏️"],["history",tr("teacherPages","history",lang),"📋"],["stats",tr("teacherPages","stats",lang),"📊"]] as [ViewTab,string,string][]).map(([key,label,emoji]) => (
          <button key={key} onClick={() => setView(key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all",
              view === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            )}
          >
            <span>{emoji}</span>{label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════
          VIEW: MARK ATTENDANCE
      ════════════════════════════════════ */}
      {view === "mark" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="mark">

          {/* Summary stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {(["present","absent","late","excused"] as AttStatus[]).map((s) => {
              const m = STATUS_META[s];
              return (
                <div key={s} className={cn("rounded-2xl p-2.5 text-center border", STATUS_ROW_BG[s])}>
                  <p className={cn("text-xl font-bold", m.color)}>{counts[s]}</p>
                  <p className={cn("text-xs mt-0.5", m.color)}>{tr("teacherPages", m.label as any, lang)}</p>
                </div>
              );
            })}
          </div>

          {/* Collection progress bar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">{tr("common", "today", lang)}</p>
              <p className="text-sm font-bold text-emerald-700">{pct}%</p>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
              <motion.div className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${(counts.present/counts.total)*100}%` }}
                transition={{ duration: 0.6 }}
              />
              <motion.div className="h-full bg-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${(counts.late/counts.total)*100}%` }}
                transition={{ duration: 0.6 }}
              />
              <motion.div className="h-full bg-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${(counts.excused/counts.total)*100}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <div className="flex gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>{tr("common", "present", lang)}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>{tr("teacherPages", "late", lang)}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block"/>{tr("teacherPages", "excused", lang)}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>{tr("common", "absent", lang)}</span>
            </div>
          </div>

          {/* Bulk actions */}
          <div className="flex gap-2 mb-4">
            <p className="text-xs text-gray-500 my-auto mr-1 shrink-0">{tr("teacherPages", "markAll", lang)}</p>
            {(["present","absent","late"] as AttStatus[]).map((s) => {
              const m = STATUS_META[s];
              return (
                <button key={s} onClick={() => markAll(s)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                    STATUS_ROW_BG[s], m.color
                  )}
                >
                  {m.icon}{tr("teacherPages", m.label as any, lang)}
                </button>
              );
            })}
          </div>

          {/* Student list — dropdown status selector */}
          <div className="space-y-2.5 mb-5">
            {classStudents.map((student, i) => {
              const status = attendance[student.id] ?? "present";
              const meta   = STATUS_META[status];
              const hasRemark = remarks[student.id];
              return (
                <motion.div key={student.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className={cn("rounded-2xl border-2 overflow-hidden transition-all", STATUS_ROW_BG[status])}
                >
                  <div className="w-full flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0", meta.bg)}>
                        {student.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                        <p className="text-xs text-gray-400">{student.admissionNumber} · {student.division}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasRemark && <AlertCircle className="w-4 h-4 text-amber-500" />}
                      <select
                        value={status}
                        onChange={(e) => setAttendance((p) => ({ ...p, [student.id]: e.target.value as AttStatus }))}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold text-white border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-0",
                          meta.bg
                        )}
                      >
                        <option value="present">{tr("teacherPages", "present", lang)}</option>
                        <option value="absent">{tr("teacherPages", "absent", lang)}</option>
                        <option value="late">{tr("teacherPages", "late", lang)}</option>
                        <option value="excused">{tr("teacherPages", "excused", lang)}</option>
                      </select>
                    </div>
                  </div>
                  {/* Remark row — shown for absent/late/excused */}
                  {status !== "present" && (
                    <div className="px-4 pb-3">
                      <input
                        type="text"
                        placeholder={tr("teacherPages", "addRemarkOpt", lang)}
                        value={remarks[student.id] ?? ""}
                        onChange={(e) => setRemarks((p) => ({ ...p, [student.id]: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Save button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all sticky bottom-20 lg:bottom-6 shadow-lg",
              saved
                ? "bg-emerald-100 text-emerald-700 shadow-emerald-100"
                : "bg-emerald-600 text-white shadow-emerald-200"
            )}
          >
            {saved ? (
              <>
                <Check className="w-5 h-5" />
                {tr("teacherPages", "savedNotif", lang)} {counts.absent > 0 ? `${counts.absent} ${counts.absent > 1 ? tr("teacherPages", "parentsNotifiedAtt", lang) : tr("teacherPages", "parentNotifiedAtt", lang)}` : tr("teacherPages", "allPresentMsg", lang)}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {tr("teacherPages", "saveAttendance", lang)}
                {counts.absent > 0 && (
                  <span className="ml-1 flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    <Bell className="w-3 h-3" />{tr("teacherPages", "notifyCount", lang)} {counts.absent}
                  </span>
                )}
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* ════════════════════════════════════
          VIEW: HISTORY
      ════════════════════════════════════ */}
      {view === "history" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="history" className="space-y-3">

          {/* Student heatmap */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 overflow-x-auto">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{tr("teacherPages", "weeklyHeatmap", lang)}</p>
            <div className="min-w-max">
              {/* Header row */}
              <div className="flex gap-2 mb-2 pl-28">
                {heatmapDates.map((d) => (
                  <div key={d} className="w-10 text-center text-xs text-gray-400 font-medium">
                    {new Date(d).toLocaleDateString(lang === "ml" ? "ml-IN" : "en-GB", { day:"2-digit" })}
                    <br />
                    <span className="text-gray-300">{new Date(d).toLocaleDateString(lang === "ml" ? "ml-IN" : "en-GB", { weekday:"short" })}</span>
                  </div>
                ))}
              </div>
              {/* Student rows */}
              {classStudents.map((stu) => (
                <div key={stu.id} className="flex items-center gap-2 mb-1.5">
                  <div className="w-28 flex items-center gap-2 shrink-0">
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0",
                      stu.gender === "female" ? "bg-pink-400" : "bg-emerald-500"
                    )}>{stu.name.charAt(0)}</div>
                    <p className="text-xs text-gray-700 font-semibold truncate max-w-18">{stu.name.split(" ")[0]}</p>
                  </div>
                  {heatmapDates.map((d) => {
                    const rec = attendanceRecords.find((r) => r.date === d && r.classId === activeClass);
                    const s = rec?.records.find((r) => r.studentId === stu.id)?.status as AttStatus | undefined;
                    return (
                      <div key={d} className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold",
                        s === "present" ? "bg-emerald-100 text-emerald-700"
                        : s === "absent"  ? "bg-red-100 text-red-600"
                        : s === "late"    ? "bg-amber-100 text-amber-700"
                        : s === "excused" ? "bg-blue-100 text-blue-700"
                        :                   "bg-gray-100 text-gray-300"
                      )}>
                        {s === "present" ? "✓" : s === "absent" ? "✗" : s === "late" ? "L" : s === "excused" ? "E" : "–"}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex gap-3 mt-3 flex-wrap text-xs text-gray-500">
              {[["✓","bg-emerald-100","present"],["✗","bg-red-100","absent"],["L","bg-amber-100","late"],["E","bg-blue-100","excused"]].map(([sym,bg,key]) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span className={cn("w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold", bg)}>{sym}</span>{tr("teacherPages", key as any, lang)}
                </span>
              ))}
            </div>
          </div>

          {/* Daily records */}
          {historyRecs.map((rec) => {
            const p = rec.records.filter((r) => r.status === "present").length;
            const a = rec.records.filter((r) => r.status === "absent").length;
            const l = rec.records.filter((r) => r.status === "late").length;
            const e = rec.records.filter((r) => r.status === "excused").length;
            const total = rec.records.length;
            const recPct = total > 0 ? Math.round((p / total) * 100) : 0;
            return (
              <div key={rec.date + rec.classId} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{fmtDate(rec.date, lang)}</p>
                    <p className="text-xs text-gray-400">{total} {tr("teacherPages", "studentsLabel", lang)}</p>
                  </div>
                  <span className={cn(
                    "text-sm font-bold px-2.5 py-1 rounded-xl",
                    recPct >= 80 ? "bg-emerald-100 text-emerald-700" : recPct >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
                  )}>{recPct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${recPct}%` }} />
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {[[p,"P","text-emerald-700"],[a,"A","text-red-600"],[l,"L","text-amber-700"],[e,"E","text-blue-700"]].map(([val,lbl,col]) => (
                    <div key={String(lbl)} className="bg-gray-50 rounded-xl py-2">
                      <p className={cn("font-bold text-base", col)}>{val}</p>
                      <p className="text-gray-400">{lbl}</p>
                    </div>
                  ))}
                </div>
                {/* Absent students listed */}
                {rec.records.filter((r) => r.status === "absent" || r.status === "late").map((r) => {
                  const stu = getStudent(r.studentId);
                  return (
                    <div key={r.studentId} className={cn(
                      "mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs",
                      r.status === "absent" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    )}>
                      <span className="font-bold capitalize">{r.status}</span>
                      <span>·</span>
                      <span className="font-semibold">{stu?.name}</span>
                      {r.remark && <span className="text-gray-500 ml-auto">&ldquo;{r.remark}&rdquo;</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </motion.div>
      )}

      {/* ════════════════════════════════════
          VIEW: STATS
      ════════════════════════════════════ */}
      {view === "stats" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="stats" className="space-y-4">

          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5" />{tr("teacherPages", "dailyTrend", lang)}
            </p>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="P" fill="#10b981" radius={[4,4,0,0]} name="Present" />
                  <Bar dataKey="A" fill="#f87171" radius={[4,4,0,0]} name="Absent"  />
                  <Bar dataKey="L" fill="#fbbf24" radius={[4,4,0,0]} name="Late"    />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-gray-400 py-8">{tr("teacherPages", "noDataAvail", lang)}</p>
            )}
          </div>

          {/* Per-student attendance percentage */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{tr("teacherPages", "studentAttPct", lang)}</p>
            <div className="space-y-3">
              {studentStats.map(({ stu, present, absent, late, total, pct: sPct }) => (
                <div key={stu.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white",
                        stu.gender === "female" ? "bg-pink-400" : "bg-emerald-500"
                      )}>{stu.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{stu.name}</p>
                        <p className="text-xs text-gray-400">{present}P · {absent}A · {late}L · {total} {tr("teacherPages", "daysLabel", lang)}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-sm font-bold px-2.5 py-1 rounded-xl",
                      sPct >= 90 ? "bg-emerald-100 text-emerald-700"
                      : sPct >= 75 ? "bg-amber-100 text-amber-700"
                      :             "bg-red-100 text-red-600"
                    )}>{sPct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${sPct}%` }}
                      transition={{ duration: 0.6 }}
                      className={cn(
                        "h-full rounded-full",
                        sPct >= 90 ? "bg-emerald-500" : sPct >= 75 ? "bg-amber-400" : "bg-red-400"
                      )}
                    />
                  </div>
                  {sPct < 75 && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{tr("teacherPages", "below75", lang)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Monthly overview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{tr("teacherPages", "thisMonthSummary", lang)}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: tr("teacherPages", "totalDaysRecorded", lang), val: historyRecs.length, color:"text-gray-800" },
                { label: tr("teacherPages", "classAverage", lang),      val: `${historyRecs.length > 0 ? Math.round(historyRecs.reduce((a,r) => a + (r.records.filter((x) => x.status==="present").length / r.records.length)*100, 0) / historyRecs.length) : 0}%`, color:"text-emerald-700" },
                { label: tr("teacherPages", "chronicAbsent", lang),     val: studentStats.filter((s) => s.pct < 75).length, color:"text-red-600" },
                { label: tr("teacherPages", "perfectAtt", lang),        val: studentStats.filter((s) => s.pct === 100).length, color:"text-emerald-700" },
              ].map(({ label, val, color }) => (
                <div key={label} className="bg-gray-50 rounded-2xl p-3 text-center">
                  <p className={cn("text-2xl font-bold", color)}>{val}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Low attendance warning */}
          {studentStats.filter((s) => s.pct < 75).length > 0 && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-4">
              <p className="text-sm font-bold text-red-700 flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" />{tr("teacherPages", "lowAttAlert", lang)}
              </p>
              {studentStats.filter((s) => s.pct < 75).map(({ stu, pct: sPct }) => (
                <div key={stu.id} className="flex items-center justify-between py-2 border-b border-red-100 last:border-0">
                  <p className="text-sm text-red-800 font-semibold">{stu.name}</p>
                  <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-lg">{sPct}%</span>
                </div>
              ))}
              <button className="w-full mt-3 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                <Bell className="w-3.5 h-3.5" />{tr("teacherPages", "sendAlertParents", lang)}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Remark drawer (unused — inline instead) ── */}
      <AnimatePresence>
        {showRemark && (
          <motion.div key="rm-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowRemark(null)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

