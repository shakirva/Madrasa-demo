"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { attendanceRecords, students } from "@/mock-data";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const myChildren = students.filter((s) => ["S001", "S006"].includes(s.id));

export default function ParentAttendancePage() {
  const [activeChild, setActiveChild] = useState(myChildren[0].id);

  const child = myChildren.find((c) => c.id === activeChild)!;

  const records = attendanceRecords.map((day) => {
    const rec = day.records.find((r) => r.studentId === activeChild);
    return { date: day.date, status: rec?.status ?? "absent" };
  });

  const presentCount = records.filter((r) => r.status === "present").length;
  const percentage = Math.round((presentCount / records.length) * 100);

  return (
    <DashboardLayout>
      <PageHeader title="Attendance" subtitle={`${child.name}`} back />

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

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-4 text-center border border-gray-100">
          <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
          <p className="text-xs text-gray-500 mt-1">Present Days</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border border-gray-100">
          <p className="text-2xl font-bold text-red-500">{records.length - presentCount}</p>
          <p className="text-xs text-gray-500 mt-1">Absent Days</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border border-gray-100">
          <p className="text-2xl font-bold text-blue-600">{percentage}%</p>
          <p className="text-xs text-gray-500 mt-1">Attendance</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-gray-700">Overall Attendance</span>
          <span className="text-emerald-600 font-bold">{percentage}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-emerald-500"
          />
        </div>
      </div>

      {/* Day records */}
      <div className="space-y-3">
        {records.map((rec, i) => (
          <motion.div
            key={`${rec.date}-${i}`}
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-gray-800">{new Date(rec.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
              <p className="text-xs text-gray-400">{rec.date}</p>
            </div>
            <StatusBadge status={rec.status as "present" | "absent"} size="sm" />
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
