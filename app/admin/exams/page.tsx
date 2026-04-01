"use client";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { exams, students } from "@/mock-data";
import {
  GraduationCap, Plus, Settings, X, ChevronRight,
  CheckCircle, Clock, FileEdit, Send,
  Star, AlertCircle, BookOpen, Users, Edit3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language";
import { t } from "@/lib/i18n";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────
type ExamStatus = "draft" | "marks_entered" | "published";
type ExamRecord = typeof exams[number];

// ── Helpers ───────────────────────────────────────────────────────────────
const ALL_CLASSES = ["All", "Class 4", "Class 3", "Class 2"];
const EXAM_TYPES  = ["All", "semester", "class_test", "hifz"];

const GRADE_CONFIG: Record<string, { min: number; color: string; bg: string; label: string }> = {
  "A+": { min: 90, color: "text-emerald-700", bg: "bg-emerald-100",  label: "A+ Excellent"  },
  "A":  { min: 80, color: "text-blue-700",    bg: "bg-blue-100",     label: "A Very Good"   },
  "B+": { min: 70, color: "text-violet-700",  bg: "bg-violet-100",   label: "B+ Good"       },
  "B":  { min: 60, color: "text-sky-700",     bg: "bg-sky-100",      label: "B Average"     },
  "C":  { min: 50, color: "text-amber-700",   bg: "bg-amber-100",    label: "C Below Avg"   },
  "F":  { min: 0,  color: "text-red-700",     bg: "bg-red-100",      label: "F Fail"        },
};

const STATUS_META: Record<ExamStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  draft:         { label: "Draft",          color: "text-gray-600",    bg: "bg-gray-100",    icon: Clock      },
  marks_entered: { label: "Marks Entered",  color: "text-amber-700",   bg: "bg-amber-100",   icon: FileEdit   },
  published:     { label: "Published",      color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle },
};

const TYPE_COLORS: Record<string, string> = {
  semester:   "bg-violet-100 text-violet-700",
  class_test: "bg-sky-100 text-sky-700",
  hifz:       "bg-amber-100 text-amber-700",
};

function getStudent(id: string) {
  return students.find((s) => s.id === id);
}

