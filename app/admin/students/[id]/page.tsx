"use client";
import { use } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader, SectionHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  students, attendanceRecords, feesRecords, exams, homeworkList,
} from "@/mock-data";
import { motion } from "framer-motion";
import {
  User, Phone, MapPin, Calendar,
  Award, Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const classColors: Record<string, { bg: string; text: string }> = {
  "Class 2": { bg: "bg-sky-100",     text: "text-sky-700"     },
  "Class 3": { bg: "bg-purple-100",  text: "text-purple-700"  },
  "Class 4": { bg: "bg-emerald-100", text: "text-emerald-700" },
};
const fallback = { bg: "bg-gray-100", text: "text-gray-700" };

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const student = students.find((s) => s.id === id);
  if (!student) {
    return (
      <DashboardLayout>
        <PageHeader title="Student Not Found" back />
        <div className="text-center py-20 text-gray-400">
          <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-lg">Student not found</p>
          <button onClick={() => router.back()} className="mt-4 text-emerald-600 font-semibold text-sm underline">
            Go back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const col = classColors[student.class] ?? fallback;

  // ── Attendance ──
  const presentDays = attendanceRecords.filter((day) =>
    day.records.find((r) => r.studentId === id && r.status === "present")
  ).length;
  const totalDays = attendanceRecords.length;
  const attPct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // ── Fees ──
  const myFees = feesRecords.filter((f) => f.studentId === id);
  const paidCount = myFees.filter((f) => f.status === "paid").length;
  const pendingCount = myFees.filter((f) => f.status !== "paid").length;
  const paidAmount = myFees.filter((f) => f.status === "paid").reduce((a, b) => a + b.amount, 0);

  // ── Exam results ──
  const examResults = exams.map((exam) => {
    const res = exam.results.find((r) => r.studentId === id);
    if (!res) return null;
    const total = Object.values(res.marks).reduce((a, b) => a + (b as number), 0);
    const max   = exam.subjects.length * exam.totalMarks;
    const pct   = max > 0 ? Math.round((total / max) * 100) : 0;
    return { examName: exam.name, total, max, pct, rank: res.rank };
  }).filter(Boolean) as { examName: string; total: number; max: number; pct: number; rank: number }[];

  // ── Homework ──
  const hwStatuses = homeworkList.map((hw) => {
    const ss = hw.studentStatuses.find((s) => s.studentId === id);
    return { title: hw.title, subject: hw.subject, status: ss?.status ?? "red" };
  });
  const hwGreen = hwStatuses.filter((h) => h.status === "green").length;

  return (
    <DashboardLayout>
      <PageHeader title="Student Profile" back />

      {/* ── Profile card ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-5 border border-gray-100 mb-5"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0",
            student.gender === "female" ? "bg-pink-100 text-pink-700" : col.bg + " " + col.text
          )}>
            {student.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{student.name}</h2>
            <p className="text-sm text-gray-500">{student.admissionNumber}</p>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-lg", col.bg, col.text)}>
                {student.class}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">
                Division {student.division}
              </span>
              <span className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-lg",
                student.gender === "female" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
              )}>
                {student.gender === "female" ? "♀ Girl" : "♂ Boy"}
              </span>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Calendar,      label: "Date of Birth",  value: new Date(student.dateOfBirth).toLocaleDateString("en-GB") },
            { icon: Hash,          label: "Joined",          value: new Date(student.joiningDate).toLocaleDateString("en-GB") },
            { icon: MapPin,        label: "Address",         value: student.address },
            { icon: Phone,         label: "Phone",           value: student.phone },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 flex gap-2.5 items-start">
              <Icon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Quick stats row ── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl p-3.5 text-center border border-gray-100"
        >
          <p className={cn("text-2xl font-bold", attPct >= 75 ? "text-emerald-600" : "text-red-500")}>{attPct}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Attendance</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="bg-white rounded-2xl p-3.5 text-center border border-gray-100"
        >
          <p className="text-2xl font-bold text-emerald-600">{paidCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Fees Paid</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="bg-white rounded-2xl p-3.5 text-center border border-gray-100"
        >
          <p className="text-2xl font-bold text-blue-600">{hwGreen}/{hwStatuses.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Homework</p>
        </motion.div>
      </div>

      {/* ── Parent Info ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-4 border border-gray-100 mb-5"
      >
        <SectionHeader title="Parent / Guardian" className="mb-3" />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{student.fatherName}</p>
            <p className="text-xs text-gray-400">Father</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-xl p-3 flex gap-2 items-center">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Mother</p>
              <p className="text-sm font-semibold text-gray-800">{student.motherName}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 flex gap-2 items-center">
            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Phone</p>
              <p className="text-sm font-semibold text-gray-800">{student.phone}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Attendance ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl p-4 border border-gray-100 mb-5"
      >
        <SectionHeader title="Attendance" className="mb-3" />
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-500">{presentDays} present / {totalDays} days</span>
          <span className={cn("font-bold", attPct >= 75 ? "text-emerald-600" : "text-red-500")}>{attPct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${attPct}%` }} transition={{ duration: 0.8 }}
            className={cn("h-full rounded-full", attPct >= 75 ? "bg-emerald-500" : "bg-red-400")}
          />
        </div>
        <div className="space-y-2">
          {attendanceRecords.map((day) => {
            const rec = day.records.find((r) => r.studentId === id);
            return (
              <div key={day.date} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-sm text-gray-700">
                  {new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </p>
                <StatusBadge status={(rec?.status ?? "absent") as "present" | "absent"} size="sm" />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Fees ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-4 border border-gray-100 mb-5"
      >
        <SectionHeader title="Fees" className="mb-3" />
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="bg-emerald-50 rounded-xl p-2.5">
            <p className="text-lg font-bold text-emerald-700">{paidCount}</p>
            <p className="text-xs text-emerald-600">Paid</p>
          </div>
          <div className="bg-red-50 rounded-xl p-2.5">
            <p className="text-lg font-bold text-red-600">{pendingCount}</p>
            <p className="text-xs text-red-500">Pending</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-lg font-bold text-gray-700">₹{paidAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Paid</p>
          </div>
        </div>
        {myFees.length > 0 ? (
          <div className="space-y-2">
            {myFees.map((fee) => (
              <div key={fee.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{fee.month}</p>
                  <p className="text-xs text-gray-400">₹{fee.amount.toLocaleString()}</p>
                </div>
                <StatusBadge status={fee.status as "paid" | "pending" | "unpaid"} size="sm" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-3">No fee records</p>
        )}
      </motion.div>

      {/* ── Exam Results ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl p-4 border border-gray-100 mb-5"
      >
        <SectionHeader title="Exam Results" className="mb-3" />
        {examResults.length > 0 ? (
          <div className="space-y-3">
            {examResults.map((res) => (
              <div key={res.examName} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold text-gray-800">{res.examName}</p>
                  <div className="flex items-center gap-2">
                    {res.rank && (
                      <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold">
                        <Award className="w-3 h-3" />Rank #{res.rank}
                      </span>
                    )}
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-lg",
                      res.pct >= 75 ? "bg-emerald-100 text-emerald-700" :
                      res.pct >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                    )}>
                      {res.pct}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{res.total} / {res.max} marks</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${res.pct}%` }} transition={{ duration: 0.7 }}
                    className={cn("h-full rounded-full",
                      res.pct >= 75 ? "bg-emerald-500" : res.pct >= 50 ? "bg-yellow-400" : "bg-red-400"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-3">No exam results yet</p>
        )}
      </motion.div>

      {/* ── Homework ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-4 border border-gray-100 mb-8"
      >
        <SectionHeader title="Homework" className="mb-3" />
        <div className="space-y-2">
          {hwStatuses.map((hw) => (
            <div key={hw.title} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">{hw.title}</p>
                <p className="text-xs text-gray-400">{hw.subject}</p>
              </div>
              <StatusBadge status={hw.status as "green" | "yellow" | "red"} size="sm" />
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
