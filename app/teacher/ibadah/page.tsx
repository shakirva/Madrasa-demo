"use client";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ibadahRecords, students, studentIbadahSubmissions } from "@/mock-data";
import {
  Moon, Save, CheckCircle2, AlertTriangle, Star, ChevronDown,
  ChevronUp, BookOpen, Heart, Sparkles,
  TrendingUp, MessageSquare, Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ───────────────────────────────────────────────────
type PrayerStatus  = "jama" | "individual" | "missed";
type TriStatus     = "yes" | "partial" | "no";
type ZikrLevel     = 0 | 1 | 2 | 3;   // 0 = none, 1-3 = rounds
type Section       = "prayers" | "sunnah" | "quran" | "zikr" | "akhlaq";

// ── Static config ────────────────────────────────────────────
const FARD_PRAYERS = ["fajr", "zuhr", "asr", "maghrib", "isha"] as const;
const FARD_LABELS: Record<string, string> = {
  fajr: "Fajr", zuhr: "Zuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha",
};

const SUNNAH_PRAYERS = [
  { key: "tahajjud",    label: "Tahajjud",      arabic: "تهجد",    time: "Pre-Fajr" },
  { key: "ishraq",      label: "Ishraq",        arabic: "اشراق",   time: "Post-Fajr" },
  { key: "duha",        label: "Duha",          arabic: "ضحى",     time: "Morning"  },
  { key: "awwabin",     label: "Awwabin",       arabic: "أوابين",  time: "Post-Maghrib" },
];

const QURAN_ACTIVITIES = [
  { key: "tilawah",     label: "Tilawah",       arabic: "تلاوة",   desc: "Recitation" },
  { key: "hifz",        label: "Hifz",          arabic: "حفظ",     desc: "Memorization" },
  { key: "tajweed",     label: "Tajweed",       arabic: "تجويد",   desc: "Practice" },
  { key: "revision",    label: "Muraja'ah",     arabic: "مراجعة",  desc: "Revision" },
];

const ZIKR_TYPES = [
  { key: "subhanallah", label: "SubhanAllah",   arabic: "سبحان الله",  target: 33 },
  { key: "alhamdulillah",label:"Alhamdulillah", arabic: "الحمد لله",   target: 33 },
  { key: "allahuakbar", label: "Allahu Akbar",  arabic: "الله أكبر",   target: 34 },
  { key: "istighfar",   label: "Istighfar",     arabic: "استغفر الله", target: 100 },
  { key: "durood",      label: "Durood",        arabic: "صلى الله",    target: 100 },
];

const AKHLAQ_ITEMS = [
  { key: "punctual",    label: "Punctuality",   icon: "⏰" },
  { key: "respectful",  label: "Respectful",    icon: "🤝" },
  { key: "helpful",     label: "Helpful",       icon: "💚" },
  { key: "honest",      label: "Honest",        icon: "✨" },
];

// ── Helpers ──────────────────────────────────────────────────
const prayerCycle: PrayerStatus[] = ["jama", "individual", "missed"];
const triCycle: TriStatus[]       = ["yes", "partial", "no"];

const prayerColor = (s: PrayerStatus) =>
  s === "jama" ? "bg-emerald-500 text-white" : s === "individual" ? "bg-amber-400 text-white" : "bg-red-400 text-white";
const prayerShort = (s: PrayerStatus) =>
  s === "jama" ? "J" : s === "individual" ? "I" : "✗";

const triColor = (s: TriStatus) =>
  s === "yes" ? "bg-emerald-500 text-white" : s === "partial" ? "bg-amber-400 text-white" : "bg-gray-200 text-gray-500";
const triLabel = (s: TriStatus) =>
  s === "yes" ? "✓" : s === "partial" ? "~" : "—";

// ── Extended record type ─────────────────────────────────────
interface ExtRecord {
  studentId: string;
  date: string;
  // fard prayers
  fajr: PrayerStatus; zuhr: PrayerStatus; asr: PrayerStatus; maghrib: PrayerStatus; isha: PrayerStatus;
  // sunnah
  tahajjud: TriStatus; ishraq: TriStatus; duha: TriStatus; awwabin: TriStatus;
  // quran
  tilawah: TriStatus; hifz: TriStatus; tajweed: TriStatus; revision: TriStatus;
  tilawahPages: number;
  hifzLines: number;
  // zikr (rounds completed out of target)
  subhanallah: ZikrLevel; alhamdulillah: ZikrLevel; allahuakbar: ZikrLevel;
  istighfar: ZikrLevel; durood: ZikrLevel;
  // akhlaq
  punctual: TriStatus; respectful: TriStatus; helpful: TriStatus; honest: TriStatus;
  // legacy
  memorization: number; behavior: number; swalaathCount: number; remarks: string;
}

const buildInitial = (): ExtRecord[] =>
  ibadahRecords.map((r) => ({
    ...r,
    fajr: r.fajr as PrayerStatus, zuhr: r.zuhr as PrayerStatus,
    asr: r.asr as PrayerStatus, maghrib: r.maghrib as PrayerStatus, isha: r.isha as PrayerStatus,
    tahajjud: "no", ishraq: "yes", duha: "partial", awwabin: "yes",
    tilawah: "yes", hifz: "yes", tajweed: "partial", revision: "yes",
    tilawahPages: Math.floor(Math.random() * 3) + 1,
    hifzLines: Math.floor(Math.random() * 5) + 1,
    subhanallah: 3, alhamdulillah: 2, allahuakbar: 3, istighfar: 1, durood: 2,
    punctual: "yes", respectful: "yes", helpful: "partial", honest: "yes",
  } as ExtRecord));

// ── Section config ────────────────────────────────────────────
const SECTIONS: { key: Section; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { key: "prayers", label: "Fard Prayers",  icon: Moon,         color: "text-emerald-600" },
  { key: "sunnah",  label: "Sunnah",        icon: Star,         color: "text-amber-500"   },
  { key: "quran",   label: "Quran",         icon: BookOpen,     color: "text-blue-600"    },
  { key: "zikr",    label: "Zikr",          icon: Sparkles,     color: "text-purple-600"  },
  { key: "akhlaq",  label: "Akhlaq",        icon: Heart,        color: "text-rose-500"    },
];

// ── Component ─────────────────────────────────────────────────
export default function TeacherIbadahPage() {
  const class4Students = students.filter((s) => s.class === "Class 4");
  const [records, setRecords]         = useState<ExtRecord[]>(buildInitial);
  const [saved, setSaved]             = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("prayers");
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [showToast, setShowToast]     = useState(false);
  const [editRemarks, setEditRemarks] = useState<string | null>(null);
  const [remarksText, setRemarksText] = useState("");
  const [viewMode, setViewMode]       = useState<"entry" | "submissions">("entry");
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  const getRecord = (id: string) => records.find((r) => r.studentId === id)!;

  const update = <K extends keyof ExtRecord>(studentId: string, key: K, value: ExtRecord[K]) =>
    setRecords((prev) => prev.map((r) => r.studentId === studentId ? { ...r, [key]: value } : r));

  const cyclePrayer = (studentId: string, prayer: keyof ExtRecord) => {
    const cur = getRecord(studentId)[prayer] as PrayerStatus;
    update(studentId, prayer, prayerCycle[(prayerCycle.indexOf(cur) + 1) % prayerCycle.length]);
  };

  const cycleTri = (studentId: string, key: keyof ExtRecord) => {
    const cur = getRecord(studentId)[key] as TriStatus;
    update(studentId, key, triCycle[(triCycle.indexOf(cur) + 1) % triCycle.length]);
  };

  const cycleZikr = (studentId: string, key: keyof ExtRecord) => {
    const cur = getRecord(studentId)[key] as ZikrLevel;
    update(studentId, key, ((cur + 1) % 4) as ZikrLevel);
  };

  const zikrColor = (level: ZikrLevel) =>
    level === 0 ? "bg-gray-100 text-gray-400" : level === 1 ? "bg-purple-100 text-purple-600" : level === 2 ? "bg-purple-400 text-white" : "bg-purple-600 text-white";
  const zikrLabel = (level: ZikrLevel, target: number) =>
    level === 0 ? "—" : level === 1 ? `~${Math.floor(target * 0.33)}` : level === 2 ? `~${Math.floor(target * 0.66)}` : `${target}+`;

  // ── Stats ──────────────────────────────────────────────────
  const classStats = useMemo(() => {
    const total = class4Students.length;
    let fullPrayer = 0, sunnahAny = 0, quranDone = 0, zikrDone = 0;
    records.forEach((r) => {
      const allFard = FARD_PRAYERS.every((p) => r[p] !== "missed");
      if (allFard) fullPrayer++;
      if (r.tahajjud === "yes" || r.duha === "yes" || r.ishraq === "yes") sunnahAny++;
      if (r.tilawah === "yes") quranDone++;
      if ((r.subhanallah as ZikrLevel) === 3) zikrDone++;
    });
    return { total, fullPrayer, sunnahAny, quranDone, zikrDone };
  }, [records, class4Students.length]);

  const handleSave = () => {
    setSaved(true);
    setShowToast(true);
    setTimeout(() => { setSaved(false); setShowToast(false); }, 3000);
  };

  const scoreOf = (r: ExtRecord) => {
    const fardScore   = FARD_PRAYERS.filter((p) => r[p] === "jama").length * 2 + FARD_PRAYERS.filter((p) => r[p] === "individual").length;
    const sunnahScore = SUNNAH_PRAYERS.filter(({ key }) => (r[key as keyof ExtRecord] as TriStatus) === "yes").length;
    const quranScore  = QURAN_ACTIVITIES.filter(({ key }) => (r[key as keyof ExtRecord] as TriStatus) === "yes").length;
    const zikrScore   = ZIKR_TYPES.filter(({ key }) => (r[key as keyof ExtRecord] as ZikrLevel) === 3).length;
    const akhlaqScore = AKHLAQ_ITEMS.filter(({ key }) => (r[key as keyof ExtRecord] as TriStatus) === "yes").length;
    return fardScore + sunnahScore + quranScore + zikrScore + akhlaqScore;
  };

  return (
    <DashboardLayout>
      <PageHeader title="Ibadah Tracking" subtitle={`Class 4 · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`} icon={Moon} back backHref="/teacher" />

      {/* ── View Mode Toggle ──────────────────────────────────── */}
      <div className="flex gap-1.5 mb-5 bg-white border border-gray-100 rounded-xl p-1">
        <button
          onClick={() => setViewMode("entry")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${viewMode === "entry" ? "bg-emerald-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
        >
          Teacher Entry
        </button>
        <button
          onClick={() => setViewMode("submissions")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${viewMode === "submissions" ? "bg-emerald-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
        >
          <Send className="w-3.5 h-3.5" /> Student Submissions
        </button>
      </div>

      {/* ── Toast ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-100 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4" /> All ibadah records saved successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════ TEACHER ENTRY MODE ═══════════════════ */}
      {viewMode === "entry" && (<>
      {/* ── Class overview stats ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Full Prayers", value: `${classStats.fullPrayer}/${classStats.total}`, icon: Moon,       color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Sunnah Done",  value: `${classStats.sunnahAny}/${classStats.total}`,  icon: Star,       color: "text-amber-500",   bg: "bg-amber-50"   },
          { label: "Quran Today",  value: `${classStats.quranDone}/${classStats.total}`,  icon: BookOpen,   color: "text-blue-600",    bg: "bg-blue-50"    },
          { label: "Zikr Full",    value: `${classStats.zikrDone}/${classStats.total}`,   icon: Sparkles,   color: "text-purple-600",  bg: "bg-purple-50"  },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
          >
            <div className={`${bg} rounded-xl p-2.5`}><Icon className={`w-5 h-5 ${color}`} /></div>
            <div>
              <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Section tabs ──────────────────────────────────────── */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-none">
        {SECTIONS.map(({ key, label, icon: Icon, color }) => (
          <button key={key} onClick={() => setActiveSection(key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all shrink-0 ${
              activeSection === key ? "bg-white shadow-sm border-gray-200 text-gray-900" : "bg-gray-100 border-transparent text-gray-500"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${activeSection === key ? color : "text-gray-400"}`} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Legend ────────────────────────────────────────────── */}
      {activeSection === "prayers" && (
        <div className="flex gap-3 mb-4 flex-wrap">
          {[["bg-emerald-500", "Jama'a"], ["bg-amber-400", "Individual"], ["bg-red-400", "Missed"]].map(([bg, lbl]) => (
            <div key={lbl} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-gray-100">
              <span className={`w-2 h-2 rounded-full ${bg}`} /><span className="text-xs text-gray-600">{lbl}</span>
            </div>
          ))}
          <span className="text-xs text-gray-400 self-center ml-auto hidden sm:block">Tap to cycle</span>
        </div>
      )}
      {(activeSection === "sunnah" || activeSection === "quran" || activeSection === "akhlaq") && (
        <div className="flex gap-3 mb-4 flex-wrap">
          {[["bg-emerald-500", "Done"], ["bg-amber-400", "Partial"], ["bg-gray-200", "Not Done"]].map(([bg, lbl]) => (
            <div key={lbl} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-gray-100">
              <span className={`w-2 h-2 rounded-full ${bg}`} /><span className="text-xs text-gray-600">{lbl}</span>
            </div>
          ))}
        </div>
      )}
      {activeSection === "zikr" && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {[["bg-gray-100", "None"], ["bg-purple-100", "~⅓"], ["bg-purple-400", "~⅔"], ["bg-purple-600", "Full"]].map(([bg, lbl]) => (
            <div key={lbl} className={`flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-100 ${bg}`}>
              <span className="text-xs text-gray-700 font-medium">{lbl}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Student cards ──────────────────────────────────────── */}
      <div className="space-y-4 pb-28">
        {class4Students.map((student, i) => {
          const rec = getRecord(student.id);
          if (!rec) return null;
          const expanded = expandedId === student.id;
          const score = scoreOf(rec);
          const fardMissed = FARD_PRAYERS.filter((p) => rec[p] === "missed").length;
          const initials = student.name.split(" ").slice(0, 2).map((n) => n[0]).join("");

          return (
            <motion.div key={student.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl border overflow-hidden ${fardMissed > 1 ? "border-red-100" : "border-gray-100"}`}
            >
              {/* Student header */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate">{student.name}</p>
                    {fardMissed === 0 && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">All Fard ✓</span>}
                    {fardMissed > 0 && <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" />{fardMissed} missed</span>}
                  </div>
                  <p className="text-xs text-gray-400">{rec.swalaathCount}/5 prayers · Score {score}</p>
                </div>
                {/* Ibadah score ring */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-700">{rec.memorization}%</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Hifz progress</p>
                </div>
                <button onClick={() => setExpandedId(expanded ? null : student.id)}
                  className="p-1.5 ml-1 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0"
                >
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* ── Active section content ─────────────────── */}
              <div className="px-4 pb-4">

                {/* FARD PRAYERS */}
                {activeSection === "prayers" && (
                  <div className="flex gap-2">
                    {FARD_PRAYERS.map((p) => (
                      <button key={p} onClick={() => cyclePrayer(student.id, p)}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${prayerColor(rec[p])}`}
                      >
                        <div className="text-base font-bold">{prayerShort(rec[p])}</div>
                        <div className="text-[9px] opacity-80 mt-0.5">{FARD_LABELS[p]}</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* SUNNAH PRAYERS */}
                {activeSection === "sunnah" && (
                  <div className="grid grid-cols-2 gap-2">
                    {SUNNAH_PRAYERS.map(({ key, label, arabic, time }) => {
                      const val = rec[key as keyof ExtRecord] as TriStatus;
                      return (
                        <button key={key} onClick={() => cycleTri(student.id, key as keyof ExtRecord)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all active:scale-95 ${
                            val === "yes" ? "bg-emerald-50 border-emerald-200" : val === "partial" ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${triColor(val)}`}>
                            {triLabel(val)}
                          </div>
                          <div className="text-left min-w-0">
                            <p className={`text-xs font-bold truncate ${val === "yes" ? "text-emerald-700" : val === "partial" ? "text-amber-700" : "text-gray-500"}`}>{label}</p>
                            <p className="text-[10px] text-gray-400">{arabic} · {time}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* QURAN */}
                {activeSection === "quran" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {QURAN_ACTIVITIES.map(({ key, label, arabic, desc }) => {
                        const val = rec[key as keyof ExtRecord] as TriStatus;
                        return (
                          <button key={key} onClick={() => cycleTri(student.id, key as keyof ExtRecord)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all active:scale-95 ${
                              val === "yes" ? "bg-blue-50 border-blue-200" : val === "partial" ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                              val === "yes" ? "bg-blue-500 text-white" : val === "partial" ? "bg-amber-400 text-white" : "bg-gray-200 text-gray-500"
                            }`}>{triLabel(val)}</div>
                            <div className="text-left min-w-0">
                              <p className={`text-xs font-bold truncate ${val === "yes" ? "text-blue-700" : val === "partial" ? "text-amber-700" : "text-gray-500"}`}>{label}</p>
                              <p className="text-[10px] text-gray-400">{arabic} · {desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {/* Tilawah pages + Hifz lines */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <p className="text-[10px] text-blue-500 font-semibold mb-1">Tilawah Pages</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => update(student.id, "tilawahPages", Math.max(0, rec.tilawahPages - 1))}
                            className="w-6 h-6 rounded-lg bg-blue-200 text-blue-700 font-bold text-sm flex items-center justify-center">−</button>
                          <span className="text-lg font-bold text-blue-700 flex-1 text-center">{rec.tilawahPages}</span>
                          <button onClick={() => update(student.id, "tilawahPages", rec.tilawahPages + 1)}
                            className="w-6 h-6 rounded-lg bg-blue-500 text-white font-bold text-sm flex items-center justify-center">+</button>
                        </div>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                        <p className="text-[10px] text-emerald-600 font-semibold mb-1">Hifz Lines</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => update(student.id, "hifzLines", Math.max(0, rec.hifzLines - 1))}
                            className="w-6 h-6 rounded-lg bg-emerald-200 text-emerald-700 font-bold text-sm flex items-center justify-center">−</button>
                          <span className="text-lg font-bold text-emerald-700 flex-1 text-center">{rec.hifzLines}</span>
                          <button onClick={() => update(student.id, "hifzLines", rec.hifzLines + 1)}
                            className="w-6 h-6 rounded-lg bg-emerald-500 text-white font-bold text-sm flex items-center justify-center">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ZIKR */}
                {activeSection === "zikr" && (
                  <div className="grid grid-cols-1 gap-2">
                    {ZIKR_TYPES.map(({ key, label, arabic, target }) => {
                      const level = rec[key as keyof ExtRecord] as ZikrLevel;
                      return (
                        <button key={key} onClick={() => cycleZikr(student.id, key as keyof ExtRecord)}
                          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-purple-50 hover:border-purple-100 transition-all active:scale-95"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${zikrColor(level)}`}>
                            {zikrLabel(level, target)}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-xs font-bold text-gray-800">{label}</p>
                            <p className="text-[10px] text-gray-400">{arabic} · target {target}×</p>
                          </div>
                          {/* Progress dots */}
                          <div className="flex gap-1 shrink-0">
                            {[1, 2, 3].map((dot) => (
                              <div key={dot} className={`w-2 h-2 rounded-full ${level >= dot ? "bg-purple-500" : "bg-gray-200"}`} />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* AKHLAQ */}
                {activeSection === "akhlaq" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {AKHLAQ_ITEMS.map(({ key, label, icon }) => {
                        const val = rec[key as keyof ExtRecord] as TriStatus;
                        return (
                          <button key={key} onClick={() => cycleTri(student.id, key as keyof ExtRecord)}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all active:scale-95 ${
                              val === "yes" ? "bg-rose-50 border-rose-200" : val === "partial" ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <span className="text-lg">{icon}</span>
                            <div className="text-left">
                              <p className={`text-xs font-bold ${val === "yes" ? "text-rose-700" : val === "partial" ? "text-amber-700" : "text-gray-500"}`}>{label}</p>
                              <p className="text-[10px] text-gray-400">{val === "yes" ? "Excellent" : val === "partial" ? "Improving" : "Needs work"}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {/* Behavior rating */}
                    <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-rose-700">Overall Behavior</p>
                        <span className="text-sm font-bold text-rose-700">{rec.behavior}/5</span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button key={v} onClick={() => update(student.id, "behavior", v)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${rec.behavior >= v ? "bg-rose-500 text-white" : "bg-white text-gray-400 border border-gray-200"}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Expanded: full summary ──────────────────── */}
              <AnimatePresence>
                {expanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="border-t border-gray-50 bg-gray-50/60 px-4 py-3 space-y-3">
                      {/* Mini summary grid */}
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Summary</p>
                      <div className="grid grid-cols-5 gap-1.5">
                        {FARD_PRAYERS.map((p) => (
                          <div key={p} className={`rounded-lg py-2 text-center text-[10px] font-bold ${prayerColor(rec[p])}`}>
                            <div>{prayerShort(rec[p])}</div>
                            <div className="opacity-70 mt-0.5">{FARD_LABELS[p]}</div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                          <p className="text-gray-400 font-medium mb-1 flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" /> Sunnah</p>
                          {SUNNAH_PRAYERS.map(({ key, label }) => {
                            const v = rec[key as keyof ExtRecord] as TriStatus;
                            return <div key={key} className="flex justify-between"><span className="text-gray-600">{label}</span><span className={v === "yes" ? "text-emerald-600 font-bold" : v === "partial" ? "text-amber-600" : "text-gray-300"}>{ v === "yes" ? "✓" : v === "partial" ? "~" : "—"}</span></div>;
                          })}
                        </div>
                        <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                          <p className="text-gray-400 font-medium mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-500" /> Zikr</p>
                          {ZIKR_TYPES.map(({ key, label, target }) => {
                            const v = rec[key as keyof ExtRecord] as ZikrLevel;
                            return <div key={key} className="flex justify-between"><span className="text-gray-600 truncate">{label}</span><span className={v === 3 ? "text-purple-600 font-bold" : v > 0 ? "text-purple-400" : "text-gray-300"}>{zikrLabel(v, target)}</span></div>;
                          })}
                        </div>
                      </div>
                      {/* Remarks */}
                      <div className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-semibold text-gray-500 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Teacher Remarks</p>
                          <button onClick={() => { setEditRemarks(student.id); setRemarksText(rec.remarks); }}
                            className="text-[10px] text-emerald-600 font-semibold hover:underline">Edit</button>
                        </div>
                        {editRemarks === student.id ? (
                          <div className="space-y-2">
                            <textarea value={remarksText} onChange={(e) => setRemarksText(e.target.value)} rows={2}
                              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                            <div className="flex gap-2">
                              <button onClick={() => { update(student.id, "remarks", remarksText); setEditRemarks(null); }}
                                className="flex-1 bg-emerald-600 text-white text-xs py-1.5 rounded-lg font-semibold">Save</button>
                              <button onClick={() => setEditRemarks(null)}
                                className="flex-1 bg-gray-100 text-gray-600 text-xs py-1.5 rounded-lg font-semibold">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600 italic">{rec.remarks || "No remarks yet."}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* ── Save button ──────────────────────────────────────── */}
      <div className="sticky bottom-20 lg:bottom-6 px-0 mt-4">
        <button onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm transition-all active:scale-98 shadow-lg ${
            saved ? "bg-emerald-100 text-emerald-700 shadow-emerald-100" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
          }`}
        >
          {saved ? <><CheckCircle2 className="w-5 h-5" /> Records Saved!</> : <><Save className="w-5 h-5" /> Save Ibadah Records</>}
        </button>
      </div>
      </>)}

      {/* ══════════════ STUDENT SUBMISSIONS MODE ════════════════ */}
      {viewMode === "submissions" && (
        <div className="space-y-4 pb-24">
          {/* Summary header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">Student Self-Reports</p>
              <p className="text-xs text-gray-400">Ibadah submitted by parents on behalf of students</p>
            </div>
            <div className="bg-emerald-50 rounded-xl px-3 py-1.5 text-center">
              <p className="text-lg font-bold text-emerald-700">{studentIbadahSubmissions.length}</p>
              <p className="text-[10px] text-emerald-600">Entries</p>
            </div>
          </div>

          {/* Group by student */}
          {class4Students.map((student) => {
            const submissions = studentIbadahSubmissions
              .filter((s) => s.studentId === student.id)
              .sort((a, b) => b.date.localeCompare(a.date));
            if (submissions.length === 0) return (
              <div key={student.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 opacity-50">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                  {student.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-400">No submissions yet</p>
                </div>
              </div>
            );

            return (
              <div key={student.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Student header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                    {student.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-400">{submissions.length} submission{submissions.length > 1 ? "s" : ""}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg px-2 py-1">
                    <p className="text-xs font-bold text-emerald-700">{submissions.length} days</p>
                  </div>
                </div>

                {/* Submission entries */}
                <div className="divide-y divide-gray-50">
                  {submissions.map((sub) => {
                    const fardMissed = ["fajr", "zuhr", "asr", "maghrib", "isha"].filter((p) => (sub as Record<string, unknown>)[p] === "missed").length;
                    const isExpanded = expandedSubId === sub.id;
                    const dateLabel = new Date(sub.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

                    return (
                      <div key={sub.id}>
                        {/* Row header */}
                        <div
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/60 transition-colors"
                          onClick={() => setExpandedSubId(isExpanded ? null : sub.id)}
                        >
                          <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                            <Moon className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{dateLabel}</p>
                            <p className="text-xs text-gray-400">
                              {fardMissed === 0 ? "All Fard ✓" : `${fardMissed} missed`}
                              {(sub as Record<string, unknown>).remarks ? " · Has remarks" : ""}
                            </p>
                          </div>
                          {/* Prayer mini pills */}
                          <div className="hidden sm:flex gap-1 shrink-0">
                            {(["fajr", "zuhr", "asr", "maghrib", "isha"] as const).map((p) => {
                              const st = (sub as Record<string, unknown>)[p] as string;
                              const bg = st === "jama" ? "bg-emerald-500 text-white" : st === "individual" ? "bg-amber-400 text-white" : "bg-red-400 text-white";
                              const lbl = st === "jama" ? "J" : st === "individual" ? "I" : "✗";
                              return <span key={p} className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold ${bg}`}>{lbl}</span>;
                            })}
                          </div>
                          {fardMissed > 0 && <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                        </div>

                        {/* Expanded details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-gray-50/60 px-4 py-3 space-y-3 border-t border-gray-50">
                                {/* Fard prayers grid */}
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Fard Prayers</p>
                                  <div className="grid grid-cols-5 gap-1.5">
                                    {(["fajr", "zuhr", "asr", "maghrib", "isha"] as const).map((p) => {
                                      const st = (sub as Record<string, unknown>)[p] as string;
                                      const bg = st === "jama" ? "bg-emerald-500 text-white" : st === "individual" ? "bg-amber-400 text-white" : "bg-red-400 text-white";
                                      const lbl = st === "jama" ? "J" : st === "individual" ? "I" : "✗";
                                      const name = { fajr: "Fajr", zuhr: "Zuhr", asr: "Asr", maghrib: "Mag", isha: "Isha" }[p];
                                      return (
                                        <div key={p} className={`rounded-lg py-2 text-center text-[10px] font-bold ${bg}`}>
                                          <div>{lbl}</div>
                                          <div className="opacity-70 mt-0.5">{name}</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Sunnah + Quran */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                                    <p className="text-gray-400 font-medium mb-1 flex items-center gap-1">
                                      <Star className="w-3 h-3 text-amber-400" /> Sunnah
                                    </p>
                                    {[
                                      { key: "tahajjud", label: "Tahajjud" },
                                      { key: "ishraq",   label: "Ishraq"   },
                                      { key: "duha",     label: "Duha"     },
                                      { key: "awwabin",  label: "Awwabin"  },
                                    ].map(({ key, label }) => {
                                      const v = (sub as Record<string, unknown>)[key] as string;
                                      return (
                                        <div key={key} className="flex justify-between py-0.5">
                                          <span className="text-gray-600">{label}</span>
                                          <span className={v === "yes" ? "text-emerald-600 font-bold" : v === "partial" ? "text-amber-600" : "text-gray-300"}>
                                            {v === "yes" ? "✓" : v === "partial" ? "~" : "—"}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                                    <p className="text-gray-400 font-medium mb-1 flex items-center gap-1">
                                      <BookOpen className="w-3 h-3 text-blue-500" /> Quran
                                    </p>
                                    {[
                                      { key: "tilawah",  label: "Tilawah"   },
                                      { key: "hifz",     label: "Hifz"      },
                                      { key: "tajweed",  label: "Tajweed"   },
                                      { key: "revision", label: "Muraja'ah" },
                                    ].map(({ key, label }) => {
                                      const v = (sub as Record<string, unknown>)[key] as string;
                                      return (
                                        <div key={key} className="flex justify-between py-0.5">
                                          <span className="text-gray-600">{label}</span>
                                          <span className={v === "yes" ? "text-blue-600 font-bold" : v === "partial" ? "text-amber-600" : "text-gray-300"}>
                                            {v === "yes" ? "✓" : v === "partial" ? "~" : "—"}
                                          </span>
                                        </div>
                                      );
                                    })}
                                    <div className="mt-1 pt-1 border-t border-gray-100 flex justify-between text-[10px]">
                                      <span className="text-gray-400">Pages: {String((sub as Record<string, unknown>).tilawahPages)}</span>
                                      <span className="text-gray-400">Lines: {String((sub as Record<string, unknown>).hifzLines)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Zikr */}
                                <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                                  <p className="text-[10px] text-gray-400 font-medium mb-1.5 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-purple-500" /> Zikr
                                  </p>
                                  <div className="flex gap-2 flex-wrap">
                                    {[
                                      { key: "subhanallah",   label: "SubhanAllah", target: 33  },
                                      { key: "alhamdulillah", label: "Alhamdulillah", target: 33  },
                                      { key: "allahuakbar",   label: "Allahu Akbar", target: 34  },
                                      { key: "istighfar",     label: "Istighfar", target: 100 },
                                      { key: "durood",        label: "Durood", target: 100 },
                                    ].map(({ key, label, target }) => {
                                      const level = (sub as Record<string, unknown>)[key] as number;
                                      const bg = level === 0 ? "bg-gray-100 text-gray-400" : level === 1 ? "bg-purple-100 text-purple-600" : level === 2 ? "bg-purple-400 text-white" : "bg-purple-600 text-white";
                                      const lbl = level === 0 ? "—" : level === 1 ? `~${Math.floor(target * 0.33)}` : level === 2 ? `~${Math.floor(target * 0.66)}` : `${target}+`;
                                      return (
                                        <div key={key} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${bg}`}>
                                          {label.split(" ")[0]}: {lbl}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Akhlaq */}
                                <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                                  <p className="text-[10px] text-gray-400 font-medium mb-1.5 flex items-center gap-1">
                                    <Heart className="w-3 h-3 text-rose-500" /> Akhlaq
                                  </p>
                                  <div className="flex gap-2 flex-wrap">
                                    {[
                                      { key: "punctual",   label: "Punctuality", icon: "⏰" },
                                      { key: "respectful", label: "Respectful",  icon: "🤝" },
                                      { key: "helpful",    label: "Helpful",     icon: "💚" },
                                      { key: "honest",     label: "Honest",      icon: "✨" },
                                    ].map(({ key, label, icon }) => {
                                      const v = (sub as Record<string, unknown>)[key] as string;
                                      const bg = v === "yes" ? "bg-emerald-500 text-white" : v === "partial" ? "bg-amber-400 text-white" : "bg-gray-200 text-gray-500";
                                      return (
                                        <div key={key} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${bg}`}>
                                          {icon} {label}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Parent Remarks */}
                                {sub.remarks && (
                                  <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
                                      <MessageSquare className="w-3 h-3" /> Parent Remarks
                                    </p>
                                    <p className="text-xs text-gray-600 italic">{sub.remarks}</p>
                                  </div>
                                )}

                                {/* Submitted at */}
                                <p className="text-[10px] text-gray-300 text-right">
                                  Submitted: {new Date(sub.submittedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
