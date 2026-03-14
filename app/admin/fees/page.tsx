"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SectionHeader } from "@/components/ui/PageHeader";
import { feesRecords, students, adminStats } from "@/mock-data";
import { CreditCard, Upload, FileText, QrCode } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AdminFeesPage() {
  const [showQR, setShowQR] = useState(false);

  const getStudentName = (id: string) => students.find((s) => s.id === id)?.name ?? id;

  const paidCount = feesRecords.filter((f) => f.status === "paid").length;
  const pendingCount = feesRecords.filter((f) => f.status === "pending").length;
  const unpaidCount = feesRecords.filter((f) => f.status === "unpaid").length;

  return (
    <DashboardLayout>
      <PageHeader
        title="Fees Management"
        subtitle="March 2026"
        icon={CreditCard}
        action={
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            <QrCode className="w-4 h-4" /> View QR
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{paidCount}</p>
          <p className="text-xs text-emerald-600 mt-1">Paid</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          <p className="text-xs text-amber-600 mt-1">Proof Uploaded</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{unpaidCount}</p>
          <p className="text-xs text-red-500 mt-1">Unpaid</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-700">₹{adminStats.feesCollectedThisMonth.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Still Pending</p>
          <p className="text-2xl font-bold text-amber-600">₹{adminStats.feesPending.toLocaleString()}</p>
        </div>
      </div>

      <SectionHeader title="Student Fee Status" />
      <div className="space-y-3">
        {feesRecords.filter((f) => f.month === "March 2026").map((fee, i) => (
          <motion.div
            key={fee.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-gray-900 text-sm">{getStudentName(fee.studentId)}</p>
              <p className="text-xs text-gray-500 mt-0.5">₹{fee.amount} · {fee.month}</p>
              {fee.receiptNumber && <p className="text-xs text-emerald-600 mt-0.5">{fee.receiptNumber}</p>}
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={fee.status as "paid" | "pending" | "unpaid"} size="sm" />
              {fee.status === "pending" && (
                <button
                  onClick={() => alert("✅ Receipt generated! (Demo)")}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-sm text-center"
          >
            <p className="font-bold text-gray-900 text-lg mb-2">Google Pay QR Code</p>
            <p className="text-sm text-gray-500 mb-6">Parents can scan to pay monthly fees</p>
            <div className="w-48 h-48 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">QR Code Here</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">Darul Huda Madrasa<br />UPI: darulhuda@okaxis</p>
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors">
                <Upload className="w-4 h-4" /> Upload QR
              </button>
              <button onClick={() => setShowQR(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
