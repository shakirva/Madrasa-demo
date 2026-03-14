"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { students, attendanceRecords } from "@/mock-data";
import { ClipboardList, Check, X, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function TeacherAttendancePage() {
  const class4Students = students.filter((s) => s.class === "Class 4");
  const todayRecord = attendanceRecords[0];

  const [attendance, setAttendance] = useState<Record<string, "present" | "absent">>(
    Object.fromEntries(
      class4Students.map((s) => [
        s.id,
        (todayRecord?.records.find((r) => r.studentId === s.id)?.status as "present" | "absent") ?? "present",
      ])
    )
  );
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) => {
    setAttendance((prev) => ({ ...prev, [id]: prev[id] === "present" ? "absent" : "present" }));
  };

  const presentCount = Object.values(attendance).filter((v) => v === "present").length;
  const absentCount = Object.values(attendance).filter((v) => v === "absent").length;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Attendance"
        subtitle="Class 4 · 14 March 2026"
        icon={ClipboardList}
        back
        backHref="/teacher"
      />

      {/* Summary */}
      <div className="flex gap-4 mb-5">
        <div className="flex-1 bg-emerald-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{presentCount}</p>
          <p className="text-xs text-emerald-600 mt-1">Present</p>
        </div>
        <div className="flex-1 bg-red-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{absentCount}</p>
          <p className="text-xs text-red-500 mt-1">Absent</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{class4Students.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total</p>
        </div>
      </div>

      {/* Tap to toggle instruction */}
      <p className="text-xs text-gray-500 mb-3 text-center">Tap a student card to toggle presence</p>

      {/* Student list */}
      <div className="space-y-3 mb-6">
        {class4Students.map((student, i) => {
          const isPresent = attendance[student.id] === "present";
          return (
            <motion.button
              key={student.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => toggle(student.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-98 ${
                isPresent ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isPresent ? "bg-emerald-600 text-white" : "bg-red-500 text-white"}`}>
                  {student.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.admissionNumber}</p>
                </div>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPresent ? "bg-emerald-600" : "bg-red-500"}`}>
                {isPresent ? <Check className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-white" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-colors sticky bottom-20 lg:bottom-6 ${
          saved ? "bg-emerald-100 text-emerald-700" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100"
        }`}
      >
        <Save className="w-5 h-5" />
        {saved ? "✅ Attendance Saved! Parents notified." : "Save Attendance"}
      </button>

      {/* History */}
      <div className="mt-8">
        <p className="text-sm font-semibold text-gray-700 mb-3">Recent Records</p>
        {attendanceRecords.map((rec) => (
          <div key={rec.date} className="bg-white rounded-2xl p-4 border border-gray-100 mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">{rec.date}</p>
              <div className="flex gap-2">
                <StatusBadge status="present" label={`${rec.records.filter((r) => r.status === "present").length} P`} size="sm" />
                <StatusBadge status="absent" label={`${rec.records.filter((r) => r.status === "absent").length} A`} size="sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
