"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { students } from "@/mock-data";
import { Users, Plus, Search, Eye, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Derive unique classes in order
const ALL_CLASSES = ["All", ...Array.from(new Set(students.map((s) => s.class))).sort()];

// Avatar colour per class
const classColors: Record<string, { bg: string; text: string; badge: string }> = {
  "Class 2": { bg: "bg-sky-100",    text: "text-sky-700",    badge: "bg-sky-100 text-sky-700 border border-sky-200"    },
  "Class 3": { bg: "bg-purple-100", text: "text-purple-700", badge: "bg-purple-100 text-purple-700 border border-purple-200" },
  "Class 4": { bg: "bg-emerald-100",text: "text-emerald-700",badge: "bg-emerald-100 text-emerald-700 border border-emerald-200"},
};
const fallback = { bg: "bg-gray-100", text: "text-gray-700", badge: "bg-gray-100 text-gray-700 border border-gray-200" };

export default function AdminStudentsPage() {
  const router = useRouter();
  const [search, setSearch]       = useState("");
  const [activeClass, setActiveClass] = useState("All");
  const [gender, setGender]       = useState<"all" | "male" | "female">("all");
  const [showForm, setShowForm]   = useState(false);

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.admissionNumber.toLowerCase().includes(search.toLowerCase());
    const matchClass  = activeClass === "All" || s.class === activeClass;
    const matchGender = gender === "all" || s.gender === gender;
    return matchSearch && matchClass && matchGender;
  });

  // Count per class for the tab badges
  const countFor = (cls: string) =>
    cls === "All" ? students.length : students.filter((s) => s.class === cls).length;

  return (
    <DashboardLayout>
      <PageHeader
        title="Students"
        subtitle={`${students.length} enrolled students`}
        icon={Users}
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        }
      />

      {/* ── Search ── */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or admission number..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
        />
      </div>

      {/* ── Class Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {ALL_CLASSES.map((cls) => (
          <button
            key={cls}
            onClick={() => setActiveClass(cls)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-all",
              activeClass === cls
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300"
            )}
          >
            {cls === "All" ? <GraduationCap className="w-3.5 h-3.5" /> : null}
            {cls}
            <span className={cn(
              "text-xs font-bold px-1.5 py-0.5 rounded-full",
              activeClass === cls ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            )}>
              {countFor(cls)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Gender Filter ── */}
      <div className="flex gap-2 mb-5">
        {(["all", "male", "female"] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGender(g)}
            className={cn(
              "flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all",
              gender === g
                ? g === "male"   ? "bg-blue-600 text-white"
                : g === "female" ? "bg-pink-500 text-white"
                :                  "bg-gray-800 text-white"
                : "bg-white border border-gray-200 text-gray-500"
            )}
          >
            {g === "all" ? "👥 All" : g === "male" ? "♂ Boys" : "♀ Girls"}
          </button>
        ))}
      </div>

      {/* ── Result count ── */}
      <p className="text-xs text-gray-400 mb-3 font-medium">
        Showing <span className="text-gray-700 font-bold">{filtered.length}</span> student{filtered.length !== 1 ? "s" : ""}
        {activeClass !== "All" ? ` in ${activeClass}` : ""}
        {gender !== "all" ? ` · ${gender === "male" ? "Boys" : "Girls"}` : ""}
      </p>

      {/* ── Student List ── */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-16 text-gray-400"
            >
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No students found</p>
              <p className="text-sm mt-1">Try adjusting the filter or search</p>
            </motion.div>
          ) : (
            filtered.map((student, i) => {
              const col = classColors[student.class] ?? fallback;
              return (
                <motion.div
                  key={student.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between group hover:border-emerald-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0",
                      student.gender === "female" ? "bg-pink-100 text-pink-700" : col.bg + " " + col.text
                    )}>
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {student.admissionNumber} · {student.class} {student.division}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {student.gender === "male" ? "♂" : "♀"} {student.fatherName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Class badge */}
                    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-lg hidden sm:inline-flex", col.badge)}>
                      {student.class}
                    </span>
                    {/* Division badge */}
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hidden sm:inline-flex">
                      Div {student.division}
                    </span>
                    {/* View button */}
                    <button
                      onClick={() => router.push(`/admin/students/${student.id}`)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors text-xs font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom Drawer ── */}
      <AnimatePresence>
        {showForm && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />

            {/* Drawer panel — slides up from bottom */}
            <motion.div
              key="drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[92dvh] flex flex-col"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">New Admission</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Fill in student details below</p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable form body */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6 pb-8">

                {/* ── Student Info ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">1</div>
                    <p className="text-sm font-bold text-emerald-700 uppercase tracking-wide">Student Information</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Student Name", placeholder: "Full name", type: "text" },
                      { label: "Admission Number", placeholder: "MDA-2026-XXX", type: "text" },
                      { label: "Date of Birth", placeholder: "", type: "date" },
                      { label: "Address", placeholder: "Full address", type: "text" },
                    ].map(({ label, placeholder, type }) => (
                      <div key={label}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                        <input
                          type={type}
                          placeholder={placeholder}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-emerald-400 focus:bg-white text-sm transition-colors"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Gender</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Male", "Female"].map((g) => (
                          <label key={g} className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 cursor-pointer has-checked:border-emerald-500 has-checked:bg-emerald-50 has-checked:text-emerald-700 transition-all">
                            <input type="radio" name="gender" value={g} className="accent-emerald-600" />
                            {g === "Male" ? "♂" : "♀"} {g}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-gray-200" />

                {/* ── Parent Info ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">2</div>
                    <p className="text-sm font-bold text-teal-700 uppercase tracking-wide">Parent Information</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Father Name", placeholder: "Father's full name", type: "text" },
                      { label: "Mother Name", placeholder: "Mother's full name", type: "text" },
                      { label: "Phone Number", placeholder: "10-digit mobile", type: "tel" },
                      { label: "Parent Login Password", placeholder: "Min 6 characters", type: "password" },
                    ].map(({ label, placeholder, type }) => (
                      <div key={label}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                        <input
                          type={type}
                          placeholder={placeholder}
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-teal-400 focus:bg-white text-sm transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-gray-200" />

                {/* ── Madrasa Details ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">3</div>
                    <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">Madrasa Details</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Class</label>
                      <select className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-blue-400 text-sm">
                        {["Class 1","Class 2","Class 3","Class 4","Class 5","Class 6"].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Division</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["A", "B"].map((d) => (
                          <label key={d} className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 cursor-pointer has-checked:border-blue-500 has-checked:bg-blue-50 has-checked:text-blue-700 transition-all">
                            <input type="radio" name="division" value={d} className="accent-blue-600" />
                            Division {d}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Joining Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-blue-400 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={() => {
                    setShowForm(false);
                    alert("✅ Student admitted successfully! (Demo)");
                  }}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl text-base active:scale-[0.98] transition-transform shadow-lg shadow-emerald-200"
                >
                  Admit Student ✓
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