function rankIcon(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

// ── Component ─────────────────────────────────────────────────────────────
export default function AdminExamsPage() {
  const { lang } = useLanguageStore();
  // ── filter state ──
  const [activeClass, setActiveClass] = useState("All");
  const [activeType,  setActiveType]  = useState("All");

  // ── selected exam state ──
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null);

  // ── drawer state ──
  const [showCreate,   setShowCreate]   = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [markEntry,    setMarkEntry]    = useState<ExamRecord | null>(null);  // exam being marked

  // ── marks entry state (examId → studentId → subject → mark) ──
  const [enteredMarks, setEnteredMarks] = useState<
    Record<string, Record<string, Record<string, string>>>
  >({});

  // ── exam list (local copy with status mutations) ──
  const [examList, setExamList] = useState(exams as (typeof exams[number] & { status: string })[]);

  // ── create form state ──
  const [newExam, setNewExam] = useState({ name: "", type: "semester", classVal: "Class 4", date: "", totalMarks: "100", subjects: "" });

  // ── filter exams ──
  const filtered = useMemo(() => {
    return examList.filter((e) => {
      const matchClass = activeClass === "All" || e.class === activeClass;
      const matchType  = activeType  === "All" || e.type  === activeType;
      return matchClass && matchType;
    });
  }, [examList, activeClass, activeType]);

  // ── group by class for card view ──
  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach((e) => {
      if (!map[e.class]) map[e.class] = [];
      map[e.class].push(e);
    });
    return map;
  }, [filtered]);

  // ── mark entry helpers ──
  const getMarkVal = (examId: string, sid: string, subj: string) =>
    enteredMarks[examId]?.[sid]?.[subj] ?? "";

  const setMarkVal = (examId: string, sid: string, subj: string, val: string) => {
    setEnteredMarks((prev) => ({
      ...prev,
      [examId]: {
        ...(prev[examId] ?? {}),
        [sid]: { ...(prev[examId]?.[sid] ?? {}), [subj]: val },
      },
    }));
  };

  const saveMarks = (exam: ExamRecord) => {
    setExamList((prev) =>
      prev.map((e) => (e.id === exam.id ? { ...e, status: "marks_entered" } : e))
    );
    if (selectedExam?.id === exam.id) setSelectedExam((p) => p ? { ...p, status: "marks_entered" } : p);
    setMarkEntry(null);
  };

  const publishExam = (examId: string) => {
    setExamList((prev) => prev.map((e) => (e.id === examId ? { ...e, status: "published" } : e)));
    if (selectedExam?.id === examId) setSelectedExam((p) => p ? { ...p, status: "published" } : p);
  };

  const createExam = () => {
    const newEntry: ExamRecord & { status: string } = {
      id: `EX00${examList.length + 1}`,
      name: newExam.name || "New Exam",
      type: newExam.type,
      date: newExam.date,
      class: newExam.classVal,
      subjects: newExam.subjects.split(",").map((s) => s.trim()).filter(Boolean),
      totalMarks: Number(newExam.totalMarks) || 100,
      status: "draft",
      results: [],
    };
    setExamList((prev) => [newEntry, ...prev]);
    setShowCreate(false);
    setNewExam({ name: "", type: "semester", classVal: "Class 4", date: "", totalMarks: "100", subjects: "" });
  };

  // ── students for an exam ──
  const getExamStudents = (exam: ExamRecord) =>
    students.filter((s) => s.class === exam.class);

  // ── radar data for a result ──
  const getRadarData = (exam: ExamRecord, result: ExamRecord["results"][number]) =>
    exam.subjects.map((subj) => ({
      subject: subj.length > 6 ? subj.slice(0, 6) + "…" : subj,
      mark: (result.marks as Record<string, number>)[subj] ?? 0,
      max:  exam.totalMarks,
    }));

  // ── summary stats for selected exam ──
  const examStats = useMemo(() => {
    if (!selectedExam || selectedExam.results.length === 0) return null;
    const totals = selectedExam.results.map((r) => r.total);
    const max = selectedExam.subjects.length * selectedExam.totalMarks;
    const avg = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
    const highest = Math.max(...totals);
    const pass = totals.filter((t) => (t / max) * 100 >= 50).length;
    return { avg, highest, pass, total: totals.length, max };
  }, [selectedExam]);

  // ── Top-view: card list ──
  if (!selectedExam) {
    return (
      <DashboardLayout>
        <PageHeader
          title={t("adminPages", "examsTitle", lang)}
          subtitle={t("adminPages", "examsSubtitle", lang)}
          icon={GraduationCap}
          action={
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold"
              >
                <Plus className="w-4 h-4" />{t("adminPages", "newExam", lang)}
              </button>
              <button onClick={() => setShowSettings(true)}
                className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          }
        />

        {/* ── Class tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-hide">
          {ALL_CLASSES.map((cls) => (
            <button key={cls} onClick={() => setActiveClass(cls)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all",
                activeClass === cls ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500"
              )}
            >
              {cls === "All" && <Users className="w-3.5 h-3.5" />}{cls}
            </button>
          ))}
        </div>

        {/* ── Type tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
          {EXAM_TYPES.map((tp) => (
            <button key={tp} onClick={() => setActiveType(tp)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all",
                activeType === tp ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-500"
              )}
            >
              {tp === "All" ? t("common", "all", lang) : tp === "semester" ? t("adminPages", "semester", lang) : tp === "class_test" ? t("adminPages", "classTest", lang) : t("adminPages", "hifz", lang)}
            </button>
          ))}
        </div>

        {/* ── Summary row ── */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: t("adminPages", "totalExams", lang),  val: examList.length,                                   color: "text-gray-800" },
            { label: t("adminPages", "published", lang),    val: examList.filter((e) => e.status === "published").length,  color: "text-emerald-700" },
            { label: t("adminPages", "pendingExams", lang),      val: examList.filter((e) => e.status !== "published").length,  color: "text-amber-700" },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-white rounded-2xl p-3 border border-gray-100 text-center">
              <p className={cn("text-2xl font-bold", color)}>{val}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Exam cards grouped by class ── */}
        {Object.entries(grouped).map(([cls, clsExams]) => (
          <div key={cls} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <p className="font-bold text-gray-900 text-sm">{cls}</p>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">{clsExams.length}</span>
            </div>
            <div className="space-y-3">
              {clsExams.map((exam, i) => {
                const sm = STATUS_META[exam.status as ExamStatus];
                const SmIcon = sm.icon;
                const examStudents = getExamStudents(exam);
                const enteredCount = exam.results.length;
                const pct = examStudents.length > 0 ? Math.round((enteredCount / examStudents.length) * 100) : 0;
                return (
                  <motion.div key={exam.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer active:bg-gray-50"
                    onClick={() => setSelectedExam(exam)}
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between p-4 pb-3">
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="font-bold text-gray-900 text-sm leading-tight">{exam.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {exam.class} · {new Date(exam.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · {exam.totalMarks} {t("adminPages", "marks", lang)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", TYPE_COLORS[exam.type] ?? "bg-gray-100 text-gray-600")}>
                          {exam.type === "semester" ? t("adminPages", "semester", lang) : exam.type === "class_test" ? t("adminPages", "classTest", lang) : t("adminPages", "hifz", lang)}
                        </span>
                        <span className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full", sm.bg, sm.color)}>
                          <SmIcon className="w-3 h-3" />{exam.status === "draft" ? t("adminPages", "draft", lang) : exam.status === "marks_entered" ? t("adminPages", "marksEntered", lang) : t("adminPages", "published", lang)}
                        </span>
                      </div>
                    </div>

                    {/* Subjects */}
                    <div className="flex gap-1.5 px-4 pb-3 flex-wrap">
                      {exam.subjects.map((s) => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>

                    {/* Progress + actions */}
                    <div className="border-t border-gray-50 px-4 py-3 flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-gray-400">{t("adminPages", "marksEntered", lang)}</p>
                          <p className="text-xs font-semibold text-gray-600">{enteredCount}/{examStudents.length}</p>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {exam.status !== "published" && (
                          <button onClick={(e) => { e.stopPropagation(); setMarkEntry(exam); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold border border-amber-200"
                          >
                            <Edit3 className="w-3 h-3" />{t("adminPages", "marks", lang)}
                          </button>
                        )}
                        {exam.status === "marks_entered" && (
                          <button onClick={(e) => { e.stopPropagation(); publishExam(exam.id); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                          >
                            <Send className="w-3 h-3" />{t("adminPages", "publish", lang)}
                          </button>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-300 my-auto" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">{t("adminPages", "noExamsFound", lang)}</p>
          </div>
        )}

        {/* ═══ MARK ENTRY DRAWER ═══ */}
        <AnimatePresence>
          {markEntry && (
            <>
              <motion.div key="me-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={() => setMarkEntry(null)} />
              <motion.div key="me-dr"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[92dvh] flex flex-col"
              >
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                  <div>
                    <h2 className="font-bold text-gray-900">{t("adminPages", "markEntry", lang)}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{markEntry.name} · {markEntry.class} · Max {markEntry.totalMarks}</p>
                  </div>
                  <button onClick={() => setMarkEntry(null)}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                  ><X className="w-4 h-4" /></button>
                </div>
                <div className="overflow-y-auto flex-1 px-5 py-4 pb-4 space-y-4">
                  {getExamStudents(markEntry).map((stu) => (
                    <div key={stu.id} className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                          stu.gender === "female" ? "bg-pink-100 text-pink-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {stu.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{stu.name}</p>
                          <p className="text-xs text-gray-400">{stu.class} {stu.division}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {markEntry.subjects.map((subj) => {
                          const existing = (markEntry.results.find((r) => r.studentId === stu.id)?.marks as Record<string,number> | undefined)?.[subj];
                          const val = getMarkVal(markEntry.id, stu.id, subj);
                          return (
                            <div key={subj}>
                              <label className="text-xs text-gray-500 font-medium block mb-1">{subj}</label>
                              <input
                                type="number"
                                min={0}
                                max={markEntry.totalMarks}
                                placeholder={existing !== undefined ? String(existing) : `/ ${markEntry.totalMarks}`}
                                value={val}
                                onChange={(e) => setMarkVal(markEntry.id, stu.id, subj, e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-center focus:outline-none focus:border-emerald-400"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                  <button onClick={() => saveMarks(markEntry)}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl text-base flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />{t("adminPages", "saveAllMarks", lang)}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ═══ CREATE EXAM DRAWER ═══ */}
        <AnimatePresence>
          {showCreate && (
            <>
              <motion.div key="cr-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={() => setShowCreate(false)} />
              <motion.div key="cr-dr"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[92dvh] flex flex-col"
              >
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                  <h2 className="font-bold text-gray-900 text-lg">{t("adminPages", "createNewExam", lang)}</h2>
                  <button onClick={() => setShowCreate(false)}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                  ><X className="w-4 h-4" /></button>
                </div>
                <div className="overflow-y-auto flex-1 px-5 py-5 pb-4 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">{t("adminPages", "examName", lang)}</label>
                    <input type="text" placeholder="e.g. Second Semester Exam"
                      value={newExam.name}
                      onChange={(e) => setNewExam((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  {/* Type */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">{t("adminPages", "examType", lang)}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["semester", "class_test", "hifz"].map((tp) => (
                        <label key={tp} className={cn(
                          "flex flex-col items-center justify-center py-3 rounded-xl border-2 text-xs font-semibold cursor-pointer transition-all text-center",
                          newExam.type === tp ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500"
                        )}>
                          <input type="radio" name="type" value={tp} checked={newExam.type === tp}
                            onChange={() => setNewExam((p) => ({ ...p, type: tp }))} className="hidden" />
                          {tp === "semester" ? "📖" : tp === "class_test" ? "✏️" : "🌙"}
                          <span className="mt-1">{tp === "semester" ? t("adminPages", "semester", lang) : tp === "class_test" ? t("adminPages", "classTest", lang) : t("adminPages", "hifz", lang)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Class */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">{t("common", "class", lang)}</label>
                    <div className="flex gap-2">
                      {["Class 2", "Class 3", "Class 4"].map((c) => (
                        <label key={c} className={cn(
                          "flex-1 text-center py-2.5 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all",
                          newExam.classVal === c ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500"
                        )}>
                          <input type="radio" name="classVal" value={c} checked={newExam.classVal === c}
                            onChange={() => setNewExam((p) => ({ ...p, classVal: c }))} className="hidden" />
                          {c}
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Date & Marks */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">{t("adminPages", "dateLabel", lang)}</label>
                      <input type="date" value={newExam.date}
                        onChange={(e) => setNewExam((p) => ({ ...p, date: e.target.value }))}
                        className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">{t("adminPages", "maxMarks", lang)}</label>
                      <input type="number" value={newExam.totalMarks}
                        onChange={(e) => setNewExam((p) => ({ ...p, totalMarks: e.target.value }))}
                        className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                  {/* Subjects */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">{t("adminPages", "subjects", lang)} <span className="normal-case font-normal text-gray-400">({t("adminPages", "commaSeparated", lang)})</span></label>
                    <input type="text" placeholder="Quran, Arabic, Fiqh, Islamic Studies"
                      value={newExam.subjects}
                      onChange={(e) => setNewExam((p) => ({ ...p, subjects: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
                    />
                    {/* Quick add chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {["Quran", "Arabic", "Fiqh", "Islamic Studies", "Tajweed", "Memorization"].map((s) => (
                        <button key={s} type="button"
                          onClick={() => setNewExam((p) => ({
                            ...p, subjects: p.subjects ? `${p.subjects}, ${s}` : s
                          }))}
                          className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"
                        >+ {s}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                  <button onClick={createExam}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl text-base"
                  >{t("adminPages", "createExam", lang)}</button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ═══ SETTINGS DRAWER ═══ */}
        <AnimatePresence>
          {showSettings && (
            <>
              <motion.div key="st-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={() => setShowSettings(false)} />
              <motion.div key="st-dr"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[88dvh] flex flex-col"
              >
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">{t("adminPages", "examSettings", lang)}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{t("adminPages", "gradeConfig", lang)}</p>
                  </div>
                  <button onClick={() => setShowSettings(false)}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                  ><X className="w-4 h-4" /></button>
                </div>
                <div className="overflow-y-auto flex-1 px-5 py-5 pb-8 space-y-6">
                  {/* Grade table */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t("adminPages", "gradeBoundaries", lang)}</p>
                    <div className="bg-gray-50 rounded-2xl overflow-hidden">
                      <div className="grid grid-cols-3 px-4 py-2 border-b border-gray-200">
                        <p className="text-xs font-bold text-gray-500">{t("adminPages", "grade", lang)}</p>
                        <p className="text-xs font-bold text-gray-500 text-center">{t("adminPages", "minPct", lang)}</p>
                        <p className="text-xs font-bold text-gray-500 text-right">{t("adminPages", "label", lang)}</p>
                      </div>
                      {Object.entries(GRADE_CONFIG).map(([grade, cfg]) => (
                        <div key={grade} className="grid grid-cols-3 px-4 py-3 border-b border-gray-100 last:border-0 items-center">
                          <span className={cn("text-sm font-bold px-2 py-0.5 rounded-lg w-fit", cfg.bg, cfg.color)}>{grade}</span>
                          <p className="text-sm font-semibold text-gray-700 text-center">{cfg.min}%</p>
                          <p className="text-xs text-gray-500 text-right">{cfg.label.split(" ").slice(1).join(" ")}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Pass mark */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t("adminPages", "passMark", lang)}</p>
                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">{t("adminPages", "minToPass", lang)}</p>
                      <div className="flex items-center gap-2">
                        <input type="number" defaultValue={50} className="w-16 px-2 py-1.5 rounded-xl border border-gray-200 text-sm font-bold text-center focus:outline-none focus:border-emerald-400" />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                  {/* Result visibility */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t("adminPages", "resultVisibility", lang)}</p>
                    <div className="space-y-2">
                      {[
                        { label: t("adminPages", "showRankParents", lang), desc: t("adminPages", "parentsSeeRank", lang) },
                        { label: t("adminPages", "showOtherScores", lang), desc: t("adminPages", "parentsSeeAvg", lang) },
                        { label: t("adminPages", "notifyOnPublish", lang), desc: t("adminPages", "autoNotify", lang) },
                      ].map((item) => (
                        <div key={item.label} className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                            <p className="text-xs text-gray-400">{item.desc}</p>
                          </div>
                          <div className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer shrink-0">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => { setShowSettings(false); }}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl text-base"
                  >{t("adminPages", "saveSettingsBtn", lang)}</button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </DashboardLayout>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXAM DETAIL VIEW
  // ─────────────────────────────────────────────────────────────────────────
  const sm = STATUS_META[selectedExam.status as ExamStatus];
  const SmIcon = sm.icon;
  const maxTotal = selectedExam.subjects.length * selectedExam.totalMarks;
  const sortedResults = [...selectedExam.results].sort((a, b) => a.rank - b.rank);

  return (
    <DashboardLayout>
      {/* Back header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => setSelectedExam(null)}
          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 text-base leading-tight truncate">{selectedExam.name}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{selectedExam.class} · {selectedExam.date} · {selectedExam.totalMarks} {t("adminPages", "marksEach", lang)}</p>
        </div>
        <span className={cn("flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shrink-0", sm.bg, sm.color)}>
          <SmIcon className="w-3.5 h-3.5" />{selectedExam.status === "draft" ? t("adminPages", "draft", lang) : selectedExam.status === "marks_entered" ? t("adminPages", "marksEntered", lang) : t("adminPages", "published", lang)}
        </span>
      </div>

      {/* Subjects */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {selectedExam.subjects.map((s) => (
          <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{s}</span>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-5">
        {selectedExam.status !== "published" && (
          <button onClick={() => setMarkEntry(selectedExam)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm font-bold"
          >
            <Edit3 className="w-4 h-4" />{t("adminPages", "enterMarks", lang)}
          </button>
        )}
        {selectedExam.status === "marks_entered" && (
          <button onClick={() => publishExam(selectedExam.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold"
          >
            <Send className="w-4 h-4" />{t("adminPages", "publishResults", lang)}
          </button>
        )}
        {selectedExam.status === "published" && (
          <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-bold">
            <CheckCircle className="w-4 h-4" />{t("adminPages", "resultsPublished", lang)}
          </div>
        )}
        {selectedExam.status === "draft" && (
          <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-2xl text-sm font-semibold">
            <AlertCircle className="w-4 h-4" />{t("adminPages", "enterMarksFirst", lang)}
          </div>
        )}
      </div>

      {/* Summary stats */}
      {examStats && (
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: t("adminPages", "studentsCount", lang),   val: examStats.total,   color: "text-gray-800" },
            { label: t("adminPages", "avgScore", lang),  val: examStats.avg,     color: "text-blue-700" },
            { label: t("adminPages", "highest", lang),    val: examStats.highest, color: "text-emerald-700" },
            { label: t("adminPages", "passed", lang),     val: examStats.pass,    color: "text-violet-700" },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-white rounded-2xl p-3 border border-gray-100 text-center">
              <p className={cn("text-xl font-bold leading-tight", color)}>{val}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {sortedResults.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <FileEdit className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">{t("adminPages", "noMarksYet", lang)}</p>
          <p className="text-xs text-gray-400 mt-1">{t("adminPages", "useEnterMarks", lang)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedResults.map((result, i) => {
            const student = getStudent(result.studentId);
            const pct = maxTotal > 0 ? Math.round((result.total / maxTotal) * 100) : 0;
            const gc  = GRADE_CONFIG[result.grade] ?? GRADE_CONFIG["C"];
            const radarData = getRadarData(selectedExam, result);
            const isTop3 = result.rank <= 3;
            return (
              <motion.div key={result.studentId}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={cn(
                  "bg-white rounded-2xl border overflow-hidden",
                  isTop3 ? "border-amber-200" : "border-gray-100"
                )}
              >
                {/* Student header row */}
                <div className="flex items-center justify-between p-4 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shrink-0",
                      isTop3 ? "bg-amber-100 text-amber-800" : (student?.gender === "female" ? "bg-pink-100 text-pink-700" : "bg-emerald-100 text-emerald-700")
                    )}>
                      {rankIcon(result.rank)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{student?.name}</p>
                      <p className="text-xs text-gray-400">{student?.class} {student?.division}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full mb-1", gc.bg, gc.color)}>{result.grade}</p>
                    <p className="text-sm font-bold text-gray-900">{result.total}<span className="text-xs text-gray-400">/{maxTotal}</span></p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-4 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">{t("adminPages", "scoreLabel", lang)}</span>
                    <span className="text-xs font-semibold text-gray-600">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: i * 0.05 }}
                      className={cn("h-full rounded-full",
                        pct >= 90 ? "bg-emerald-500" : pct >= 70 ? "bg-blue-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400"
                      )}
                    />
                  </div>
                </div>

                {/* Subject marks grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 px-4 pb-3">
                  {Object.entries(result.marks).map(([subj, mark]) => {
                    const markPct = Math.round(((mark as number) / selectedExam.totalMarks) * 100);
                    return (
                      <div key={subj} className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <p className="text-xs text-gray-400 truncate mb-0.5">{subj}</p>
                        <p className={cn(
                          "text-base font-bold",
                          markPct >= 80 ? "text-emerald-700" : markPct >= 60 ? "text-blue-700" : markPct >= 50 ? "text-amber-700" : "text-red-600"
                        )}>{mark as number}</p>
                        <p className="text-xs text-gray-400">/{selectedExam.totalMarks}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Radar chart for top students */}
                {isTop3 && radarData.length >= 3 && (
                  <div className="px-4 pb-4">
                    <div className="bg-amber-50/50 rounded-xl p-2">
                      <p className="text-xs text-amber-700 font-semibold text-center mb-1 flex items-center justify-center gap-1">
                        <Star className="w-3 h-3" />{t("adminPages", "performanceRadar", lang)}
                      </p>
                      <ResponsiveContainer width="100%" height={140}>
                        <RadarChart data={radarData} outerRadius={50}>
                          <PolarGrid stroke="#fde68a" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "#92400e" }} />
                          <Radar dataKey="mark" fill="#fbbf24" fillOpacity={0.4} stroke="#f59e0b" strokeWidth={2} />
                          <Tooltip formatter={(v) => [`${v}/${selectedExam.totalMarks}`, "Mark"]} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══ MARK ENTRY DRAWER (also available from detail view) ═══ */}
      <AnimatePresence>
        {markEntry && (
          <>
            <motion.div key="me2-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setMarkEntry(null)} />
            <motion.div key="me2-dr"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[92dvh] flex flex-col"
            >
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="font-bold text-gray-900">{t("adminPages", "markEntry", lang)}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{markEntry.name} · Max {markEntry.totalMarks} per subject</p>
                </div>
                <button onClick={() => setMarkEntry(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                ><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto flex-1 px-5 py-4 pb-4 space-y-4">
                {getExamStudents(markEntry).map((stu) => (
                  <div key={stu.id} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                        stu.gender === "female" ? "bg-pink-100 text-pink-700" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {stu.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{stu.name}</p>
                        <p className="text-xs text-gray-400">{stu.class} {stu.division}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {markEntry.subjects.map((subj) => {
                        const existing = (markEntry.results.find((r) => r.studentId === stu.id)?.marks as Record<string,number> | undefined)?.[subj];
                        const val = getMarkVal(markEntry.id, stu.id, subj);
                        return (
                          <div key={subj}>
                            <label className="text-xs text-gray-500 font-medium block mb-1">{subj}</label>
                            <input
                              type="number" min={0} max={markEntry.totalMarks}
                              placeholder={existing !== undefined ? String(existing) : `/ ${markEntry.totalMarks}`}
                              value={val}
                              onChange={(e) => setMarkVal(markEntry.id, stu.id, subj, e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-center focus:outline-none focus:border-emerald-400"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-gray-100 shrink-0">
                <button onClick={() => saveMarks(markEntry)}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl text-base flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />{t("adminPages", "saveAllMarks", lang)}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}