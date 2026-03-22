"use client";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { homeworkList, students } from "@/mock-data";
import {
  BookOpen, Plus, Check, Search, Filter, ChevronDown, ChevronUp,
  Calendar, Clock, Users, TrendingUp, AlertTriangle, CheckCircle2,
  BookMarked, Star, Send, BarChart2, Bell, Trash2, Edit2, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type HWStatus = "green" | "yellow" | "red" | "returned";
type TabType = "all" | "daily" | "long" | "overdue";
type PriorityType = "high" | "medium" | "low";

const SUBJECTS = ["Quran", "Arabic", "Fiqh", "Islamic Studies"];
const CLASSES  = ["Class 3", "Class 4", "Class 5"];

const priorityConfig: Record<PriorityType, { label: string; color: string; bg: string }> = {
  high:   { label: "High",   color: "text-red-600",    bg: "bg-red-50 border-red-200" },
  medium: { label: "Medium", color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" },
  low:    { label: "Low",    color: "text-gray-500",   bg: "bg-gray-50 border-gray-200" },
};

const subjectIcon: Record<string, string> = {
  Quran: "📖",
  Arabic: "🌙",
  Fiqh: "⚖️",
  "Islamic Studies": "🕌",
};

export default function TeacherHomeworkPage() {
  const [showCreate, setShowCreate]   = useState(false);
  const [hwType, setHwType]           = useState<"daily" | "long">("daily");
  const [activeTab, setActiveTab]     = useState<TabType>("all");
  const [search, setSearch]           = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedSet, setVerifiedSet] = useState<Set<string>>(new Set());
  const [showNotifyId, setShowNotifyId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle]       = useState("");
  const [formDesc, setFormDesc]         = useState("");
  const [formSubject, setFormSubject]   = useState(SUBJECTS[0]);
  const [formClass, setFormClass]       = useState(CLASSES[0]);
  const [formDue, setFormDue]           = useState("");
  const [formPriority, setFormPriority] = useState<PriorityType>("medium");

  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name ?? id;
  const getStudentInitials = (id: string) => {
    const name = students.find((s) => s.id === id)?.name ?? id;
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("");
  };

  const today = new Date();
  const isOverdue = (dueDate: string) => new Date(dueDate) < today;

  // Overall stats
  const stats = useMemo(() => {
    let total = 0, completed = 0, pending = 0, missing = 0;
    homeworkList.forEach((hw) => {
      hw.studentStatuses.forEach((ss) => {
        total++;
        if (ss.status === "green" || ss.status === "returned") completed++;
        else if (ss.status === "yellow") pending++;
        else if (ss.status === "red") missing++;
      });
    });
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, missing, pct };
  }, []);

  // Filtered list
  const filtered = useMemo(() => {
    return homeworkList.filter((hw) => {
      if (activeTab === "daily"   && hw.type !== "daily") return false;
      if (activeTab === "long"    && hw.type !== "long")  return false;
      if (activeTab === "overdue" && !isOverdue(hw.dueDate)) return false;
      if (subjectFilter !== "all" && hw.subject !== subjectFilter) return false;
      if (search && !hw.title.toLowerCase().includes(search.toLowerCase()) &&
          !hw.subject.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, subjectFilter, search]);

  const handleVerify = (hwId: string, studentId: string) => {
    setVerifiedSet((prev) => new Set([...prev, `${hwId}-${studentId}`]));
    // Simulate notification toast
    setShowNotifyId(`${hwId}-${studentId}`);
    setTimeout(() => setShowNotifyId(null), 2500);
  };

  const handleAssign = () => {
    setShowCreate(false);
    setFormTitle(""); setFormDesc(""); setFormDue("");
    setShowNotifyId("new-hw");
    setTimeout(() => setShowNotifyId(null), 3000);
  };

  const overdueCount = homeworkList.filter((hw) => isOverdue(hw.dueDate)).length;

  return (
    <DashboardLayout>
      <PageHeader
        title="Homework"
        subtitle="Assign, track & verify student submissions"
        icon={BookOpen}
        back
        backHref="/teacher"
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-200"
          >
            <Plus className="w-4 h-4" /> Assign
          </button>
        }
      />

      {/* ── Toast notification ───────────────────────────────── */}
      <AnimatePresence>
        {showNotifyId && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-100 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4" />
            {showNotifyId === "new-hw" ? "Homework assigned! Parents notified 📲" : "Homework verified & parent notified ✅"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Completed",  value: stats.completed, icon: CheckCircle2,   color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending",    value: stats.pending,   icon: Clock,          color: "text-amber-600",   bg: "bg-amber-50" },
          { label: "Missing",    value: stats.missing,   icon: AlertTriangle,  color: "text-red-500",     bg: "bg-red-50" },
          { label: "Completion", value: `${stats.pct}%`, icon: TrendingUp,     color: "text-blue-600",    bg: "bg-blue-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
          >
            <div className={`${bg} rounded-xl p-2.5`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Overall progress bar ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-emerald-600" /> Overall Submission Rate
          </p>
          <span className="text-sm font-bold text-emerald-700">{stats.pct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${stats.pct}%` }} transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-linear-to-r from-emerald-400 to-emerald-600 rounded-full"
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-400">{stats.completed} submitted out of {stats.total}</span>
          {overdueCount > 0 && (
            <span className="text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {overdueCount} overdue
            </span>
          )}
        </div>
      </div>

      {/* ── Search + Filter bar ──────────────────────────────── */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search homework..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-200 text-gray-600"}`}
        >
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Subject filter */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex gap-2 flex-wrap pb-1">
              {["all", ...SUBJECTS].map((sub) => (
                <button key={sub} onClick={() => setSubjectFilter(sub)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${subjectFilter === sub ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400"}`}
                >
                  {sub === "all" ? "All Subjects" : `${subjectIcon[sub]} ${sub}`}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        {([
          { key: "all",    label: "All",       count: homeworkList.length },
          { key: "daily",  label: "Daily",     count: homeworkList.filter((h) => h.type === "daily").length },
          { key: "long",   label: "Long-term", count: homeworkList.filter((h) => h.type === "long").length },
          { key: "overdue",label: "Overdue",   count: overdueCount },
        ] as { key: TabType; label: string; count: number }[]).map(({ key, label, count }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === key ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {label}
            {count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === key ? (key === "overdue" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700") : "bg-gray-200 text-gray-500"}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Homework cards ───────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookMarked className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No homework found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((hw, i) => {
            const done     = hw.studentStatuses.filter((s) => s.status === "green" || s.status === "returned").length;
            const pend     = hw.studentStatuses.filter((s) => s.status === "yellow").length;
            const miss     = hw.studentStatuses.filter((s) => s.status === "red").length;
            const total    = hw.studentStatuses.length;
            const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
            const overdue  = isOverdue(hw.dueDate);
            const priority = hw.priority as PriorityType;
            const expanded = expandedId === hw.id;

            return (
              <motion.div
                key={hw.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`bg-white rounded-2xl border overflow-hidden transition-shadow ${overdue ? "border-red-200 shadow-sm shadow-red-50" : "border-gray-100"}`}
              >
                {/* Card header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Subject icon */}
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg shrink-0 border border-gray-100">
                      {subjectIcon[hw.subject] ?? "📚"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${hw.type === "daily" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
                          {hw.type === "daily" ? "Daily" : "Long Term"}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${priorityConfig[priority].bg} ${priorityConfig[priority].color}`}>
                          {priority === "high" && <Star className="w-2.5 h-2.5 inline mr-0.5" />}
                          {priorityConfig[priority].label}
                        </span>
                        {overdue && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> Overdue
                          </span>
                        )}
                      </div>

                      <p className="font-semibold text-gray-900 text-sm leading-snug">{hw.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{hw.description}</p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Due {hw.dueDate}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {total} students</span>
                        <span className="flex items-center gap-1 font-medium text-gray-700">{hw.subject}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => setExpandedId(expanded ? null : hw.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                      >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Mini progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-emerald-600 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{done} done</span>
                        <span className="flex items-center gap-1 text-amber-600"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{pend} pending</span>
                        <span className="flex items-center gap-1 text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{miss} missing</span>
                      </div>
                      <span className="text-xs font-bold text-gray-700">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(done / total) * 100}%` }} />
                      <div className="h-full bg-amber-400 transition-all" style={{ width: `${(pend / total) * 100}%` }} />
                      <div className="h-full bg-red-400 transition-all" style={{ width: `${(miss / total) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* Expanded student list */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-50 bg-gray-50/50 px-4 pt-3 pb-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Student Submissions</p>
                          <button className="flex items-center gap-1 text-xs text-emerald-600 font-medium hover:underline">
                            <Bell className="w-3 h-3" /> Remind All Missing
                          </button>
                        </div>

                        <div className="space-y-2">
                          {hw.studentStatuses.map((ss) => {
                            const vKey = `${hw.id}-${ss.studentId}`;
                            const isVerified = verifiedSet.has(vKey) || ss.status === "green" || ss.status === "returned";
                            const effectiveStatus: HWStatus = verifiedSet.has(vKey) ? "green" : (ss.status as HWStatus);

                            return (
                              <div key={ss.studentId}
                                className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-gray-100"
                              >
                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">
                                  {getStudentInitials(ss.studentId)}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">{getStudentName(ss.studentId)}</p>
                                  {ss.feedback && (
                                    <p className="text-xs text-emerald-600 truncate">💬 {ss.feedback}</p>
                                  )}
                                  {ss.note && !ss.feedback && (
                                    <p className="text-xs text-gray-400 truncate">📝 {ss.note}</p>
                                  )}
                                </div>

                                {/* Progress bar for long term */}
                                {hw.type === "long" && "progress" in ss && (
                                  <div className="flex items-center gap-1.5 w-20">
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${(ss.progress as number) >= 100 ? "bg-emerald-500" : (ss.progress as number) >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                                        style={{ width: `${ss.progress}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] text-gray-500 w-7 text-right">{ss.progress}%</span>
                                  </div>
                                )}

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <StatusBadge status={effectiveStatus} size="sm" />

                                  {/* Verify button for parent-confirmed (yellow) */}
                                  {ss.status === "yellow" && !isVerified && (
                                    <button
                                      onClick={() => handleVerify(hw.id, ss.studentId)}
                                      title="Mark as verified"
                                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                    >
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    </button>
                                  )}

                                  {/* Remind button for missing */}
                                  {ss.status === "red" && (
                                    <button
                                      title="Send reminder to parent"
                                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                                    >
                                      <Send className="w-3.5 h-3.5 text-red-500" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Description block */}
                        <div className="mt-3 bg-white rounded-xl p-3 border border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Instructions</p>
                          <p className="text-sm text-gray-700">{hw.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Assign Homework Modal ────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Assign Homework</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Fill in details and notify parents automatically</p>
                </div>
                <button onClick={() => setShowCreate(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 pb-6 pt-4 space-y-4">
                {/* Type selector */}
                <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
                  <button onClick={() => setHwType("daily")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${hwType === "daily" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    📅 Daily
                  </button>
                  <button onClick={() => setHwType("long")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${hwType === "long" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    📌 Long Term
                  </button>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                  <input
                    value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Memorize Surah Al-Fatiha"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Instructions</label>
                  <textarea
                    value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Add detailed instructions for students..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none transition-colors"
                  />
                </div>

                {/* Subject + Class row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                    <select value={formSubject} onChange={(e) => setFormSubject(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none text-sm"
                    >
                      {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Class</label>
                    <select value={formClass} onChange={(e) => setFormClass(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none text-sm"
                    >
                      {CLASSES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                  <div className="flex gap-2">
                    {(["high", "medium", "low"] as PriorityType[]).map((p) => (
                      <button key={p} onClick={() => setFormPriority(p)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold capitalize transition-all ${formPriority === p ? `${priorityConfig[p].bg} ${priorityConfig[p].color} border-current` : "bg-white text-gray-400 border-gray-200"}`}
                      >
                        {p === "high" && "🔴 "}{p === "medium" && "🟡 "}{p === "low" && "🟢 "}
                        {priorityConfig[p].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due date — only for long-term homework */}
                {hwType === "long" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <input type="date" value={formDue} onChange={(e) => setFormDue(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                )}

                {/* Notify toggle info */}
                <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <Bell className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-700">Parents will be notified automatically when homework is assigned.</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleAssign}
                    disabled={!formTitle}
                    className="flex-1 bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Assign & Notify
                  </button>
                  <button onClick={() => setShowCreate(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
