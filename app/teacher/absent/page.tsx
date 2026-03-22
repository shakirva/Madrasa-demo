"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { attendanceRecords, students } from "@/mock-data";
import { cn } from "@/lib/utils";

// Get teacher's classes (hardcoded for demo, based on teachers[0])
const TEACHER_CLASSES = ["Class 4", "Class 3"];

function getStudentsInClass(classId: string) {
  return students.filter((s) => s.class === classId);
}

export default function TeacherAbsentPage() {
  const [selectedClass, setSelectedClass] = useState(TEACHER_CLASSES[0]);

  // Get the latest attendance record (today's)
  const latestRecord = attendanceRecords[0];
  
  // Filter records for selected class
  const classStudents = getStudentsInClass(selectedClass);
  const absentStudentIds = latestRecord?.records
    .filter((r) => r.status === "absent")
    .map((r) => r.studentId) ?? [];
  
  const absentStudents = classStudents.filter((s) => absentStudentIds.includes(s.id));

  return (
    <DashboardLayout>
      <PageHeader title="Absent Today" subtitle={latestRecord?.date || "Latest"} />

      {/* ── Class Selector ── */}
      <div className="flex gap-2 mb-4">
        {TEACHER_CLASSES.map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              selectedClass === cls
                ? "bg-red-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:border-red-300"
            )}
          >
            {cls}
          </button>
        ))}
      </div>

      {/* ── Absent List ── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 mt-4">
        <p className="text-xs text-gray-500 mb-3">Total Absent: {absentStudents.length}</p>
        {absentStudents.length === 0 ? (
          <div className="text-sm text-gray-500">No students absent in {selectedClass}.</div>
        ) : (
          <div className="space-y-2">
            {absentStudents.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm",
                    s.gender === "female" ? "bg-pink-100 text-pink-700" : "bg-red-100 text-red-700"
                  )}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.admissionNumber}</div>
                  </div>
                </div>
                <div className="text-xs text-red-600 font-semibold">✗ Absent</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
