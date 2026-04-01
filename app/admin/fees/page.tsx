"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { feesRecords, students } from "@/mock-data";
import {
  CreditCard, Settings, ChevronRight, X, CheckCircle,
  Clock, AlertCircle, BarChart2, Receipt, QrCode, Upload,
  TrendingUp, Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language";
import { t } from "@/lib/i18n";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// ── Helpers ────────────────────────────────────────────────────────────────
const ALL_MONTHS = ["March 2026", "February 2026", "January 2026"];
const ALL_CLASSES = ["All Classes", ...Array.from(new Set(students.map((s) => s.class))).sort()];

function getStudent(id: string) {
  return students.find((s) => s.id === id);
}

// monthly report chart data derived from feesRecords
const monthlyChartData = ALL_MONTHS.slice().reverse().map((month) => {
  const recs = feesRecords.filter((f) => f.month === month);
  const collected = recs.filter((f) => f.status === "paid").reduce((a, b) => a + b.amount, 0);
  const pending   = recs.filter((f) => f.status !== "paid").reduce((a, b) => a + b.amount, 0);
  return { month: month.split(" ")[0], collected, pending };
});

// ── Component ───────────────────────────────────────────────────────────────
export default function AdminFeesPage() {
  const router = useRouter();
  const { lang } = useLanguageStore();
  const [activeMonth, setActiveMonth]     = useState("March 2026");
  const [activeClass, setActiveClass]     = useState("All Classes");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showSettings, setShowSettings]   = useState(false);
  const [showReport, setShowReport]       = useState(false);
  const [feeAmount, setFeeAmount]         = useState<Record<string, number>>({ "Class 2": 300, "Class 3": 400, "Class 4": 500 });
  const [approving, setApproving]         = useState<string | null>(null);

  // ── Filter records for selected month + class ──
  const monthRecords = feesRecords.filter((f) => f.month === activeMonth);
  const classFilteredRecords = monthRecords.filter((f) => {
    if (activeClass === "All Classes") return true;
    return getStudent(f.studentId)?.class === activeClass;
  });

  // ── Stats for selected month+class ──
  const paidRecs    = classFilteredRecords.filter((f) => f.status === "paid");
  const pendingRecs = classFilteredRecords.filter((f) => f.status === "pending");
  const unpaidRecs  = classFilteredRecords.filter((f) => f.status === "unpaid");
  const collected   = paidRecs.reduce((a, b) => a + b.amount, 0);
  const stillDue    = [...pendingRecs, ...unpaidRecs].reduce((a, b) => a + b.amount, 0);

  // ── Group by class for class-wise view ──
  const classSections = ALL_CLASSES.filter((c) => c !== "All Classes").map((cls) => {
    const recs = monthRecords.filter((f) => getStudent(f.studentId)?.class === cls);
    return {
      cls,
      recs,
      paid:    recs.filter((f) => f.status === "paid").length,
      pending: recs.filter((f) => f.status === "pending").length,
      unpaid:  recs.filter((f) => f.status === "unpaid").length,
      total:   recs.reduce((a, b) => a + b.amount, 0),
      collected: recs.filter((f) => f.status === "paid").reduce((a, b) => a + b.amount, 0),
    };
  }).filter((s) => s.recs.length > 0);

  // ── Student payment history (all months) ──
  const studentHistory = selectedStudent
    ? feesRecords.filter((f) => f.studentId === selectedStudent).sort((a, b) =>
        new Date(b.paidDate ?? "1970").getTime() - new Date(a.paidDate ?? "1970").getTime()
      )
    : [];
  const historyStudent = selectedStudent ? getStudent(selectedStudent) : null;
  const totalPaidByStudent = studentHistory.filter((f) => f.status === "paid").reduce((a, b) => a + b.amount, 0);
  const totalDueByStudent  = studentHistory.filter((f) => f.status !== "paid").reduce((a, b) => a + b.amount, 0);

  const handleApprove = (feeId: string) => {
    setApproving(feeId);
    setTimeout(() => setApproving(null), 1800);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={t("adminPages", "feesTitle", lang)}
        subtitle={activeMonth}
        icon={CreditCard}
        action={
          <div className="flex gap-2">
            <button onClick={() => setShowReport(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold"
            >
              <BarChart2 className="w-4 h-4" />{t("adminPages", "report", lang)}
            </button>
            <button onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* ── Month Selector ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {ALL_MONTHS.map((m) => (
          <button key={m} onClick={() => setActiveMonth(m)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-all",
              activeMonth === m ? "bg-emerald-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600"
            )}
          >{m}</button>
        ))}
      </div>

      {/* ── Class Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {ALL_CLASSES.map((cls) => (
          <button key={cls} onClick={() => setActiveClass(cls)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all",
              activeClass === cls ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500"
            )}
          >
            {cls === "All Classes" && <Users className="w-3.5 h-3.5" />}
            {cls}
          </button>
        ))}
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Wrap stats as buttons to navigate to filtered lists */}
        <button onClick={() => { router.push(`/admin/fees/paid?month=${encodeURIComponent(activeMonth)}&class=${encodeURIComponent(activeClass)}`); }} className="text-left">
          <div className="bg-emerald-50 rounded-2xl p-3.5 text-center border border-emerald-100 hover:shadow-sm">
            <p className="text-xl font-bold text-emerald-700">{paidRecs.length}</p>
            <p className="text-xs text-emerald-600 mt-0.5">{t("adminPages", "paidLabel", lang)}</p>
          </div>
        </button>

        <button onClick={() => { router.push(`/admin/fees/pending?month=${encodeURIComponent(activeMonth)}&class=${encodeURIComponent(activeClass)}`); }} className="text-left">
          <div className="bg-amber-50 rounded-2xl p-3.5 text-center border border-amber-100 hover:shadow-sm">
            <p className="text-xl font-bold text-amber-700">{pendingRecs.length}</p>
            <p className="text-xs text-amber-600 mt-0.5">{t("adminPages", "proofSent", lang)}</p>
          </div>
        </button>

        <button onClick={() => { router.push(`/admin/fees/unpaid?month=${encodeURIComponent(activeMonth)}&class=${encodeURIComponent(activeClass)}`); }} className="text-left">
          <div className="bg-red-50 rounded-2xl p-3.5 text-center border border-red-100 hover:shadow-sm">
            <p className="text-xl font-bold text-red-600">{unpaidRecs.length}</p>
            <p className="text-xs text-red-500 mt-0.5">{t("adminPages", "unpaid", lang)}</p>
          </div>
        </button>
      </div>

      {/* ── Collected vs Pending bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400">{t("adminPages", "collected", lang)}</p>
            <p className="text-xl font-bold text-emerald-700">₹{collected.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{t("adminPages", "stillDue", lang)}</p>
            <p className="text-xl font-bold text-red-500">₹{stillDue.toLocaleString()}</p>
          </div>
        </div>
        {(collected + stillDue) > 0 && (
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((collected / (collected + stillDue)) * 100)}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1.5 text-right">
          {collected + stillDue > 0 ? Math.round((collected / (collected + stillDue)) * 100) : 0}% {t("adminPages", "pctCollected", lang)}
        </p>
      </div>

      {/* ── Class-wise view OR student list ── */}
      {activeClass === "All Classes" ? (
        // Class-wise grouped view
        <div className="space-y-4">
          {classSections.map((section) => (
            <motion.div key={section.cls}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              {/* Class header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{section.cls}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                    <CheckCircle className="w-3 h-3" />{section.paid}
                  </span>
                  <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold">
                    <Clock className="w-3 h-3" />{section.pending}
                  </span>
                  <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-semibold">
                    <AlertCircle className="w-3 h-3" />{section.unpaid}
                  </span>
                </div>
              </div>
              {/* Amount bar */}
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  ₹{section.collected.toLocaleString()} / ₹{section.total.toLocaleString()}
                </span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full"
                    style={{ width: section.total > 0 ? `${Math.round((section.collected / section.total) * 100)}%` : "0%" }}
                  />
                </div>
              </div>
              {/* Students */}
              <div className="divide-y divide-gray-50">
                {section.recs.map((fee) => {
                  const student = getStudent(fee.studentId);
                  return (
                    <div key={fee.id}
                      className="flex items-center justify-between px-4 py-3 active:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedStudent(fee.studentId)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0",
                          student?.gender === "female" ? "bg-pink-100 text-pink-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {student?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-tight">{student?.name}</p>
                          <p className="text-xs text-gray-400">₹{fee.amount} · {fee.month}</p>
                          {fee.receiptNumber && (
                            <p className="text-xs text-emerald-600">{fee.receiptNumber}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={fee.status as "paid"|"pending"|"unpaid"} size="sm" />
                        {fee.status === "pending" && (
                          <button onClick={(e) => { e.stopPropagation(); handleApprove(fee.id); }}
                            className={cn(
                              "px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                              approving === fee.id
                                ? "bg-emerald-600 text-white"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            )}
                          >
                            {approving === fee.id ? t("adminPages", "doneApprove", lang) : t("adminPages", "approve", lang)}
                          </button>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // Single-class flat list
        <div className="space-y-3">
          {classFilteredRecords.map((fee, i) => {
            const student = getStudent(fee.studentId);
            return (
              <motion.div key={fee.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between cursor-pointer active:bg-gray-50"
                onClick={() => setSelectedStudent(fee.studentId)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center text-base font-bold shrink-0",
                    student?.gender === "female" ? "bg-pink-100 text-pink-700" : "bg-emerald-100 text-emerald-700"
                  )}>
                    {student?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{student?.name}</p>
                    <p className="text-xs text-gray-400">{student?.class} {student?.division} · ₹{fee.amount}</p>
                    {fee.receiptNumber && <p className="text-xs text-emerald-600">{fee.receiptNumber}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={fee.status as "paid"|"pending"|"unpaid"} size="sm" />
                  {fee.status === "pending" && (
                    <button onClick={(e) => { e.stopPropagation(); handleApprove(fee.id); }}
                      className={cn(
                        "px-2.5 py-1.5 rounded-xl text-xs font-bold",
                        approving === fee.id ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      )}
                    >
                      {approving === fee.id ? "✓" : t("adminPages", "approve", lang)}
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          STUDENT PAYMENT HISTORY DRAWER
      ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div key="stu-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setSelectedStudent(null)}
            />
            <motion.div key="stu-drawer"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90dvh] flex flex-col"
            >
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg",
                    historyStudent?.gender === "female" ? "bg-pink-100 text-pink-700" : "bg-emerald-100 text-emerald-700"
                  )}>
                    {historyStudent?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{historyStudent?.name}</p>
                    <p className="text-xs text-gray-400">{historyStudent?.class} {historyStudent?.division} · {historyStudent?.admissionNumber}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedStudent(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-5 py-4 pb-8">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-100">
                    <p className="text-lg font-bold text-emerald-700">
                      {studentHistory.filter((f) => f.status === "paid").length}
                    </p>
                    <p className="text-xs text-emerald-600">{t("adminPages", "paidLabel", lang)}</p>
                  </div>
                  <div className="bg-red-50 rounded-2xl p-3 text-center border border-red-100">
                    <p className="text-lg font-bold text-red-600">
                      {studentHistory.filter((f) => f.status !== "paid").length}
                    </p>
                    <p className="text-xs text-red-500">{t("adminPages", "pendingLabel", lang)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-200">
                    <p className="text-lg font-bold text-gray-800">
                      {studentHistory.length}
                    </p>
                    <p className="text-xs text-gray-500">{t("adminPages", "months", lang)}</p>
                  </div>
                </div>

                {/* Amount summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">{t("adminPages", "totalPaidLabel", lang)}</p>
                    <p className="text-xl font-bold text-emerald-700">₹{totalPaidByStudent.toLocaleString()}</p>
                  </div>
                  <div className="h-10 w-px bg-gray-100" />
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{t("adminPages", "stillDue", lang)}</p>
                    <p className="text-xl font-bold text-red-500">₹{totalDueByStudent.toLocaleString()}</p>
                  </div>
                </div>

                {/* Payment history */}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t("adminPages", "paymentHistory", lang)}</p>
                <div className="space-y-3">
                  {studentHistory.map((fee, i) => (
                    <motion.div key={fee.id}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className={cn(
                        "rounded-2xl p-4 border",
                        fee.status === "paid"    ? "bg-emerald-50/50 border-emerald-100"
                        : fee.status === "pending" ? "bg-amber-50/50 border-amber-100"
                        :                           "bg-red-50/50 border-red-100"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="font-bold text-gray-900 text-sm">{fee.month}</p>
                        <StatusBadge status={fee.status as "paid"|"pending"|"unpaid"} size="sm" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />₹{fee.amount.toLocaleString()}
                        </span>
                        {fee.paidDate && (
                          <span className="text-emerald-600 font-medium">
                            {t("adminPages", "paidOn", lang)} {new Date(fee.paidDate).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                          </span>
                        )}
                      </div>
                      {fee.receiptNumber && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <Receipt className="w-3 h-3 text-emerald-600" />
                          <span className="text-xs text-emerald-600 font-medium">{fee.receiptNumber}</span>
                        </div>
                      )}
                      {fee.status === "pending" && (
                        <div className="mt-2.5 flex gap-2">
                          <button
                            onClick={() => handleApprove(fee.id)}
                            className={cn(
                              "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                              approving === fee.id ? "bg-emerald-600 text-white" : "bg-emerald-600 text-white"
                            )}
                          >
                            {approving === fee.id ? t("adminPages", "approved", lang) : t("adminPages", "approvePayment", lang)}
                          </button>
                          <button className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold flex items-center gap-1">
                            <Upload className="w-3 h-3" />{t("adminPages", "proof", lang)}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          MONTHLY REPORT DRAWER
      ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showReport && (
          <>
            <motion.div key="rep-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setShowReport(false)}
            />
            <motion.div key="rep-drawer"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90dvh] flex flex-col"
            >
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{t("adminPages", "monthlyReport", lang)}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{t("adminPages", "threeMonthOverview", lang)}</p>
                </div>
                <button onClick={() => setShowReport(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 px-5 py-4 pb-8 space-y-5">
                {/* Chart */}
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />{t("adminPages", "collVsPending", lang)}
                  </p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={monthlyChartData} barSize={22}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip formatter={(val) => [`₹${Number(val).toLocaleString()}`, ""]} />
                      <Bar dataKey="collected" fill="#10b981" radius={[6,6,0,0]} name={t("adminPages", "collected", lang)} />
                      <Bar dataKey="pending"   fill="#fca5a5" radius={[6,6,0,0]} name={t("adminPages", "pendingLabel", lang)}   />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Per-month breakdown */}
                {ALL_MONTHS.map((month) => {
                  const recs = feesRecords.filter((f) => f.month === month);
                  const paid = recs.filter((f) => f.status === "paid");
                  const due  = recs.filter((f) => f.status !== "paid");
                  const collAmt = paid.reduce((a, b) => a + b.amount, 0);
                  const dueAmt  = due.reduce((a, b) => a + b.amount, 0);
                  const pct = (collAmt + dueAmt) > 0 ? Math.round((collAmt / (collAmt + dueAmt)) * 100) : 0;
                  return (
                    <div key={month} className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-bold text-gray-900">{month}</p>
                        <span className={cn(
                          "text-xs font-bold px-2.5 py-1 rounded-full",
                          pct >= 80 ? "bg-emerald-100 text-emerald-700" : pct >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
                        )}>{pct}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-emerald-50 rounded-xl p-2">
                          <p className="font-bold text-emerald-700">{paid.length}</p>
                          <p className="text-emerald-600">{t("adminPages", "paidLabel", lang)}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-2">
                          <p className="font-bold text-red-600">{due.length}</p>
                          <p className="text-red-500">{t("adminPages", "due", lang)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-2">
                          <p className="font-bold text-gray-700">₹{collAmt.toLocaleString()}</p>
                          <p className="text-gray-500">{t("adminPages", "collected", lang)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          SETTINGS DRAWER
      ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div key="set-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setShowSettings(false)}
            />
            <motion.div key="set-drawer"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85dvh] flex flex-col"
            >
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{t("adminPages", "feeSettings", lang)}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{t("adminPages", "configureFees", lang)}</p>
                </div>
                <button onClick={() => setShowSettings(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 px-5 py-4 pb-8 space-y-5">

                {/* Fee per class */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t("adminPages", "monthlyFeeAmt", lang)}</p>
                  <div className="space-y-3">
                    {Object.entries(feeAmount).map(([cls, amt]) => (
                      <div key={cls} className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <p className="font-semibold text-gray-800 text-sm shrink-0">{cls}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-sm">₹</span>
                          <input
                            type="number"
                            value={amt}
                            onChange={(e) => setFeeAmount((p) => ({ ...p, [cls]: Number(e.target.value) }))}
                            className="w-24 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-right focus:outline-none focus:border-emerald-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Code section */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t("adminPages", "paymentQR", lang)}</p>
                  <div className="bg-gray-50 rounded-2xl p-4 text-center">
                    <div className="w-28 h-28 bg-white rounded-xl mx-auto flex items-center justify-center border border-gray-200 mb-3">
                      <QrCode className="w-14 h-14 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">UPI: darulhuda@okaxis</p>
                    <p className="text-xs text-gray-400 mb-3">{t("adminPages", "parentsScan", lang)}</p>
                    <button className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" />{t("adminPages", "uploadNewQR", lang)}
                    </button>
                  </div>
                </div>

                {/* Send reminder */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t("adminPages", "reminders", lang)}</p>
                  <div className="space-y-2">
                    {[
                      { key: "sendUnpaidReminder" as const, label: t("adminPages", "sendUnpaidReminder", lang) },
                      { key: "sendPendingReminder" as const, label: t("adminPages", "sendPendingReminder", lang) },
                    ].map((action) => (
                      <button key={action.key}
                        onClick={() => alert("✅ Reminder sent! (Demo)")}
                        className="w-full py-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save */}
                <button
                  onClick={() => { setShowSettings(false); alert("✅ Settings saved! (Demo)"); }}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl text-base"
                >
                  {t("adminPages", "saveSettingsFee", lang)}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
