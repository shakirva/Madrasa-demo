"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { exams, students } from "@/mock-data";
import { GraduationCap, Plus } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AdminExamsPage() {
  const [selectedExam, setSelectedExam] = useState(exams[0]);
  const [showCreate, setShowCreate] = useState(false);

  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name ?? id;

  const gradeColor = (g: string) => {
    if (g.startsWith("A")) return "text-emerald-700 bg-emerald-50";
    if (g.startsWith("B")) return "text-blue-700 bg-blue-50";
    return "text-amber-700 bg-amber-50";
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Exams & Results"
        subtitle="Manage and publish results"
        icon={GraduationCap}
        action={
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
            <Plus className="w-4 h-4" /> Create Exam
          </button>
        }
      />

      {/* Exam selector */}
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

      {/* Exam info */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-gray-900">{selectedExam.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{selectedExam.class} · {selectedExam.date} · {selectedExam.totalMarks} marks</p>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium capitalize">{selectedExam.type.replace("_", " ")}</span>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {selectedExam.subjects.map((s) => (
            <span key={s} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{s}</span>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {selectedExam.results
          .sort((a, b) => a.rank - b.rank)
          .map((result, i) => (
            <motion.div
              key={result.studentId}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                    #{result.rank}
                  </span>
                  <p className="font-semibold text-gray-900 text-sm">{getStudentName(result.studentId)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${gradeColor(result.grade)}`}>{result.grade}</span>
                  <span className="text-sm font-bold text-gray-900">{result.total}/{selectedExam.subjects.length * selectedExam.totalMarks}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {Object.entries(result.marks).map(([subject, mark]) => (
                  <div key={subject} className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-gray-500 truncate">{subject}</p>
                    <p className="text-base font-bold text-gray-900">{mark as number}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
      </div>

      {/* Create Exam Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Create New Exam</h2>
            <div className="space-y-4">
              {[
                { label: "Exam Name", placeholder: "e.g. Second Semester Exam" },
                { label: "Exam Date", type: "date" },
                { label: "Total Marks", placeholder: "100", type: "number" },
              ].map(({ label, placeholder, type }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type ?? "text"} placeholder={placeholder} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none text-sm">
                  <option value="semester">Semester Exam</option>
                  <option value="class_test">Class Test</option>
                  <option value="dictation">Dictation</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowCreate(false); alert("✅ Exam created! (Demo)"); }} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">Create</button>
                <button onClick={() => setShowCreate(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
