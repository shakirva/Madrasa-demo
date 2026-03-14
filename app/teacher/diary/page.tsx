"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { diaryEntries } from "@/mock-data";
import { FileText, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function TeacherDiaryPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [diaryType, setDiaryType] = useState<"class" | "student">("class");

  return (
    <DashboardLayout>
      <PageHeader
        title="Daily Diary"
        subtitle="Class notes & student remarks"
        icon={FileText}
        back
        backHref="/teacher"
        action={
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
            <Plus className="w-4 h-4" /> Write
          </button>
        }
      />

      <div className="space-y-4">
        {diaryEntries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-5 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${entry.type === "class" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                  {entry.type === "class" ? "📚 Class Note" : "👤 Student Note"}
                </span>
              </div>
              <span className="text-xs text-gray-400">{entry.date}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{entry.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{entry.content}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">📨 Sent to parents</span>
              <span className="text-xs text-gray-400">{entry.class}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Diary Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Write Diary Entry</h2>

            <div className="flex gap-2 mb-4 bg-gray-100 rounded-xl p-1">
              <button onClick={() => setDiaryType("class")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${diaryType === "class" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600"}`}>Class Note</button>
              <button onClick={() => setDiaryType("student")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${diaryType === "student" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600"}`}>Student Note</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input placeholder="e.g. Today's lesson summary" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
              </div>
              {diaryType === "student" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none text-sm">
                    <option>Ahmed Bin Abdullah</option>
                    <option>Ibrahim Khaleel</option>
                    <option>Yusuf Salim</option>
                    <option>Fatima Zahra</option>
                    <option>Aisha Siddiqui</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  placeholder="Write your note here... Parents will receive this via notification."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowCreate(false); alert("✅ Diary entry saved! Parents notified. (Demo)"); }} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                  Save & Notify
                </button>
                <button onClick={() => setShowCreate(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
