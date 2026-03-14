"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { homeworkList, students } from "@/mock-data";
import { BookOpen, Plus, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function TeacherHomeworkPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [hwType, setHwType] = useState<"daily" | "long">("daily");

  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name?.split(" ")[0] ?? id;

  return (
    <DashboardLayout>
      <PageHeader
        title="Homework"
        subtitle="Assign and track"
        icon={BookOpen}
        back
        backHref="/teacher"
        action={
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
            <Plus className="w-4 h-4" /> Assign
          </button>
        }
      />

      {/* Color legend */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-gray-100">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-xs text-gray-600">Not done</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-gray-100">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-xs text-gray-600">Parent confirmed</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-gray-100">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-gray-600">Teacher verified</span>
        </div>
      </div>

      {/* Homework cards */}
      <div className="space-y-4">
        {homeworkList.map((hw, i) => (
          <motion.div
            key={hw.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${hw.type === "daily" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {hw.type === "daily" ? "Daily" : "Long Term"}
                    </span>
                    <span className="text-xs text-gray-500">{hw.subject}</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{hw.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Due: {hw.dueDate}</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Student Status</p>
              <div className="grid grid-cols-1 gap-2">
                {hw.studentStatuses.map((ss) => (
                  <div key={ss.studentId} className="flex items-center justify-between py-1">
                    <p className="text-sm text-gray-700">{getStudentName(ss.studentId)}</p>
                    <div className="flex items-center gap-2">
                      {hw.type === "long" && "progress" in ss && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${ss.progress}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{ss.progress}%</span>
                        </div>
                      )}
                      <StatusBadge status={ss.status as "green" | "yellow" | "red"} size="sm" />
                      {ss.status === "yellow" && (
                        <button
                          onClick={() => alert(`✅ Verified ${getStudentName(ss.studentId)}'s homework! (Demo)`)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Homework Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Assign Homework</h2>

            {/* Type selector */}
            <div className="flex gap-2 mb-4 bg-gray-100 rounded-xl p-1">
              <button onClick={() => setHwType("daily")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${hwType === "daily" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600"}`}>Daily</button>
              <button onClick={() => setHwType("long")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${hwType === "long" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600"}`}>Long Term</button>
            </div>

            <div className="space-y-4">
              {[
                { label: "Title", placeholder: "e.g. Memorize Surah Al-Fatiha" },
                { label: "Description", placeholder: "Add instructions..." },
              ].map(({ label, placeholder }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input placeholder={placeholder} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none text-sm">
                  <option>Quran</option><option>Arabic</option><option>Fiqh</option><option>Islamic Studies</option>
                </select>
              </div>
              {hwType === "long" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none text-sm" />
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setShowCreate(false); alert("✅ Homework assigned! Parents notified. (Demo)"); }} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">Assign</button>
                <button onClick={() => setShowCreate(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
