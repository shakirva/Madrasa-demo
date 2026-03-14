"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader, SectionHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { feesRecords, students } from "@/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Upload, Receipt, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const myChildren = students.filter((s) => ["S001", "S006"].includes(s.id));

export default function ParentFeesPage() {
  const [activeChild, setActiveChild] = useState(myChildren[0].id);
  const [showQR, setShowQR] = useState(false);
  const [showReceipt, setShowReceipt] = useState<string | null>(null);
  const [uploadedFor, setUploadedFor] = useState<string | null>(null);

  // Stable QR pattern — deterministic, no Math.random
  const qrPattern = [1,0,1,1,0,0,1,0,1,1,1,0,0,1,0,1,1,0,1,0,0,1,1,0,1];

  const childFees = feesRecords.filter((f) => f.studentId === activeChild);
  const child = myChildren.find((c) => c.id === activeChild)!;

  const totalPaid = childFees.filter((f) => f.status === "paid").reduce((a, b) => a + b.amount, 0);
  const totalPending = childFees.filter((f) => f.status !== "paid").reduce((a, b) => a + b.amount, 0);

  return (
    <DashboardLayout>
      <PageHeader title="Fees" subtitle={child.name} back action={
        <button onClick={() => setShowQR(true)} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold">
          <QrCode className="w-4 h-4" />Pay Now
        </button>
      } />

      {/* Child selector */}
      <div className="flex gap-2 mb-5">
        {myChildren.map((c) => (
          <button key={c.id} onClick={() => setActiveChild(c.id)}
            className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
              activeChild === c.id ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-600")}
          >{c.name}</button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <p className="text-xs text-emerald-600 mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-emerald-700">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
          <p className="text-xs text-red-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-red-600">₹{totalPending.toLocaleString()}</p>
        </div>
      </div>

      <SectionHeader title="Monthly Fees" className="mb-3" />
      <div className="space-y-3">
        {childFees.map((fee, i) => (
          <motion.div key={fee.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-4 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900">{fee.month}</p>
                <p className="text-xs text-gray-400">Fee for {fee.month}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">₹{fee.amount.toLocaleString()}</p>
                <StatusBadge status={fee.status as "paid" | "pending" | "unpaid"} size="sm" />
              </div>
            </div>

            {fee.status === "paid" && (
              <button onClick={() => setShowReceipt(fee.id)}
                className="w-full py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Receipt className="w-4 h-4" />View Receipt
              </button>
            )}

            {fee.status !== "paid" && (
              <div className="space-y-2">
                <button onClick={() => setShowQR(true)}
                  className="w-full py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />Pay via UPI / QR
                </button>
                <button onClick={() => { setUploadedFor(fee.id); setTimeout(() => setUploadedFor(null), 2500); }}
                  className="w-full py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {uploadedFor === fee.id
                    ? <><CheckCircle className="w-4 h-4 text-emerald-600" /> Proof sent to admin!</>
                    : <><Upload className="w-4 h-4" />Upload Payment Proof</>
                  }
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
          >
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Pay via QR / UPI</h3>
                <button onClick={() => setShowQR(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-100 rounded-2xl aspect-square flex flex-col items-center justify-center mb-4">
                <div className="grid grid-cols-5 gap-1 p-4">
                  {qrPattern.map((cell, i) => (
                    <div key={i} className={cn("w-5 h-5 rounded-sm", cell ? "bg-gray-900" : "bg-white")} />
                  ))}
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mb-1">UPI ID: <strong>madrasa@upi</strong></p>
              <p className="text-center text-xs text-gray-400">Scan with any UPI app (GPay, PhonePe, Paytm)</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && (() => {
          const fee = childFees.find((f) => f.id === showReceipt)!;
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
            >
              <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                className="bg-white rounded-3xl p-6 w-full max-w-sm"
              >
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-gray-900 text-lg">Receipt</h3>
                  <button onClick={() => setShowReceipt(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-5 text-center mb-4">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="text-emerald-700 font-bold text-lg">Payment Confirmed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">₹{fee.amount.toLocaleString()}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Student</span><span className="font-semibold">{child.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Month</span><span className="font-semibold">{fee.month}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Class</span><span className="font-semibold">{child.class}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Receipt No.</span><span className="font-semibold">REC-{fee.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status="paid" size="sm" /></div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </DashboardLayout>
  );
}
