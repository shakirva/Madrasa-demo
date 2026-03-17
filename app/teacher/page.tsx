"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ActionCard } from "@/components/ui/Cards";
import { SectionHeader } from "@/components/ui/PageHeader";
import { attendanceRecords, homeworkList } from "@/mock-data";
import {
  ClipboardList, BookOpen, FileText, Moon, GraduationCap,
  Star, Bell, Users, TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function TeacherDashboard() {
  const router = useRouter();
  const todayAtt = attendanceRecords[0];
  const presentCount = todayAtt?.records.filter((r) => r.status === "present").length ?? 0;
  const absentCount = todayAtt?.records.filter((r) => r.status === "absent").length ?? 0;
  const pendingHW = homeworkList.flatMap((hw) => hw.studentStatuses.filter((s) => s.status === "red")).length;

  return (
    <DashboardLayout>
      {/* ── Greeting ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Assalamu Alaikum 👋</h1>
        <p className="text-gray-500 text-xs lg:text-sm mt-0.5">Usthad Abdul Kareem · Class 4 & Class 3</p>
      </motion.div>

      {/* ── Today summary ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-2 lg:gap-4 mb-4 lg:mb-6"
      >
        <div className="bg-emerald-50 rounded-2xl p-3 lg:p-4 text-center border border-emerald-100">
          <p className="text-xl lg:text-2xl font-bold text-emerald-700">{presentCount}</p>
          <p className="text-[10px] lg:text-xs text-emerald-600 mt-0.5 font-medium">Present</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-3 lg:p-4 text-center border border-red-100">
          <p className="text-xl lg:text-2xl font-bold text-red-600">{absentCount}</p>
          <p className="text-[10px] lg:text-xs text-red-500 mt-0.5 font-medium">Absent</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-3 lg:p-4 text-center border border-amber-100">
          <p className="text-xl lg:text-2xl font-bold text-amber-600">{pendingHW}</p>
          <p className="text-[10px] lg:text-xs text-amber-600 mt-0.5 font-medium">HW Pending</p>
        </div>
      </motion.div>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <ActionCard title="Attendance" description="Mark today's attendance" icon={ClipboardList} color="emerald" badge={absentCount} onClick={() => router.push("/teacher/attendance")} />
          <ActionCard title="Homework" description="Assign & track homework" icon={BookOpen} color="teal" badge={pendingHW} onClick={() => router.push("/teacher/homework")} />
          <ActionCard title="Daily Diary" description="Write class notes" icon={FileText} color="blue" onClick={() => router.push("/teacher/diary")} />
          <ActionCard title="Ibadah" description="Track prayers & deeds" icon={Moon} color="purple" onClick={() => router.push("/teacher/ibadah")} />
          <ActionCard title="Exam Marks" description="Upload results" icon={GraduationCap} color="amber" onClick={() => router.push("/teacher/exams")} />
          <ActionCard title="Performance" description="Student rankings" icon={Star} color="rose" onClick={() => router.push("/teacher/performance")} />
          <ActionCard title="My Students" description="View class list" icon={Users} color="teal" onClick={() => router.push("/teacher/attendance")} />
          <ActionCard title="Analytics" description="Parent cooperation" icon={TrendingUp} color="emerald" onClick={() => router.push("/teacher/performance")} />
        </div>
      </motion.div>

      {/* ── Notification banner ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"
      >
        <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-800">Homework Reminder</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">{pendingHW} students have not completed their homework. Send reminders to parents.</p>
          <button className="mt-2.5 text-xs text-amber-700 font-semibold bg-amber-100 px-3 py-2 rounded-xl hover:bg-amber-200 transition-colors active:scale-95">
            Send Reminders →
          </button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
