"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SectionHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { students, attendanceRecords, homeworkList, feesRecords, notifications } from "@/mock-data";
import { ActionCard } from "@/components/ui/Cards";
import { ClipboardList, BookOpen, CreditCard, GraduationCap, Bell, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ParentDashboard() {
  const router = useRouter();
  // P001 has two children: S001 (Ahmed) and S006 (Umar)
  const myChildren = students.filter((s) => ["S001", "S006"].includes(s.id));
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const todayAtt = (studentId: string) => {
    const rec = attendanceRecords[0]?.records.find((r) => r.studentId === studentId);
    return rec?.status ?? "absent";
  };

  const pendingHW = (studentId: string) =>
    homeworkList.flatMap((hw) => hw.studentStatuses).filter((ss) => ss.studentId === studentId && ss.status === "red").length;

  const feePending = feesRecords.some((f) => ["S001", "S006"].includes(f.studentId) && f.status !== "paid");

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assalamu Alaikum 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome, Abdullah Rahman</p>
      </motion.div>

      {/* Children Cards */}
      <SectionHeader title="My Children" className="mb-3" />
      <div className="space-y-3 mb-6">
        {myChildren.map((child, i) => (
          <motion.div
            key={child.id}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-4 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg">
                {child.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{child.name}</p>
                <p className="text-sm text-gray-500">{child.class} · {child.admissionNumber}</p>
              </div>
              <StatusBadge status={todayAtt(child.id) as "present" | "absent"} size="sm" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                <p className="text-xs text-gray-500">Attendance</p>
                <p className="text-sm font-bold text-emerald-700">Today ✓</p>
              </div>
              <div className={`rounded-xl p-2.5 text-center ${pendingHW(child.id) > 0 ? "bg-red-50" : "bg-emerald-50"}`}>
                <p className="text-xs text-gray-500">Homework</p>
                <p className={`text-sm font-bold ${pendingHW(child.id) > 0 ? "text-red-600" : "text-emerald-700"}`}>
                  {pendingHW(child.id) > 0 ? `${pendingHW(child.id)} Pending` : "All Done"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                <p className="text-xs text-gray-500">Class</p>
                <p className="text-sm font-bold text-gray-700">{child.class}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <SectionHeader title="Quick Access" className="mb-3" />
      <div className="grid grid-cols-2 gap-4 mb-6">
        <ActionCard title="Attendance" description="View history" icon={ClipboardList} color="emerald" onClick={() => router.push("/parent/attendance")} />
        <ActionCard title="Homework" description="Mark complete" icon={BookOpen} color="teal" badge={2} onClick={() => router.push("/parent/homework")} />
        <ActionCard title="Fees" description={feePending ? "Payment due" : "Up to date"} icon={CreditCard} color={feePending ? "amber" : "emerald"} onClick={() => router.push("/parent/fees")} />
        <ActionCard title="Results" description="Report cards" icon={GraduationCap} color="blue" onClick={() => router.push("/parent/results")} />
        <ActionCard title="Notifications" description="Messages" icon={Bell} color="rose" badge={unreadNotifs} onClick={() => router.push("/parent/notifications")} />
        <ActionCard title="Diary" description="Teacher notes" icon={FileText} color="purple" onClick={() => router.push("/parent/notifications")} />
      </div>

      {/* Announcements */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
        <p className="text-sm font-semibold text-emerald-800">📢 Announcement</p>
        <p className="text-sm text-emerald-700 mt-1">Annual exam schedule has been published. Please check the exams section.</p>
      </div>
    </DashboardLayout>
  );
}
