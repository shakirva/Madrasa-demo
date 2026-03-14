"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader, SectionHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { homeworkList, students } from "@/mock-data";
import { motion } from "framer-motion";
import { CheckCircle, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const myChildren = students.filter((s) => ["S001", "S006"].includes(s.id));

export default function ParentHomeworkPage() {
  const [activeChild, setActiveChild] = useState(myChildren[0].id);
  const [statuses, setStatuses] = useState<Record<string, Record<string, string>>>(() => {
    const init: Record<string, Record<string, string>> = {};
    myChildren.forEach((c) => {
      init[c.id] = {};
      homeworkList.forEach((hw) => {
        const ss = hw.studentStatuses.find((s) => s.studentId === c.id);
        init[c.id][hw.id] = ss?.status ?? "red";
      });
    });
    return init;
  });
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState<string | null>(null);

  const markDone = (hwId: string) => {
    if (statuses[activeChild][hwId] === "red") {
      setStatuses((prev) => ({ ...prev, [activeChild]: { ...prev[activeChild], [hwId]: "yellow" } }));
      setSaved(hwId);
      setTimeout(() => setSaved(null), 2000);
    }
  };

  const updateProgress = (hwId: string) => {
    const pct = progress[hwId] ?? 0;
    if (pct > 0) {
      setStatuses((prev) => ({ ...prev, [activeChild]: { ...prev[activeChild], [hwId]: "yellow" } }));
      setSaved(hwId);
      setTimeout(() => setSaved(null), 2000);
    }
  };

  const child = myChildren.find((c) => c.id === activeChild)!;
  const childStatuses = statuses[activeChild];

  return (
    <DashboardLayout>
      <PageHeader title="Homework" subtitle={child.name} back />

      {/* Child selector */}
      <div className="flex gap-2 mb-5">
        {myChildren.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveChild(c.id)}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
              activeChild === c.id ? "bg-emerald-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Pending (action needed)</span>
        <span className="flex items-center gap-1 text-xs text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />Awaiting teacher verify</span>
        <span className="flex items-center gap-1 text-xs text-gray-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Verified ✓</span>
      </div>

      <SectionHeader title="Homework List" className="mb-3" />
      <div className="space-y-4">
        {homeworkList.map((hw, i) => {
          const status = childStatuses[hw.id];
          const pct = progress[hw.id] ?? 0;
          return (
            <motion.div
              key={hw.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className={cn(
                "bg-white rounded-2xl p-4 border",
                status === "red" ? "border-red-200" : status === "yellow" ? "border-yellow-200" : "border-emerald-200"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{hw.title}</p>
                    <p className="text-xs text-gray-400">{hw.subject} · Due {hw.dueDate}</p>
                  </div>
                </div>
                <StatusBadge status={status as "red" | "yellow" | "green"} size="sm" />
              </div>

              <p className="text-sm text-gray-600 mb-3">{hw.description}</p>

              {hw.type === "daily" && status === "red" && (
                <button
                  onClick={() => markDone(hw.id)}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <CheckCircle className="w-4 h-4" />
                  {saved === hw.id ? "Marked! Teacher will verify ✓" : "Mark as Completed"}
                </button>
              )}

              {hw.type === "long" && status === "red" && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span className="font-bold text-emerald-700">{pct}%</span>
                    </div>
                    <input
                      type="range" min={0} max={100} value={pct}
                      onChange={(e) => setProgress((p) => ({ ...p, [hw.id]: Number(e.target.value) }))}
                      className="w-full accent-emerald-600"
                    />
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <button
                    onClick={() => updateProgress(hw.id)}
                    className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform"
                  >
                    {saved === hw.id ? "Sent to teacher ✓" : "Update Progress"}
                  </button>
                </div>
              )}

              {status === "yellow" && (
                <div className="flex items-center gap-2 bg-yellow-50 rounded-xl p-2.5">
                  <Clock className="w-4 h-4 text-yellow-600 shrink-0" />
                  <p className="text-xs text-yellow-700">Submitted — waiting for teacher to verify</p>
                </div>
              )}

              {status === "green" && (
                <div className="flex items-center gap-2 bg-emerald-50 rounded-xl p-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-700">Verified by teacher ✓</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
