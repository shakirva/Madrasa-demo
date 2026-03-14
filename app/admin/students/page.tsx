"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { students } from "@/mock-data";
import { Users, Plus, Search, Eye } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminStudentsPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Students"
        subtitle={`${students.length} enrolled students`}
        icon={Users}
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        }
      />

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or admission number..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
        />
      </div>

      {/* Student list */}
      <div className="space-y-3">
        {filtered.map((student, i) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-base">
                {student.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                <p className="text-xs text-gray-500">{student.admissionNumber} · {student.class} {student.division}</p>
                <p className="text-xs text-gray-400">{student.gender === "male" ? "♂" : "♀"} {student.fatherName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={student.gender === "male" ? "present" : "present"} label={student.class} size="sm" />
              <Link href={`/admin/students/${student.id}`}>
                <button className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Admission Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">New Student Admission</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6 space-y-5">
              {/* Student Info */}
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-3">Student Information</p>
                <div className="space-y-3">
                  {[
                    { label: "Student Name", placeholder: "Full name" },
                    { label: "Admission Number", placeholder: "MDA-2026-XXX" },
                    { label: "Date of Birth", placeholder: "DD/MM/YYYY", type: "date" },
                    { label: "Address", placeholder: "Full address" },
                  ].map(({ label, placeholder, type }) => (
                    <div key={label}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input type={type ?? "text"} placeholder={placeholder} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none text-sm">
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parent Info */}
              <div>
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-3">Parent Information</p>
                <div className="space-y-3">
                  {[
                    { label: "Father Name" },
                    { label: "Mother Name" },
                    { label: "Phone Number", type: "tel" },
                    { label: "Login Password", type: "password" },
                  ].map(({ label, type }) => (
                    <div key={label}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input type={type ?? "text"} placeholder={label} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Madrasa Info */}
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Madrasa Details</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none text-sm">
                      {["Class 1","Class 2","Class 3","Class 4","Class 5","Class 6"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none text-sm">
                      <option>A</option><option>B</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                    <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none text-sm" />
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setShowForm(false); alert("✅ Student admitted successfully! (Demo)"); }}
                className="w-full bg-emerald-600 text-white font-semibold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Admit Student
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
