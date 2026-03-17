"use client";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { diaryEntries as mockDiaryEntries, students } from "@/mock-data";
import {
  FileText, Plus, Search, Filter, BookOpen, User, Calendar,
  Bell, Send, Trash2, Edit2, X, ChevronDown, ChevronUp,
  CheckCircle2, Star, MessageSquare, Clock, Eye,
  Bookmark, TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type DiaryType = "class" | "student";
type MoodType = "positive" | "neutral" | "concern";
type TabType = "all" | "class" | "student" | "starred";

interface DiaryEntry {
  id: string;
  date: string;
  class: string;
  teacherId: string;
  type: DiaryType;
  title: string;
  content: string;
  targetStudentId: string | null;
  mood?: MoodType;
  starred?: boolean;
  notified?: boolean;
  tags?: string[];
}

const MOODS: Record<MoodType, { emoji: string; label: string; color: string; bg: string }> = {
  positive: { emoji: "😊", label: "Positive",  color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  neutral:  { emoji: "😐", label: "Neutral",   color: "text-amber-700",   bg: "bg-amber-50 border-amber-200"   },
  concern:  { emoji: "😟", label: "Concern",   color: "text-red-600",     bg: "bg-red-50 border-red-200"       },
};

const QUICK_TAGS = ["Tajweed", "Memorization", "Behavior", "Progress", "Attendance", "Homework", "Arabic", "Fiqh"];

const enriched: DiaryEntry[] = [
  ...mockDiaryEntries.map((e, i) => ({
    ...e,
    type: e.type as DiaryType,
    mood: (["positive", "positive", "neutral"] as MoodType[])[i % 3],
    starred: i === 1,
    notified: true,
    tags: ([["Tajweed", "Memorization"], ["Tajweed", "Progress"], ["Memorization"]] as string[][])[i % 3],
  })),
  {
    id: "D004",
    date: "2026-03-12",
    class: "Class 4",
    teacherId: "T001",
    type: "student",
    title: "Concern – Yusuf's Attendance",
    content: "Yusuf was absent again today without prior notice. This is the third time this week. Please contact the family to understand the situation and ensure regular attendance.",
    targetStudentId: "S003",
    mood: "concern",
    starred: false,
    notified: true,
    tags: ["Attendance", "Behavior"],
  },
  {
    id: "D005",
    date: "2026-03-11",
    class: "Class 4",
    teacherId: "T001",
    type: "class",
    title: "Arabic Grammar – Ism & Fi'l",
    content: "Covered fundamentals of Ism (noun) and Fi'l (verb) in Arabic grammar. Students practised identifying each in Quranic verses. Class participation was excellent.",
    targetStudentId: null,
    mood: "positive",
    starred: false,
    notified: true,
    tags: ["Arabic"],
  },
  {
    id: "D006",
    date: "2026-03-10",
    class: "Class 4",
    teacherId: "T001",
    type: "student",
    title: "Excellent Hifz Progress – Fatima",
    content: "Fatima completed Surah Al-Mulk today with excellent tajweed. She is ahead of schedule. Encourage her to maintain this momentum and start reviewing previously memorized surahs.",
    targetStudentId: "S004",
    mood: "positive",
    starred: true,
    notified: true,
    tags: ["Memorization", "Progress"],
  },
];

const CLASSES  = ["Class 3", "Class 4", "Class 5"];
const classStudents = (cls: string) => students.filter((s) => s.class === cls);

export default function TeacherDiaryPage() {
  const [entries, setEntries]           = useState<DiaryEntry[]>(enriched);
  const [showCreate, setShowCreate]     = useState(false);
  const [activeTab, setActiveTab]       = useState<TabType>("all");
  const [search, setSearch]             = useState("");
  const [showFilters, setShowFilters]   = useState(false);
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [showToast, setShowToast]       = useState<string | null>(null);
  const [previewEntry, setPreviewEntry] = useState<DiaryEntry | null>(null);

  // Form state
  const [formType, setFormType]         = useState<DiaryType>("class");
  const [formTitle, setFormTitle]       = useState("");
  const [formContent, setFormContent]   = useState("");
  const [formClass, setFormClass]       = useState(CLASSES[1]);
  const [formStudent, setFormStudent]   = useState("");
  const [formMood, setFormMood]         = useState<MoodType>("positive");
  const [formTags, setFormTags]         = useState<string[]>([]);
  const [formNotify, setFormNotify]     = useState(true);

  const toast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2800);
  };

  const getStudentName = (id: string | null) =>
    id ? (students.find((s) => s.id === id)?.name ?? id) : null;

  const getStudentInitials = (id: string | null) => {
    if (!id) return "?";
    const name = students.find((s) => s.id === id)?.name ?? id;
    return name.split(" ").slice(0, 2).map((n) => n[0]).join("");
  };

  const toggleStar = (id: string) => {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, starred: !e.starred } : e));
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast("Entry deleted");
  };

  const handleSave = () => {
    const newEntry: DiaryEntry = {
      id: `D${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      class: formClass,
      teacherId: "T001",
      type: formType,
      title: formTitle,
      content: formContent,
      targetStudentId: formType === "student" ? formStudent : null,
      mood: formMood,
      starred: false,
      notified: formNotify,
      tags: formTags,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setShowCreate(false);
    setFormTitle(""); setFormContent(""); setFormTags([]);
    toast(formNotify ? "Entry saved & parents notified 📲" : "Entry saved as draft 📝");
  };

  // Stats
  const stats = useMemo(() => ({
    total:    entries.length,
    class:    entries.filter((e) => e.type === "class").length,
    student:  entries.filter((e) => e.type === "student").length,
    starred:  entries.filter((e) => e.starred).length,
    positive: entries.filter((e) => e.mood === "positive").length,
    concern:  entries.filter((e) => e.mood === "concern").length,
  }), [entries]);

  // Filtered
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (activeTab === "class"   && e.type !== "class")   return false;
      if (activeTab === "student" && e.type !== "student") return false;
      if (activeTab === "starred" && !e.starred)           return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) &&
          !e.content.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [entries, activeTab, search]);

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, DiaryEntry[]> = {};
    filtered.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const formatDate = (d: string) => {
    const date = new Date(d);
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Daily Diary"
        subtitle="Class notes & personal student remarks"
        icon={FileText}
        back
        backHref="/teacher"
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-200"
          >
            <Plus className="w-4 h-4" /> Write
          </button>
        }
      />

      {/* ── Toast ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-100 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {showToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-5">
        {[
          { label: "Total",    value: stats.total,    icon: FileText,     color: "text-gray-600",    bg: "bg-gray-50" },
          { label: "Class",    value: stats.class,    icon: BookOpen,     color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Student",  value: stats.student,  icon: User,         color: "text-blue-600",    bg: "bg-blue-50" },
          { label: "Starred",  value: stats.starred,  icon: Star,         color: "text-amber-500",   bg: "bg-amber-50" },
          { label: "Positive", value: stats.positive, icon: TrendingUp,   color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Concerns", value: stats.concern,  icon: MessageSquare,color: "text-red-500",     bg: "bg-red-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col items-center gap-1 text-center"
          >
            <div className={`${bg} rounded-lg p-2`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <p className="text-lg font-bold text-gray-900 leading-none">{value}</p>
            <p className="text-[10px] text-gray-400 font-medium">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Search + Filter ────────────────────────────────── */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search diary entries..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-200 text-gray-600"}`}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Mood filter pills */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Filter by Mood</p>
            <div className="flex gap-2 flex-wrap">
              {(Object.entries(MOODS) as [MoodType, typeof MOODS[MoodType]][]).map(([key, cfg]) => (
                <button key={key}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${cfg.bg} ${cfg.color}`}
                >
                  {cfg.emoji} {cfg.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        {([
          { key: "all",     label: "All",         count: entries.length },
          { key: "class",   label: "Class Notes", count: stats.class },
          { key: "student", label: "Student",     count: stats.student },
          { key: "starred", label: "⭐ Starred",  count: stats.starred },
        ] as { key: TabType; label: string; count: number }[]).map(({ key, label, count }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === key ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500"}`}
          >
            {label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === key ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-400"}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* ── Entries grouped by date ────────────────────────── */}
      {grouped.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No diary entries found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, dayEntries]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600">{formatDate(date)}</span>
                </div>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">{dayEntries.length} {dayEntries.length === 1 ? "entry" : "entries"}</span>
              </div>

              <div className="space-y-3">
                {dayEntries.map((entry, i) => {
                  const isExpanded = expandedId === entry.id;
                  const studentName = getStudentName(entry.targetStudentId);
                  const mood = entry.mood ? MOODS[entry.mood] : null;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className={`bg-white rounded-2xl border overflow-hidden transition-shadow hover:shadow-sm ${
                        entry.mood === "concern" ? "border-red-100" :
                        entry.mood === "positive" ? "border-emerald-100" :
                        "border-gray-100"
                      }`}
                    >
                      {/* Left accent bar */}
                      <div className="flex">
                        <div className={`w-1 shrink-0 ${entry.mood === "concern" ? "bg-red-400" : entry.mood === "positive" ? "bg-emerald-400" : "bg-amber-300"}`} />

                        <div className="flex-1 p-4">
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Type badge */}
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${entry.type === "class" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                                {entry.type === "class" ? "📚 Class Note" : "👤 Student Note"}
                              </span>
                              {/* Mood badge */}
                              {mood && (
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${mood.bg} ${mood.color}`}>
                                  {mood.emoji} {mood.label}
                                </span>
                              )}
                              {/* Notified */}
                              {entry.notified && (
                                <span className="text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  📨 Notified
                                </span>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => toggleStar(entry.id)}
                                className={`p-1.5 rounded-lg transition-colors ${entry.starred ? "text-amber-500 bg-amber-50" : "text-gray-300 hover:text-amber-400 hover:bg-amber-50"}`}
                              >
                                <Star className="w-3.5 h-3.5" fill={entry.starred ? "currentColor" : "none"} />
                              </button>
                              <button onClick={() => setPreviewEntry(entry)}
                                className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteEntry(entry.id)}
                                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Student avatar (student notes) */}
                          {entry.type === "student" && entry.targetStudentId && (
                            <div className="flex items-center gap-2 mt-2.5">
                              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                                {getStudentInitials(entry.targetStudentId)}
                              </div>
                              <span className="text-xs font-semibold text-blue-700">{studentName}</span>
                              <span className="text-xs text-gray-400">· {entry.class}</span>
                            </div>
                          )}
                          {entry.type === "class" && (
                            <div className="flex items-center gap-1 mt-2">
                              <BookOpen className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-400">{entry.class}</span>
                            </div>
                          )}

                          {/* Title + Content */}
                          <h3 className="font-semibold text-gray-900 text-sm mt-2 leading-snug">{entry.title}</h3>
                          <p className={`text-sm text-gray-600 leading-relaxed mt-1 ${isExpanded ? "" : "line-clamp-2"}`}>
                            {entry.content}
                          </p>

                          {/* Tags */}
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {entry.tags.map((tag) => (
                                <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Expand / Collapse */}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                            className="mt-2.5 flex items-center gap-1 text-xs text-emerald-600 font-medium hover:underline"
                          >
                            {isExpanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
                          </button>

                          {/* Expanded actions */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 flex-wrap">
                                  <button
                                    onClick={() => { toast("Reminder sent to parents 📲"); }}
                                    className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                                  >
                                    <Bell className="w-3.5 h-3.5" /> Re-notify Parents
                                  </button>
                                  <button
                                    onClick={() => { toast("Entry copied to clipboard 📋"); }}
                                    className="flex items-center gap-1.5 text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                  >
                                    <Send className="w-3.5 h-3.5" /> Share Entry
                                  </button>
                                  <button
                                    onClick={() => toggleStar(entry.id)}
                                    className={`flex items-center gap-1.5 text-xs font-semibold border px-3 py-1.5 rounded-lg transition-colors ${entry.starred ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}
                                  >
                                    <Bookmark className="w-3.5 h-3.5" /> {entry.starred ? "Unstar" : "Star Entry"}
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Full Preview Modal ─────────────────────────────── */}
      <AnimatePresence>
        {previewEntry && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setPreviewEntry(null); }}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${previewEntry.type === "class" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                    {previewEntry.type === "class" ? "📚 Class Note" : "👤 Student Note"}
                  </span>
                  {previewEntry.mood && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${MOODS[previewEntry.mood].bg} ${MOODS[previewEntry.mood].color}`}>
                      {MOODS[previewEntry.mood].emoji} {MOODS[previewEntry.mood].label}
                    </span>
                  )}
                </div>
                <button onClick={() => setPreviewEntry(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {previewEntry.type === "student" && previewEntry.targetStudentId && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                    {getStudentInitials(previewEntry.targetStudentId)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{getStudentName(previewEntry.targetStudentId)}</p>
                    <p className="text-xs text-gray-400">{previewEntry.class}</p>
                  </div>
                </div>
              )}

              <h2 className="text-lg font-bold text-gray-900 mb-2">{previewEntry.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{previewEntry.content}</p>

              {previewEntry.tags && previewEntry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {previewEntry.tags.map((tag) => (
                    <span key={tag} className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" /> {previewEntry.date}
                </div>
                {previewEntry.notified && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Parents notified
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Write Diary Modal ──────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
          >
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Write Diary Entry</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Notes are sent to parents automatically</p>
                </div>
                <button onClick={() => setShowCreate(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
              </div>

              <div className="px-6 pb-6 pt-4 space-y-4">
                {/* Type */}
                <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
                  <button onClick={() => setFormType("class")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${formType === "class" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500"}`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Class Note
                  </button>
                  <button onClick={() => setFormType("student")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${formType === "student" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500"}`}
                  >
                    <User className="w-3.5 h-3.5" /> Student Note
                  </button>
                </div>

                {/* Class + Student */}
                <div className={`grid gap-3 ${formType === "student" ? "grid-cols-2" : "grid-cols-1"}`}>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Class</label>
                    <select value={formClass} onChange={(e) => { setFormClass(e.target.value); setFormStudent(""); }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none text-sm"
                    >
                      {CLASSES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  {formType === "student" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Student <span className="text-red-500">*</span></label>
                      <select value={formStudent} onChange={(e) => setFormStudent(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none text-sm"
                      >
                        <option value="">Select…</option>
                        {classStudents(formClass).map((s) => (
                          <option key={s.id} value={s.id}>{s.name.split(" ")[0]}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                  <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Today's lesson summary"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-colors"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                  <textarea value={formContent} onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Write your note here... Parents will receive this."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none transition-colors"
                  />
                  <p className="text-right text-xs text-gray-400 mt-1">{formContent.length} chars</p>
                </div>

                {/* Mood */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mood / Tone</label>
                  <div className="flex gap-2">
                    {(Object.entries(MOODS) as [MoodType, typeof MOODS[MoodType]][]).map(([key, cfg]) => (
                      <button key={key} onClick={() => setFormMood(key)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${formMood === key ? `${cfg.bg} ${cfg.color} border-current` : "bg-white text-gray-400 border-gray-200"}`}
                      >
                        {cfg.emoji}<br />{cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TAGS.map((tag) => (
                      <button key={tag} onClick={() => setFormTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${formTags.includes(tag) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-500 border-gray-200 hover:border-emerald-400"}`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notify toggle */}
                <div className="flex items-center justify-between bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <p className="text-sm font-semibold text-emerald-800">Notify Parents</p>
                  </div>
                  <button onClick={() => setFormNotify((v) => !v)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${formNotify ? "bg-emerald-500" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${formNotify ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={!formTitle || (formType === "student" && !formStudent)}
                    className="flex-1 bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> {formNotify ? "Save & Notify" : "Save Draft"}
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
