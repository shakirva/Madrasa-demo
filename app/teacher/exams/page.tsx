"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { exams, students } from "@/mock-data";
import { GraduationCap, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function TeacherExamsPage() {
  const [selectedExam, setSelectedExam] = useState(exams[0]);
  const [editMarks, setEditMarks] = useState(false);

  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name ?? id;

  const gradeColor = (g: string) => {
    if (g.startsWith("A")) return "text-emerald-700 bg-emerald-50";
    if (g.startsWith("B")) return "text-blue-700 bg-blue-50";
    return "text-amber-700 bg-amber-50";
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Exam Marks"
        subtitle="Upload & manage results"
        icon={GraduationCap}
        back backHref="/teacher"
        action={
          <button onClick={() => setEditMarks(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Marks
          </button>
        }
      />

      <div className="flex gap-3 mb-5 overflow-x-auto pb-2">
        {exams.map((exam) => (
          <button
            key={exam.id}
            onClick={() => setSelectedExam(exam)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${selectedExam.id === exam.id ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            {exam.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-5">
        <p className="font-bold text-gray-900">{selectedExam.name}</p>
        <p className="text-sm text-gray-500 mt-1">{selectedExam.date} · {selectedExam.totalMarks} marks · Subjects: {selectedExam.subjects.join(", ")}</p>
      </div>

      <div className="space-y-3">
        {selectedExam.results.sort((a, b) => a.rank - b.rank).map((result, i) => (
          <motion.div
            key={result.studentId}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-4 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>#{result.rank}</span>
                <p className="font-semibold text-gray-900 text-sm">{getStudentName(result.studentId)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${gradeColor(result.grade)}`}>{result.grade}</span>
                <span className="text-sm font-bold text-gray-900">{result.total}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result.marks).map(([subject, mark]) => (
                <div key={subject} className="bg-gray-50 rounded-xl p-2.5 flex items-center justify-between">
                  <p className="text-xs text-gray-500">{subject}</p>
                  <p className="text-sm font-bold text-gray-900">{mark as number}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {editMarks && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Enter Marks – {selectedExam.name}</h2>
            <div className="space-y-4">
              {students.filter((s) => s.class === "Class 4").map((student) => (
                <div key={student.id} className="bg-gray-50 rounded-2xl p-4">
                  <p className="font-semibold text-gray-900 text-sm mb-3">{student.name}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedExam.subjects.map((subject) => (
                      <div key={subject}>
                        <label className="block text-xs text-gray-500 mb-1">{subject}</label>
                        <input type="number" min="0" max={selectedExam.totalMarks} placeholder="0" className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-3">
                <button onClick={() => { setEditMarks(false); alert("✅ Marks saved! Results published to parents. (Demo)"); }} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">Save & Publish</button>
                <button onClick={() => setEditMarks(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
