"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ibadahRecords, students } from "@/mock-data";
import { Moon, Save } from "lucide-react";
import { motion } from "framer-motion";

type PrayerStatus = "jama" | "individual" | "missed";

const prayers = ["fajr", "zuhr", "asr", "maghrib", "isha"] as const;
const prayerLabels: Record<string, string> = {
  fajr: "Fajr", zuhr: "Zuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha"
};

export default function TeacherIbadahPage() {
  const class4Students = students.filter((s) => s.class === "Class 4");
  const [records, setRecords] = useState(ibadahRecords);
  const [saved, setSaved] = useState(false);

  const getRecord = (studentId: string) => records.find((r) => r.studentId === studentId);

  const cyclePrayer = (studentId: string, prayer: string) => {
    const cycle: PrayerStatus[] = ["jama", "individual", "missed"];
    setRecords((prev) =>
      prev.map((r) => {
        if (r.studentId !== studentId) return r;
        const current = r[prayer as keyof typeof r] as PrayerStatus;
        const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
        return { ...r, [prayer]: next };
      })
    );
  };

  const prayerColor = (status: string) => {
    if (status === "jama") return "bg-emerald-500 text-white";
    if (status === "individual") return "bg-amber-400 text-white";
    return "bg-red-400 text-white";
  };

  const prayerLabel = (status: string) => {
    if (status === "jama") return "J";
    if (status === "individual") return "I";
    return "✗";
  };

  return (
    <DashboardLayout>
      <PageHeader title="Ibadah Tracking" subtitle="Class 4 · 14 March 2026" icon={Moon} back backHref="/teacher" />

      {/* Legend */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {[["bg-emerald-500", "Jama'a"], ["bg-amber-400", "Individual"], ["bg-red-400", "Missed"]].map(([bg, label]) => (
          <div key={label} className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-gray-100">
            <span className={`w-2.5 h-2.5 rounded-full ${bg}`} />
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mb-4 text-center">Tap prayer buttons to cycle: Jama&apos;a → Individual → Missed</p>

      {/* Student cards */}
      <div className="space-y-4">
        {class4Students.map((student, i) => {
          const record = getRecord(student.id);
          if (!record) return null;
          return (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4 border-b border-gray-50">
                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                  <p className="text-xs text-gray-400">{record.swalaathCount}/5 prayers</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Memorization</p>
                  <p className="text-sm font-bold text-emerald-700">{record.memorization}%</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  {prayers.map((prayer) => (
                    <button
                      key={prayer}
                      onClick={() => cyclePrayer(student.id, prayer)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${prayerColor(record[prayer] as string)}`}
                    >
                      <div className="text-center">
                        <div>{prayerLabel(record[prayer] as string)}</div>
                        <div className="text-[9px] opacity-80 mt-0.5">{prayerLabels[prayer]}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Behavior</span>
                      <span className="text-sm font-bold text-gray-900">{record.behavior}/5</span>
                    </div>
                  </div>
                  {record.remarks && (
                    <p className="text-xs text-gray-500 italic truncate max-w-32">{record.remarks}</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className={`w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-colors sticky bottom-20 lg:bottom-6 ${saved ? "bg-emerald-100 text-emerald-700" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100"}`}
      >
        <Save className="w-5 h-5" />
        {saved ? "✅ Ibadah Records Saved!" : "Save Ibadah Records"}
      </button>
    </DashboardLayout>
  );
}
