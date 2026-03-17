"use client";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { students, studentIbadahSubmissions } from "@/mock-data";
import {
  Moon, Save, CheckCircle2, Star, BookOpen, Heart, Sparkles,
  ChevronDown, ChevronUp, Calendar, TrendingUp, MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────
type PrayerStatus = "jama" | "individual" | "missed";
type TriStatus    = "yes" | "partial" | "no";
type ZikrLevel    = 0 | 1 | 2 | 3;
type Section      = "prayers" | "sunnah" | "quran" | "zikr" | "akhlaq";

// ── Config ───────────────────────────────────────────────────
const FARD_PRAYERS = ["fajr", "zuhr", "asr", "maghrib", "isha"] as const;
const FARD_LABELS: Record<string, string> = {
  fajr: "Fajr", zuhr: "Zuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha",
};

const SUNNAH_PRAYERS = [
  { key: "tahajjud", label: "Tahajjud", arabic: "تهجد",   time: "Pre-Fajr" },
  { key: "ishraq",   label: "Ishraq",   arabic: "اشراق",  time: "Post-Fajr" },
  { key: "duha",     label: "Duha",     arabic: "ضحى",    time: "Morning"  },
  { key: "awwabin",  label: "Awwabin",  arabic: "أوابين", time: "Post-Maghrib" },
];

const QURAN_ACTIVITIES = [
  { key: "tilawah",  label: "Tilawah",   arabic: "تلاوة",  desc: "Recitation"   },
  { key: "hifz",     label: "Hifz",      arabic: "حفظ",    desc: "Memorization" },
  { key: "tajweed",  label: "Tajweed",   arabic: "تجويد",  desc: "Practice"     },
  { key: "revision", label: "Muraja'ah", arabic: "مراجعة", desc: "Revision"     },
];

const ZIKR_TYPES = [
  { key: "subhanallah",   label: "SubhanAllah",   arabic: "سبحان الله",  target: 33  },
  { key: "alhamdulillah", label: "Alhamdulillah", arabic: "الحمد لله",   target: 33  },
  { key: "allahuakbar",   label: "Allahu Akbar",  arabic: "الله أكبر",   target: 34  },
  { key: "istighfar",     label: "Istighfar",     arabic: "استغفر الله", target: 100 },
  { key: "durood",        label: "Durood",        arabic: "صلى الله",    target: 100 },
];

const AKHLAQ_ITEMS = [
  { key: "punctual",   label: "Punctuality", icon: "⏰" },
  { key: "respectful", label: "Respectful",  icon: "🤝" },
  { key: "helpful",    label: "Helpful",     icon: "💚" },
  { key: "honest",     label: "Honest",      icon: "✨" },
];

const SECTIONS: { key: Section; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { key: "prayers", label: "Fard Prayers", icon: Moon,     color: "text-emerald-600" },
  { key: "sunnah",  label: "Sunnah",       icon: Star,     color: "text-amber-500"   },
  { key: "quran",   label: "Quran",        icon: BookOpen, color: "text-blue-600"    },
  { key: "zikr",    label: "Zikr",         icon: Sparkles, color: "text-purple-600"  },
  { key: "akhlaq",  label: "Akhlaq",       icon: Heart,    color: "text-rose-500"    },
];

// ── Helpers ──────────────────────────────────────────────────
const prayerCycle: PrayerStatus[] = ["jama", "individual", "missed"];
const triCycle:    TriStatus[]     = ["yes", "partial", "no"];

const prayerColor = (s: PrayerStatus) =>
  s === "jama" ? "bg-emerald-500 text-white" : s === "individual" ? "bg-amber-400 text-white" : "bg-red-400 text-white";
const prayerShort = (s: PrayerStatus) =>
  s === "jama" ? "J" : s === "individual" ? "I" : "✗";

const triColor = (s: TriStatus) =>
  s === "yes" ? "bg-emerald-500 text-white" : s === "partial" ? "bg-amber-400 text-white" : "bg-gray-200 text-gray-500";
const triLabel = (s: TriStatus) =>
  s === "yes" ? "✓" : s === "partial" ? "~" : "—";

const zikrColor = (l: ZikrLevel) =>
  l === 0 ? "bg-gray-100 text-gray-400" : l === 1 ? "bg-purple-100 text-purple-600" : l === 2 ? "bg-purple-400 text-white" : "bg-purple-600 text-white";
const zikrLabel = (l: ZikrLevel, t: number) =>
  l === 0 ? "—" : l === 1 ? `~${Math.floor(t * 0.33)}` : l === 2 ? `~${Math.floor(t * 0.66)}` : `${t}+`;

// ── Types for records ─────────────────────────────────────────
interface TodayRecord {
  fajr: PrayerStatus; zuhr: PrayerStatus; asr: PrayerStatus; maghrib: PrayerStatus; isha: PrayerStatus;
  tahajjud: TriStatus; ishraq: TriStatus; duha: TriStatus; awwabin: TriStatus;
  tilawah: TriStatus; hifz: TriStatus; tajweed: TriStatus; revision: TriStatus;
  tilawahPages: number; hifzLines: number;
  subhanallah: ZikrLevel; alhamdulillah: ZikrLevel; allahuakbar: ZikrLevel;
  istighfar: ZikrLevel; durood: ZikrLevel;
  punctual: TriStatus; respectful: TriStatus; helpful: TriStatus; honest: TriStatus;
  remarks: string;
}

const defaultRecord = (): TodayRecord => ({
  fajr: "missed", zuhr: "missed", asr: "missed", maghrib: "missed", isha: "missed",
  tahajjud: "no", ishraq: "no", duha: "no", awwabin: "no",
  tilawah: "no", hifz: "no", tajweed: "no", revision: "no",
  tilawahPages: 0, hifzLines: 0,
  subhanallah: 0, alhamdulillah: 0, allahuakbar: 0, istighfar: 0, durood: 0,
  punctual: "no", respectful: "no", helpful: "no", honest: "no",
  remarks: "",
});

// P001 has children S001 and S006
const MY_CHILDREN_IDS = ["S001", "S006"];
const TODAY = new Date().toISOString().split("T")[0]; // "2026-03-17"

export default function ParentIbadahPage() {
  const myChildren = students.filter((s) => MY_CHILDREN_IDS.includes(s.id));
  const [activeChild, setActiveChild] = useState(myChildren[0].id);
  const [activeSection, setActiveSection] = useState<Section>("prayers");
  const [showHistory, setShowHistory] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [todayRecord, setTodayRecord] = useState<Record<string, TodayRecord>>(() => {
    const init: Record<string, TodayRecord> = {};
    MY_CHILDREN_IDS.forEach((id) => {
      // Pre-fill from existing submission for today if exists
      const existing = studentIbadahSubmissions.find((s) => s.studentId === id && s.date === TODAY);
      if (existing) {
        init[id] = {
          fajr: existing.fajr as PrayerStatus,
          zuhr: existing.zuhr as PrayerStatus,
          asr: existing.asr as PrayerStatus,
          maghrib: existing.maghrib as PrayerStatus,
          isha: existing.isha as PrayerStatus,
          tahajjud: existing.tahajjud as TriStatus,
          ishraq: existing.ishraq as TriStatus,
          duha: existing.duha as TriStatus,
          awwabin: existing.awwabin as TriStatus,
          tilawah: existing.tilawah as TriStatus,
          hifz: existing.hifz as TriStatus,
          tajweed: existing.tajweed as TriStatus,
          revision: existing.revision as TriStatus,
          tilawahPages: existing.tilawahPages,
          hifzLines: existing.hifzLines,
          subhanallah: existing.subhanallah as ZikrLevel,
          alhamdulillah: existing.alhamdulillah as ZikrLevel,
          allahuakbar: existing.allahuakbar as ZikrLevel,
          istighfar: existing.istighfar as ZikrLevel,
          durood: existing.durood as ZikrLevel,
          punctual: existing.punctual as TriStatus,
          respectful: existing.respectful as TriStatus,
          helpful: existing.helpful as TriStatus,
          honest: existing.honest as TriStatus,
          remarks: existing.remarks,
        };
      } else {
        init[id] = defaultRecord();
      }
    });
    return init;
  });
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState(false);

  const rec = todayRecord[activeChild];
  const child = myChildren.find((c) => c.id === activeChild)!;

  // Past history for active child (excluding today)
  const pastRecords = useMemo(
    () =>
      studentIbadahSubmissions
        .filter((s) => s.studentId === activeChild && s.date !== TODAY)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [activeChild]
  );

  const update = <K extends keyof TodayRecord>(key: K, value: TodayRecord[K]) =>
    setTodayRecord((prev) => ({ ...prev, [activeChild]: { ...prev[activeChild], [key]: value } }));

  const cyclePrayer = (prayer: keyof TodayRecord) => {
    const cur = rec[prayer] as PrayerStatus;
    update(prayer, prayerCycle[(prayerCycle.indexOf(cur) + 1) % prayerCycle.length]);
  };
  const cycleTri = (key: keyof TodayRecord) => {
    const cur = rec[key] as TriStatus;
    update(key, triCycle[(triCycle.indexOf(cur) + 1) % triCycle.length]);
  };
  const cycleZikr = (key: keyof TodayRecord) => {
    const cur = rec[key] as ZikrLevel;
    update(key, ((cur + 1) % 4) as ZikrLevel);
  };

  const handleSave = () => {
    setSaved((prev) => ({ ...prev, [activeChild]: true }));
    setShowToast(true);
    setTimeout(() => {
      setSaved((prev) => ({ ...prev, [activeChild]: false }));
      setShowToast(false);
    }, 3000);
  };

  // Score for today's record
  const scoreToday = useMemo(() => {
    const fard  = FARD_PRAYERS.filter((p) => rec[p] === "jama").length * 2 + FARD_PRAYERS.filter((p) => rec[p] === "individual").length;
    const sunnah = SUNNAH_PRAYERS.filter(({ key }) => (rec[key as keyof TodayRecord] as TriStatus) === "yes").length;
    const quran  = QURAN_ACTIVITIES.filter(({ key }) => (rec[key as keyof TodayRecord] as TriStatus) === "yes").length;
    const zikr   = ZIKR_TYPES.filter(({ key }) => (rec[key as keyof TodayRecord] as ZikrLevel) === 3).length;
    const akhlaq = AKHLAQ_ITEMS.filter(({ key }) => (rec[key as keyof TodayRecord] as TriStatus) === "yes").length;
    return fard + sunnah + quran + zikr + akhlaq;
  }, [rec]);

  const fardMissedToday = FARD_PRAYERS.filter((p) => rec[p] === "missed").length;

  return (
    <DashboardLayout>
      <PageHeader
        title="Ibadah Checklist"
        subtitle={`Today · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
        icon={Moon}
        back
        backHref="/parent"
      />

      {/* ── Toast ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4" /> Ibadah record submitted to teacher!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Child selector ────────────────────────────────────── */}
      <div className="flex gap-2 mb-5">
        {myChildren.map((c) => (
          <button
            key={c.id}
            onClick={() => { setActiveChild(c.id); setShowHistory(false); }}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
              activeChild === c.id ? "bg-emerald-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600"
            )}
          >
            {c.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* ── Today summary bar ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-base shrink-0">
          {child.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{child.name}</p>
          <p className="text-xs text-gray-400">{child.class} · {child.division}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-700">{scoreToday} pts</span>
          </div>
          {fardMissedToday > 0 && (
            <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
              <AlertTriangle className="w-2.5 h-2.5" />{fardMissedToday} missed
            </span>
          )}
          {fardMissedToday === 0 && scoreToday > 0 && (
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">All Fard ✓</span>
          )}
        </div>
      </div>

      {/* ── Toggle: Today / History ───────────────────────────── */}
      <div className="flex gap-1.5 mb-5 bg-white border border-gray-100 rounded-xl p-1">
        <button
          onClick={() => setShowHistory(false)}
          className={cn("flex-1 py-2 rounded-lg text-sm font-semibold transition-colors", !showHistory ? "bg-emerald-600 text-white" : "text-gray-500")}
        >
          Today&apos;s Checklist
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className={cn("flex-1 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5", showHistory ? "bg-emerald-600 text-white" : "text-gray-500")}
        >
          <Calendar className="w-3.5 h-3.5" /> History
        </button>
      </div>

      {/* ══════════════ TODAY'S CHECKLIST ═══════════════════════ */}
      {!showHistory && (
        <>
          {/* Section tabs */}
          <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-none">
            {SECTIONS.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all shrink-0 ${
                  activeSection === key ? "bg-white shadow-sm border-gray-200 text-gray-900" : "bg-gray-100 border-transparent text-gray-500"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${activeSection === key ? color : "text-gray-400"}`} />
                {label}
              </button>
            ))}
          </div>

          {/* Legend */}
          {activeSection === "prayers" && (
            <div className="flex gap-3 mb-4 flex-wrap">
              {[["bg-emerald-500", "Jama'a"], ["bg-amber-400", "Individual"], ["bg-red-400", "Missed"]].map(([bg, lbl]) => (
                <div key={lbl} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-gray-100">
                  <span className={`w-2 h-2 rounded-full ${bg}`} />
                  <span className="text-xs text-gray-600">{lbl}</span>
                </div>
              ))}
              <span className="text-xs text-gray-400 self-center ml-auto hidden sm:block">Tap to cycle</span>
            </div>
          )}
          {(activeSection === "sunnah" || activeSection === "quran" || activeSection === "akhlaq") && (
            <div className="flex gap-3 mb-4 flex-wrap">
              {[["bg-emerald-500", "Done"], ["bg-amber-400", "Partial"], ["bg-gray-200", "Not Done"]].map(([bg, lbl]) => (
                <div key={lbl} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-gray-100">
                  <span className={`w-2 h-2 rounded-full ${bg}`} />
                  <span className="text-xs text-gray-600">{lbl}</span>
                </div>
              ))}
            </div>
          )}
          {activeSection === "zikr" && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {[["bg-gray-100 text-gray-700", "None"], ["bg-purple-100 text-purple-700", "~⅓"], ["bg-purple-400 text-white", "~⅔"], ["bg-purple-600 text-white", "Full"]].map(([cls, lbl]) => (
                <div key={lbl} className={`flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-100 ${cls}`}>
                  <span className="text-xs font-medium">{lbl}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── FARD PRAYERS ──────────────────────────────── */}
          {activeSection === "prayers" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">5 Daily Prayers</p>
              <div className="flex gap-2">
                {FARD_PRAYERS.map((p) => (
                  <button
                    key={p}
                    onClick={() => cyclePrayer(p)}
                    className={`flex-1 py-4 rounded-xl text-xs font-bold transition-all active:scale-95 ${prayerColor(rec[p])}`}
                  >
                    <div className="text-lg font-bold">{prayerShort(rec[p])}</div>
                    <div className="text-[9px] opacity-80 mt-0.5">{FARD_LABELS[p]}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── SUNNAH PRAYERS ────────────────────────────── */}
          {activeSection === "sunnah" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Voluntary Prayers</p>
              <div className="grid grid-cols-2 gap-2">
                {SUNNAH_PRAYERS.map(({ key, label, arabic, time }) => {
                  const val = rec[key as keyof TodayRecord] as TriStatus;
                  return (
                    <button
                      key={key}
                      onClick={() => cycleTri(key as keyof TodayRecord)}
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
            </div>
          )}

          {/* ── QURAN ─────────────────────────────────────── */}
          {activeSection === "quran" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Quran Activities</p>
              <div className="grid grid-cols-2 gap-2">
                {QURAN_ACTIVITIES.map(({ key, label, arabic, desc }) => {
                  const val = rec[key as keyof TodayRecord] as TriStatus;
                  return (
                    <button
                      key={key}
                      onClick={() => cycleTri(key as keyof TodayRecord)}
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
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-[10px] text-blue-500 font-semibold mb-1">Tilawah Pages</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => update("tilawahPages", Math.max(0, rec.tilawahPages - 1))}
                      className="w-6 h-6 rounded-lg bg-blue-200 text-blue-700 font-bold text-sm flex items-center justify-center">−</button>
                    <span className="text-lg font-bold text-blue-700 flex-1 text-center">{rec.tilawahPages}</span>
                    <button onClick={() => update("tilawahPages", rec.tilawahPages + 1)}
                      className="w-6 h-6 rounded-lg bg-blue-500 text-white font-bold text-sm flex items-center justify-center">+</button>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-[10px] text-emerald-600 font-semibold mb-1">Hifz Lines</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => update("hifzLines", Math.max(0, rec.hifzLines - 1))}
                      className="w-6 h-6 rounded-lg bg-emerald-200 text-emerald-700 font-bold text-sm flex items-center justify-center">−</button>
                    <span className="text-lg font-bold text-emerald-700 flex-1 text-center">{rec.hifzLines}</span>
                    <button onClick={() => update("hifzLines", rec.hifzLines + 1)}
                      className="w-6 h-6 rounded-lg bg-emerald-500 text-white font-bold text-sm flex items-center justify-center">+</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ZIKR ──────────────────────────────────────── */}
          {activeSection === "zikr" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Dhikr & Adhkar</p>
              {ZIKR_TYPES.map(({ key, label, arabic, target }) => {
                const level = rec[key as keyof TodayRecord] as ZikrLevel;
                return (
                  <button
                    key={key}
                    onClick={() => cycleZikr(key as keyof TodayRecord)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-purple-50 hover:border-purple-100 transition-all active:scale-95"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${zikrColor(level)}`}>
                      {zikrLabel(level, target)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-bold text-gray-800">{label}</p>
                      <p className="text-[10px] text-gray-400">{arabic} · target {target}×</p>
                    </div>
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

          {/* ── AKHLAQ ────────────────────────────────────── */}
          {activeSection === "akhlaq" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Character & Conduct</p>
              <div className="grid grid-cols-2 gap-2">
                {AKHLAQ_ITEMS.map(({ key, label, icon }) => {
                  const val = rec[key as keyof TodayRecord] as TriStatus;
                  return (
                    <button
                      key={key}
                      onClick={() => cycleTri(key as keyof TodayRecord)}
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
            </div>
          )}

          {/* ── Remarks ───────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Parent Remarks
            </p>
            <textarea
              value={rec.remarks}
              onChange={(e) => update("remarks", e.target.value)}
              rows={2}
              placeholder="Add any notes about your child's ibadah today…"
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-gray-700 placeholder:text-gray-300"
            />
          </div>

          {/* ── Submit button ──────────────────────────────── */}
          <div className="sticky bottom-20 lg:bottom-6 px-0 mt-2 pb-4">
            <button
              onClick={handleSave}
              className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm transition-all active:scale-98 shadow-lg ${
                saved[activeChild]
                  ? "bg-emerald-100 text-emerald-700 shadow-emerald-100"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
              }`}
            >
              {saved[activeChild] ? (
                <><CheckCircle2 className="w-5 h-5" /> Submitted to Teacher!</>
              ) : (
                <><Save className="w-5 h-5" /> Submit Ibadah to Teacher</>
              )}
            </button>
          </div>
        </>
      )}

      {/* ══════════════ HISTORY ═════════════════════════════════ */}
      {showHistory && (
        <div className="space-y-3 pb-24">
          {pastRecords.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <Moon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No past records found.</p>
            </div>
          )}
          {pastRecords.map((r, i) => {
            const fardMissed = FARD_PRAYERS.filter((p) => (r as Record<string, unknown>)[p] === "missed").length;
            const allFard = fardMissed === 0;
            const isExpanded = expandedHistoryId === r.id;
            const dateLabel = new Date(r.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                {/* Header */}
                <div
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
                  onClick={() => setExpandedHistoryId(isExpanded ? null : r.id)}
                >
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <Moon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{dateLabel}</p>
                    <p className="text-xs text-gray-400">
                      {allFard ? "All Fard ✓" : `${fardMissed} prayers missed`}
                      {r.remarks ? " · Has remarks" : ""}
                    </p>
                  </div>
                  {/* Prayer pills */}
                  <div className="hidden sm:flex gap-1 shrink-0">
                    {FARD_PRAYERS.map((p) => (
                      <span
                        key={p}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold ${prayerColor((r as Record<string, unknown>)[p] as PrayerStatus)}`}
                      >
                        {prayerShort((r as Record<string, unknown>)[p] as PrayerStatus)}
                      </span>
                    ))}
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-50 bg-gray-50/60 px-4 py-3 space-y-3">
                        {/* Fard prayers */}
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Fard Prayers</p>
                          <div className="grid grid-cols-5 gap-1.5">
                            {FARD_PRAYERS.map((p) => (
                              <div key={p} className={`rounded-lg py-2 text-center text-[10px] font-bold ${prayerColor((r as Record<string, unknown>)[p] as PrayerStatus)}`}>
                                <div>{prayerShort((r as Record<string, unknown>)[p] as PrayerStatus)}</div>
                                <div className="opacity-70 mt-0.5">{FARD_LABELS[p]}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Sunnah + Quran */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                            <p className="text-gray-400 font-medium mb-1 flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400" /> Sunnah
                            </p>
                            {SUNNAH_PRAYERS.map(({ key, label }) => {
                              const v = (r as Record<string, unknown>)[key] as TriStatus;
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
                            {QURAN_ACTIVITIES.map(({ key, label }) => {
                              const v = (r as Record<string, unknown>)[key] as TriStatus;
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
                              <span className="text-gray-400">Pages: {(r as Record<string, unknown>).tilawahPages as number}</span>
                              <span className="text-gray-400">Lines: {(r as Record<string, unknown>).hifzLines as number}</span>
                            </div>
                          </div>
                        </div>

                        {/* Zikr */}
                        <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                          <p className="text-[10px] text-gray-400 font-medium mb-1.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-500" /> Zikr
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {ZIKR_TYPES.map(({ key, label, target }) => {
                              const v = (r as Record<string, unknown>)[key] as ZikrLevel;
                              return (
                                <div key={key} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${zikrColor(v)}`}>
                                  {label.split(" ")[0]}: {zikrLabel(v, target)}
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
                            {AKHLAQ_ITEMS.map(({ key, label, icon }) => {
                              const v = (r as Record<string, unknown>)[key] as TriStatus;
                              return (
                                <div key={key} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${triColor(v)}`}>
                                  {icon} {label}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Remarks */}
                        {r.remarks && (
                          <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" /> Remarks
                            </p>
                            <p className="text-xs text-gray-600 italic">{r.remarks}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
