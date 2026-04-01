"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader, SectionHeader } from "@/components/ui/PageHeader";
import { exams, students } from "@/mock-data";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Medal } from "lucide-react";
import { useLanguageStore } from "@/store/language";
import { t } from "@/lib/i18n";

const myChildren = students.filter((s) => ["S001", "S006"].includes(s.id));

function getGrade(mark: number, total: number) {
  const pct = (mark / total) * 100;
  if (pct >= 90) return { label: "A+", color: "text-emerald-700", bg: "bg-emerald-50" };
  if (pct >= 75) return { label: "A", color: "text-blue-700", bg: "bg-blue-50" };
  if (pct >= 60) return { label: "B", color: "text-indigo-700", bg: "bg-indigo-50" };
  if (pct >= 45) return { label: "C", color: "text-yellow-700", bg: "bg-yellow-50" };
  return { label: "F", color: "text-red-700", bg: "bg-red-50" };
}

export default function ParentResultsPage() {
  const { lang } = useLanguageStore();
  const [activeChild, setActiveChild] = useState(myChildren[0].id);
  const [activeExam, setActiveExam] = useState(exams[0].id);

  const child = myChildren.find((c) => c.id === activeChild)!;
  const exam = exams.find((e) => e.id === activeExam)!;
  const studentResult = exam.results.find((r) => r.studentId === activeChild);

  const totalMarks = studentResult
    ? Object.values(studentResult.marks).reduce((a, b) => a + (b as number), 0)
    : 0;
  const maxMarks = exam.subjects.length * exam.totalMarks;
  const overallPct = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;
  const overallGrade = getGrade(totalMarks, maxMarks);

  return (
    <DashboardLayout>
      <PageHeader title={t("parentPages", "resultsTitle", lang)} subtitle={t("parentPages", "reportCards", lang)} back />

      {/* Child selector */}
      <div className="flex gap-2 mb-5">
        {myChildren.map((c) => (
          <button key={c.id} onClick={() => setActiveChild(c.id)}
            className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
              activeChild === c.id ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-600")}
          >{c.name}</button>
        ))}
      </div>

      {/* Exam selector */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {exams.map((e) => (
          <button key={e.id} onClick={() => setActiveExam(e.id)}
            className={cn("px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0",
              activeExam === e.id ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600")}
          >{e.name}</button>
        ))}
      </div>

      {studentResult ? (
        <>
          {/* Overall card */}
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 mb-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-gray-900 text-lg">{child.name}</p>
                <p className="text-sm text-gray-500">{child.class} · {exam.name}</p>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex flex-col items-center justify-center", overallGrade.bg)}>
                <p className={cn("text-xl font-bold", overallGrade.color)}>{overallGrade.label}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xl font-bold text-gray-900">{totalMarks}</p>
                <p className="text-xs text-gray-500">{t("parentPages", "totalMarks", lang)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xl font-bold text-gray-900">{maxMarks}</p>
                <p className="text-xs text-gray-500">{t("parentPages", "outOf", lang)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xl font-bold text-emerald-700">{overallPct}%</p>
                <p className="text-xs text-gray-500">{t("parentPages", "percentage", lang)}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${overallPct}%` }} transition={{ duration: 0.8 }}
                  className={cn("h-full rounded-full", overallPct >= 75 ? "bg-emerald-500" : overallPct >= 50 ? "bg-yellow-400" : "bg-red-400")}
                />
              </div>
            </div>
          </motion.div>

          {/* Rank */}
          {studentResult.rank && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
              <Medal className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-800">{t("parentPages", "rank", lang)}: #{studentResult.rank}</p>
                <p className="text-xs text-amber-600">{t("parentPages", "outOfStudents", lang)} {exam.results.length} {t("parentPages", "outOfStudentsSuffix", lang)}</p>
              </div>
            </div>
          )}

          {/* Subject marks */}
          <SectionHeader title={t("parentPages", "subjectWise", lang)} className="mb-3" />
          <div className="space-y-3">
            {exam.subjects.map((subject, i) => {
              const mark = (studentResult.marks as Record<string, number>)[subject] ?? 0;
              const grade = getGrade(mark, exam.totalMarks);
              const pct = Math.round((mark / exam.totalMarks) * 100);
              return (
                <motion.div key={subject} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl p-4 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-800">{subject}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{mark}/{exam.totalMarks}</span>
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-lg", grade.bg, grade.color)}>{grade.label}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: i * 0.05 }}
                      className={cn("h-full rounded-full", pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-yellow-400" : "bg-red-400")}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-semibold">{t("parentPages", "noResult", lang)}</p>
          <p className="text-sm mt-1">{t("parentPages", "resultsAppearAfter", lang)}</p>
        </div>
      )}
    </DashboardLayout>
  );
}
