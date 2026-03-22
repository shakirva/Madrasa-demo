"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { homeworkList, students } from "@/mock-data";
import { cn } from "@/lib/utils";

// Get teacher's classes (hardcoded for demo, based on teachers[0])
const TEACHER_CLASSES = ["Class 4", "Class 3"];

export default function TeacherHomeworkListPage() {
  const [selectedClass, setSelectedClass] = useState(TEACHER_CLASSES[0]);

  // Get all homework for this class with pending statuses
  const homeworksForClass = homeworkList.filter((hw) => hw.class === selectedClass);

  // For each homework, collect students with pending/incomplete status
  const pendingHomeworks = homeworksForClass.map((hw) => {
    const pendingStudents = hw.studentStatuses
      .filter((s) => s.status === "red" || s.status === "yellow")
      .map((s) => ({
        ...s,
        studentName: students.find((st) => st.id === s.studentId)?.name || s.studentId,
      }));
    return {
      ...hw,
      pendingStudents,
    };
  }).filter((hw) => hw.pendingStudents.length > 0);

  return (
    <DashboardLayout>
      <PageHeader title="Homework Pending" subtitle="Track incomplete submissions" />

      {/* ── Class Selector ── */}
      <div className="flex gap-2 mb-4">
        {TEACHER_CLASSES.map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              selectedClass === cls
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300"
            )}
          >
            {cls}
          </button>
        ))}
      </div>

      {/* ── Homework List ── */}
      <div className="space-y-4">
        {pendingHomeworks.length === 0 ? (
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="text-sm text-gray-500">All homework submissions are complete in {selectedClass}!</div>
          </div>
        ) : (
          pendingHomeworks.map((hw) => (
            <div key={hw.id} className="bg-white rounded-2xl p-4 border border-gray-100">
              {/* Homework title */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900">{hw.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{hw.description}</p>
                </div>
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded-full",
                  hw.priority === "high" ? "bg-red-100 text-red-700" :
                  hw.priority === "medium" ? "bg-amber-100 text-amber-700" :
                  "bg-blue-100 text-blue-700"
                )}>
                  {hw.priority}
                </span>
              </div>

              {/* Pending students */}
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
                  Pending ({hw.pendingStudents.length})
                </p>
                {hw.pendingStudents.map((ps) => (
                  <div key={ps.studentId} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded flex items-center justify-center font-bold text-xs",
                        ps.status === "red" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {ps.studentName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ps.studentName}</div>
                        <div className="text-xs text-gray-500">
                          {ps.status === "red" ? "Not submitted" : "Needs review"}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold">
                      {ps.status === "red" ? (
                        <span className="text-red-600">✗</span>
                      ) : (
                        <span className="text-amber-600">⚠</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
