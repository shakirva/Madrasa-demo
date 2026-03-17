"use client";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { exams, students } from "@/mock-data";
import {
  GraduationCap, Plus, Search, Trophy, TrendingUp, TrendingDown,
  BarChart2, Users, CheckCircle2, Clock, FileEdit, Eye, X,
  ChevronDown, ChevronUp, Star, AlertTriangle, Send, Medal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────
type ExamStatus = "draft" | "marks_entered" | "published";

interface Result {
  studentId: string;
  marks: Record<string, number>;
  total: number;
  grade: string;
  rank: number;
}

interface Exam {
  id: string;
  name: string;
  type: string;
  date: string;
  class: string;
  subjects: string[];
  totalMarks: number;
  status: ExamStatus;
  results: Result[];
}

// ── Helpers ───────────────────────────────────────────────────
const gradeConfig: Record<string, { bg: string; text: string; border: string }> = {
  "A+": { bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200" },
  "A":  { bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200" },
  "B+": { bg: "bg-blue-50",     text: "text-blue-700",    border: "border-blue-200" },
  "B":  { bg: "bg-blue-50",     text: "text-blue-700",    border: "border-blue-200" },
  "C":  { bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200" },
  "D":  { bg: "bg-orange-50",   text: "text-orange-700",  border: "border-orange-200" },
  "F":  { bg: "bg-red-50",      text: "text-red-600",     border: "border-red-200" },
};

const statusConfig: Record<ExamStatus, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft:         { label: "Draft",          bg: "bg-gray-100",    text: "text-gray-500",    icon: FileEdit },
  marks_entered: { label: "Marks Entered",  bg: "bg-amber-100",   text: "text-amber-700",   icon: Clock },
  published:     { label: "Published",      bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
};

const typeLabel: Record<string, { label: string; emoji: string; color: string }> = {
  semester:   { label: "Semester",    emoji: "🎓", color: "bg-purple-100 text-purple-700 border-purple-200" },
  class_test: { label: "Class Test",  emoji: "📝", color: "bg-blue-100 text-blue-700 border-blue-200" },
  hifz:       { label: "Hifz",        emoji: "📖", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

const CLASSES = ["All Classes", "Class 2", "Class 3", "Class 4"];
const SUBJECTS_ALL = ["Quran", "Arabic", "Fiqh", "Islamic Studies", "Memorization", "Tajweed"];

const rankMedal = (rank: number) =>
  rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

const pct = (marks: number, total: number) => Math.round((marks / total) * 100);

// ── Component ─────────────────────────────────────────────────
export default function TeacherExamsPage() {
  const [examList]                       = useState<Exam[]>(exams as Exam[]);
  const [selectedExam, setSelectedExam]  = useState<Exam>(exams[0] as Exam);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [showExamModal, setShowExamModal]   = useState(false);
  const [search, setSearch]              = useState("");
  const [classFilter, setClassFilter]    = useState("All Classes");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [showToast, setShowToast]        = useState<string | null>(null);
  const [, setMarksInput]      = useState<Record<string, Record<string, string>>>({});

  // new exam form
  const [newName, setNewName]       = useState("");
  const [newClass, setNewClass]     = useState("Class 4");
  const [newType, setNewType]       = useState("class_test");
  const [newDate, setNewDate]       = useState("");
  const [newSubjects, setNewSubjects] = useState<string[]>(["Quran"]);
  const [newTotal, setNewTotal]     = useState("100");

  const toast = (msg: string) => { setShowToast(msg); setTimeout(() => setShowToast(null), 2800); };

  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name ?? id;
  const getInitials    = (id: string) => {
    const name = students.find((s) => s.id === id)?.name ?? id;
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("");
  };

  const getGradeCfg = (g: string) => gradeConfig[g] ?? gradeConfig["C"];

  // Filter exams for sidebar list
  const filteredExams = useMemo(() =>
    examList.filter((e) => {
      if (classFilter !== "All Classes" && e.class !== classFilter) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }), [examList, classFilter, search]);

  // Stats for selected exam
  const examStats = useMemo(() => {
    const res = selectedExam.results;
    if (!res.length) return null;
    const totals   = res.map((r) => r.total);
    const highest  = Math.max(...totals);
    const lowest   = Math.min(...totals);
    const avg      = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
    const passing  = res.filter((r) => !r.grade.startsWith("F") && r.grade !== "D").length;
    const aPlus    = res.filter((r) => r.grade === "A+").length;
    const maxSubjectTotal = selectedExam.totalMarks * selectedExam.subjects.length;
    return { highest, lowest, avg, passing, aPlus, total: res.length, maxSubjectTotal };
  }, [selectedExam]);

  // Per-subject averages
  const subjectAverages = useMemo(() => {
    const res = selectedExam.results;
    if (!res.length) return {};
    const avgs: Record<string, number> = {};
    selectedExam.subjects.forEach((sub) => {
      const marks = res.map((r) => r.marks[sub] ?? 0);
      avgs[sub] = Math.round(marks.reduce((a, b) => a + b, 0) / marks.length);
    });
    return avgs;
  }, [selectedExam]);

  const handlePublish = () => {
    toast("Results published! Parents notified 📲");
  };

  const handleSaveMarks = () => {
    setShowMarksModal(false);
    toast("Marks saved successfully ✅");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Exam Marks"
        subtitle="Manage exams, enter marks & publish results"
        icon={GraduationCap}
        back backHref="/teacher"
        action={
          <button onClick={() => setShowExamModal(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-200"
          >
            <Plus className="w-4 h-4" /> New Exam
          </button>
        }
      />

      {/* ── Toast ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-100 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {showToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search + class filter ──────────────────────────────── */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exams…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none"
        >
          {CLASSES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* ── Exam list pills ────────────────────────────────────── */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        {filteredExams.map((exam) => {
          const sc = statusConfig[exam.status];
          const tc = typeLabel[exam.type] ?? typeLabel.class_test;
          return (
            <button key={exam.id} onClick={() => setSelectedExam(exam)}
              className={`flex flex-col items-start gap-1 px-3.5 py-2.5 rounded-2xl text-left whitespace-nowrap border transition-all shrink-0 ${
                selectedExam.id === exam.id
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white border-gray-200 text-gray-700 hover:border-emerald-300"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{tc.emoji}</span>
                <span className="text-xs font-bold">{exam.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${selectedExam.id === exam.id ? "bg-white/20 text-white" : `${sc.bg} ${sc.text}`}`}>
                  {sc.label}
                </span>
                <span className={`text-[10px] ${selectedExam.id === exam.id ? "text-white/70" : "text-gray-400"}`}>{exam.class}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Selected exam header ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${typeLabel[selectedExam.type]?.color ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                {typeLabel[selectedExam.type]?.emoji} {typeLabel[selectedExam.type]?.label ?? selectedExam.type}
              </span>
              {(() => { const sc = statusConfig[selectedExam.status]; const Icon = sc.icon;
                return (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${sc.bg} ${sc.text}`}>
                    <Icon className="w-3 h-3" />{sc.label}
                  </span>
                );
              })()}
            </div>
            <h2 className="font-bold text-gray-900">{selectedExam.name}</h2>
            <p className="text-xs text-gray-500 mt-1">
              📅 {selectedExam.date} · 🏫 {selectedExam.class} · 📊 {selectedExam.totalMarks} marks/subject · {selectedExam.subjects.join(", ")}
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button onClick={() => setShowMarksModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <FileEdit className="w-3.5 h-3.5" /> Enter Marks
            </button>
            {selectedExam.status !== "published" && (
              <button onClick={handlePublish}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Publish
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── No results state ──────────────────────────────────── */}
      {selectedExam.results.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FileEdit className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm font-semibold text-gray-500">No marks entered yet</p>
          <p className="text-xs text-gray-400 mt-1">Click &ldquo;Enter Marks&rdquo; to add results</p>
          <button onClick={() => setShowMarksModal(true)}
            className="mt-4 inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Enter Marks
          </button>
        </div>
      ) : (
        <>
          {/* ── Stats cards ──────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Highest",    value: examStats?.highest ?? "—",  icon: TrendingUp,   color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Average",    value: examStats?.avg ?? "—",       icon: BarChart2,    color: "text-blue-600",    bg: "bg-blue-50"    },
              { label: "Lowest",     value: examStats?.lowest ?? "—",    icon: TrendingDown, color: "text-red-500",     bg: "bg-red-50"     },
              { label: "A+ Students",value: `${examStats?.aPlus ?? 0}/${examStats?.total ?? 0}`, icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
              >
                <div className={`${bg} rounded-xl p-2.5 shrink-0`}><Icon className={`w-5 h-5 ${color}`} /></div>
                <div>
                  <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Subject averages bar chart ────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-emerald-600" /> Subject Averages
            </p>
            <div className="space-y-2.5">
              {selectedExam.subjects.map((sub) => {
                const avg = subjectAverages[sub] ?? 0;
                const percentage = pct(avg, selectedExam.totalMarks);
                return (
                  <div key={sub}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">{sub}</span>
                      <span className="text-xs font-bold text-gray-800">{avg}/{selectedExam.totalMarks} ({percentage}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${percentage >= 75 ? "bg-emerald-500" : percentage >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Grade distribution ────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" /> Grade Distribution
            </p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(
                selectedExam.results.reduce((acc, r) => ({ ...acc, [r.grade]: (acc[r.grade] ?? 0) + 1 }), {} as Record<string, number>)
              ).sort(([a], [b]) => a.localeCompare(b)).map(([grade, count]) => {
                const cfg = getGradeCfg(grade);
                return (
                  <div key={grade} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                    <span className={`text-sm font-bold ${cfg.text}`}>{grade}</span>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full bg-white/60 ${cfg.text}`}>{count}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-gray-50 border-gray-200 ml-auto">
                <Users className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-bold text-gray-600">{examStats?.passing}/{examStats?.total} Passing</span>
              </div>
            </div>
          </div>

          {/* ── Leaderboard / Results ─────────────────────────── */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <Medal className="w-4 h-4 text-amber-500" /> Student Results
            </p>
            {[...selectedExam.results].sort((a, b) => a.rank - b.rank).map((result, i) => {
              const cfg = getGradeCfg(result.grade);
              const isTop = result.rank <= 3;
              const percentage = examStats ? pct(result.total, examStats.maxSubjectTotal) : 0;
              const isExpanded = expandedStudent === result.studentId;
              const isLow = result.grade === "C" || result.grade === "D" || result.grade === "F";

              return (
                <motion.div key={result.studentId}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-2xl border overflow-hidden ${isLow ? "border-red-100" : isTop ? "border-emerald-100" : "border-gray-100"}`}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Rank + avatar */}
                      <div className="relative shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${isTop ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                          {getInitials(result.studentId)}
                        </div>
                        <span className="absolute -top-1 -right-1 text-sm leading-none">
                          {isTop ? rankMedal(result.rank) : ""}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-gray-900 truncate">{getStudentName(result.studentId)}</p>
                          {!isTop && <span className="text-xs text-gray-400">#{result.rank}</span>}
                          {isLow && <span className="text-[10px] bg-red-50 text-red-500 border border-red-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-bold"><AlertTriangle className="w-2.5 h-2.5" /> Needs help</span>}
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.05 }}
                            className={`h-full rounded-full ${percentage >= 75 ? "bg-emerald-500" : percentage >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>{result.grade}</span>
                        <span className="text-base font-bold text-gray-900">{result.total}</span>
                        <button onClick={() => setExpandedStudent(isExpanded ? null : result.studentId)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded subject breakdown */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="border-t border-gray-50 bg-gray-50/60 px-4 py-3 space-y-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject Breakdown</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(result.marks).map(([sub, mark]) => {
                              const p = pct(mark as number, selectedExam.totalMarks);
                              return (
                                <div key={sub} className="bg-white rounded-xl p-3 border border-gray-100">
                                  <div className="flex justify-between items-center mb-1.5">
                                    <p className="text-xs font-semibold text-gray-600 truncate">{sub}</p>
                                    <span className="text-sm font-bold text-gray-900">{mark as number}<span className="text-xs text-gray-400 font-normal">/{selectedExam.totalMarks}</span></span>
                                  </div>
                                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${p >= 75 ? "bg-emerald-500" : p >= 50 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${p}%` }} />
                                  </div>
                                  <p className="text-[10px] text-gray-400 mt-1 text-right">{p}%</p>
                                </div>
                              );
                            })}
                          </div>
                          {/* Comparison to class avg */}
                          <div className="flex gap-2">
                            <div className={`flex-1 rounded-xl p-2.5 border text-center ${result.total >= (examStats?.avg ?? 0) ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                              <p className="text-[10px] text-gray-500 mb-0.5">vs Class Avg</p>
                              <p className={`text-sm font-bold ${result.total >= (examStats?.avg ?? 0) ? "text-emerald-700" : "text-red-600"}`}>
                                {result.total >= (examStats?.avg ?? 0) ? "+" : ""}{result.total - (examStats?.avg ?? 0)}
                              </p>
                            </div>
                            <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-2.5 text-center">
                              <p className="text-[10px] text-gray-500 mb-0.5">Rank</p>
                              <p className="text-sm font-bold text-blue-700">{rankMedal(result.rank)}</p>
                            </div>
                            <div className="flex-1 bg-purple-50 border border-purple-100 rounded-xl p-2.5 text-center">
                              <p className="text-[10px] text-gray-500 mb-0.5">Percentage</p>
                              <p className="text-sm font-bold text-purple-700">{percentage}%</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* ── Publish CTA ───────────────────────────────────── */}
          {selectedExam.status !== "published" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-6 bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-bold text-emerald-800">Ready to publish?</p>
                <p className="text-xs text-emerald-600 mt-0.5">Parents will be notified with results.</p>
              </div>
              <button onClick={handlePublish}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" /> Publish
              </button>
            </motion.div>
          )}
        </>
      )}

      {/* ── Enter Marks Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showMarksModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowMarksModal(false); }}
          >
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Enter Marks</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedExam.name} · {selectedExam.class} · Max {selectedExam.totalMarks}/subject</p>
                </div>
                <button onClick={() => setShowMarksModal(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
              </div>

              <div className="px-6 pb-6 pt-4 space-y-4">
                {students.filter((s) => s.class === selectedExam.class).map((student) => (
                  <div key={student.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                        {getInitials(student.id)}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedExam.subjects.map((subject) => {
                        const existing = selectedExam.results.find((r) => r.studentId === student.id)?.marks[subject];
                        return (
                          <div key={subject}>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">{subject}</label>
                            <input
                              type="number" min={0} max={selectedExam.totalMarks}
                              defaultValue={existing ?? ""}
                              placeholder={`0–${selectedExam.totalMarks}`}
                              onChange={(e) => setMarksInput((prev) => ({
                                ...prev,
                                [student.id]: { ...(prev[student.id] ?? {}), [subject]: e.target.value },
                              }))}
                              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <button onClick={handleSaveMarks}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Save Marks
                  </button>
                  <button onClick={() => setShowMarksModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                  >Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── New Exam Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showExamModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowExamModal(false); }}
          >
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Schedule New Exam</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Fill details to create an exam record</p>
                </div>
                <button onClick={() => setShowExamModal(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
              </div>

              <div className="px-6 pb-6 pt-4 space-y-4">
                {/* Exam type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Exam Type</label>
                  <div className="flex gap-2">
                    {Object.entries(typeLabel).map(([key, { label, emoji, color }]) => (
                      <button key={key} onClick={() => setNewType(key)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${newType === key ? color : "bg-white text-gray-400 border-gray-200"}`}
                      >
                        {emoji}<br/>{label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Exam Name <span className="text-red-500">*</span></label>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Monthly Test – April"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                {/* Class + Date row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Class</label>
                    <select value={newClass} onChange={(e) => setNewClass(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none text-sm"
                    >
                      {CLASSES.filter((c) => c !== "All Classes").map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
                    <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Subjects */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subjects</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS_ALL.map((sub) => (
                      <button key={sub} onClick={() => setNewSubjects((prev) =>
                        prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
                      )}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${newSubjects.includes(sub) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-500 border-gray-200 hover:border-emerald-400"}`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total marks */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Marks / Subject</label>
                  <div className="flex gap-2">
                    {["50", "100", "200"].map((v) => (
                      <button key={v} onClick={() => setNewTotal(v)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${newTotal === v ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-500 border-gray-200"}`}
                      >
                        {v}
                      </button>
                    ))}
                    <input value={newTotal} onChange={(e) => setNewTotal(e.target.value)}
                      type="number" placeholder="Custom"
                      className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Notify note */}
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 flex items-start gap-2">
                  <Eye className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700">This exam will be created as a <strong>draft</strong>. Enter marks and publish to notify parents.</p>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    disabled={!newName || !newDate || newSubjects.length === 0}
                    onClick={() => { setShowExamModal(false); toast("Exam scheduled! Now enter marks 📝"); }}
                    className="flex-1 bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <GraduationCap className="w-4 h-4" /> Schedule Exam
                  </button>
                  <button onClick={() => setShowExamModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
