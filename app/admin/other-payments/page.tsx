"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { students, otherPaymentCategories, otherPaymentRecords } from "@/mock-data";
import {
  GraduationCap, BookOpen, Building2, Heart, HandCoins,
  Megaphone, CheckCircle, IndianRupee, ChevronRight, X, Plus,
  Search, Download, Receipt, User,
  Phone, MapPin, Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language";
import { t as tr } from "@/lib/i18n";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

type CategoryId =
  | "exam-fees" | "book-fees" | "samstha-fund"
  | "keithang-charity" | "muallim-charity" | "other-campaign";

const iconMap: Record<string, React.ElementType> = {
  GraduationCap, BookOpen, Building2, Heart, HandCoins, Megaphone,
};

const colorMap: Record<string, {
  bg: string; text: string; light: string; badge: string; border: string;
}> = {
  blue:   { bg:"bg-blue-600",   text:"text-blue-700",   light:"bg-blue-50",   badge:"bg-blue-100 text-blue-700",   border:"border-blue-200"   },
  purple: { bg:"bg-purple-600", text:"text-purple-700", light:"bg-purple-50", badge:"bg-purple-100 text-purple-700",border:"border-purple-200" },
  teal:   { bg:"bg-teal-600",   text:"text-teal-700",   light:"bg-teal-50",   badge:"bg-teal-100 text-teal-700",   border:"border-teal-200"   },
  rose:   { bg:"bg-rose-600",   text:"text-rose-700",   light:"bg-rose-50",   badge:"bg-rose-100 text-rose-700",   border:"border-rose-200"   },
  orange: { bg:"bg-orange-500", text:"text-orange-700", light:"bg-orange-50", badge:"bg-orange-100 text-orange-700",border:"border-orange-200" },
  amber:  { bg:"bg-amber-500",  text:"text-amber-700",  light:"bg-amber-50",  badge:"bg-amber-100 text-amber-700", border:"border-amber-200"  },
};

function getStudent(id: string) { return students.find((s) => s.id === id); }

const catDescriptions: Record<CategoryId, { desc: string; dueNote: string }> = {
  "exam-fees":        { desc: "Term 2 examination fees collected from all enrolled students.", dueNote: "Due: 31 March 2026" },
  "book-fees":        { desc: "Annual textbook and study material order fees for the academic year.", dueNote: "Due: 28 Feb 2026" },
  "samstha-fund":     { desc: "Annual contribution to Samastha Kerala Jamiyyathul Ulama institutional fund.", dueNote: "Due: 31 March 2026" },
  "keithang-charity": { desc: "Keithang charity drive – supporting underprivileged families in the community.", dueNote: "Due: 31 March 2026" },
  "muallim-charity":  { desc: "Muallim welfare fund – supporting teachers and Islamic scholars in need.", dueNote: "Due: 31 March 2026" },
  "other-campaign":   { desc: "Madrasa Building Fund – contribution towards new infrastructure development.", dueNote: "Due: 15 April 2026" },
};

export default function OtherPaymentsPage() {
  const { lang } = useLanguageStore();
  const [activeCategory, setActiveCategory] = useState<CategoryId>("exam-fees");
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">("all");
  const [showReceipt, setShowReceipt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"records" | "overview">("records");

  const cat = otherPaymentCategories.find((c) => c.id === activeCategory)!;
  const catColor = colorMap[cat.color];
  const CatIcon = iconMap[cat.icon] ?? GraduationCap;
  const catDesc = catDescriptions[activeCategory];

  const catRecords  = otherPaymentRecords.filter((r) => r.category === activeCategory);
  const paidRecs    = catRecords.filter((r) => r.status === "paid");
  const pendingRecs = catRecords.filter((r) => r.status === "pending");
  const totalCollected = paidRecs.reduce((a, b) => a + b.amount, 0);
  const totalPending   = pendingRecs.reduce((a, b) => a + b.amount, 0);
  const totalAmount    = catRecords.reduce((a, b) => a + b.amount, 0);
  const pctCollected   = totalAmount > 0 ? Math.round((totalCollected / totalAmount) * 100) : 0;

  const filtered = catRecords.filter((r) => {
    const stu = getStudent(r.studentId);
    const matchSearch = !search ||
      stu?.name.toLowerCase().includes(search.toLowerCase()) ||
      stu?.admissionNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const chartData = otherPaymentCategories.map((c) => {
    const recs = otherPaymentRecords.filter((r) => r.category === c.id);
    return {
      name: c.label.replace(" Fees","").replace(" Charity","").replace(" Fund","").replace(" Campaigns",""),
      collected: recs.filter((r) => r.status === "paid").reduce((a, b) => a + b.amount, 0),
      pending:   recs.filter((r) => r.status === "pending").reduce((a, b) => a + b.amount, 0),
    };
  });

  const selectedRec = selectedRecord ? catRecords.find((r) => r.id === selectedRecord) : null;
  const receiptRec  = showReceipt    ? catRecords.find((r) => r.id === showReceipt)    : null;
  const studentAllPayments = selectedRec
    ? otherPaymentRecords.filter((r) => r.studentId === selectedRec.studentId)
    : [];

  const handleMarkPaid = (id: string) => {
    setMarkingPaid(id);
    setTimeout(() => setMarkingPaid(null), 1600);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={tr("adminPages", "otherPayTitle", lang)}
        subtitle={tr("adminPages", "otherPayDesc", lang)}
        icon={IndianRupee}
        action={
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold">
            <Plus className="w-4 h-4" /> {tr("adminPages", "addCampaign", lang)}
          </button>
        }
      />

      {/* ── All-Categories Mini Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {otherPaymentCategories.map((c) => {
          const Ic  = iconMap[c.icon] ?? GraduationCap;
          const cc  = colorMap[c.color];
          const recs = otherPaymentRecords.filter((r) => r.category === c.id);
          const col  = recs.filter((r) => r.status === "paid").reduce((a, b) => a + b.amount, 0);
          const tot  = recs.reduce((a, b) => a + b.amount, 0);
          const pct  = tot > 0 ? Math.round((col / tot) * 100) : 0;
          const isActive = activeCategory === c.id;
          return (
            <button key={c.id} onClick={() => setActiveCategory(c.id as CategoryId)}
              className={cn("text-left p-4 rounded-2xl border-2 transition-all",
                isActive ? `${cc.light} ${cc.border}` : "bg-white border-gray-100 hover:border-gray-200")}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", cc.bg)}>
                  <Ic className="w-3.5 h-3.5 text-white" />
                </div>
                <p className={cn("text-xs font-bold truncate", isActive ? cc.text : "text-gray-700")}>{c.label}</p>
              </div>
              <p className="text-lg font-bold text-gray-900">₹{col.toLocaleString()}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-gray-400">of ₹{tot.toLocaleString()}</p>
                <p className={cn("text-[10px] font-bold", pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-500")}>{pct}%</p>
              </div>
              <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", cc.bg)} style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Active Category Header ── */}
      <div className={cn("rounded-2xl p-5 mb-5 border-2", catColor.light, catColor.border)}>
        <div className="flex items-start gap-4">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", catColor.bg)}>
            <CatIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className={cn("font-bold text-lg", catColor.text)}>{cat.label}</p>
            <p className="text-sm text-gray-600 mt-0.5">{catDesc.desc}</p>
            <p className={cn("text-xs font-semibold mt-1", catColor.text)}>{catDesc.dueNote}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4">
          <MiniStat label="Total"      value={catRecords.length.toString()} sub="students" />
          <MiniStat label="Paid"       value={paidRecs.length.toString()}   sub={`₹${totalCollected.toLocaleString()}`} color="text-emerald-600" />
          <MiniStat label="Pending"    value={pendingRecs.length.toString()} sub={`₹${totalPending.toLocaleString()}`}  color="text-amber-600" />
          <MiniStat label="Collection" value={`${pctCollected}%`} sub="rate" color={pctCollected >= 80 ? "text-emerald-600" : "text-amber-600"} />
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>₹{totalCollected.toLocaleString()} collected</span>
            <span>₹{totalAmount.toLocaleString()} total</span>
          </div>
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pctCollected}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={cn("h-full rounded-full", catColor.bg)}
            />
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {(["records","overview"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={cn("px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all",
              activeTab === t ? "bg-white shadow-sm text-emerald-700" : "text-gray-500")}
          >
            {t === "records" ? tr("adminPages", "studentRecords", lang) : tr("adminPages", "overviewChart", lang)}
          </button>
        ))}
      </div>

      {/* ════ OVERVIEW ════ */}
      {activeTab === "overview" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="font-bold text-gray-900 mb-4 text-sm">{tr("adminPages", "allCatOverview", lang)}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={22} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `₹${v}`} />
              <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
              <Bar dataKey="collected" name="Collected" fill="#059669" radius={[4,4,0,0]} />
              <Bar dataKey="pending"   name="Pending"   fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 divide-y divide-gray-50">
            {otherPaymentCategories.map((c) => {
              const recs = otherPaymentRecords.filter((r) => r.category === c.id);
              const col  = recs.filter((r) => r.status === "paid").reduce((a, b) => a + b.amount, 0);
              const pen  = recs.filter((r) => r.status === "pending").reduce((a, b) => a + b.amount, 0);
              const tot  = recs.reduce((a, b) => a + b.amount, 0);
              const pct  = tot > 0 ? Math.round((col / tot) * 100) : 0;
              const Ic   = iconMap[c.icon] ?? GraduationCap;
              const cc   = colorMap[c.color];
              return (
                <div key={c.id} className="py-3 flex items-center gap-3">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", cc.bg)}>
                    <Ic className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.label}</p>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", cc.bg)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-bold text-emerald-600">₹{col.toLocaleString()}</p>
                    <p className="text-[10px] text-amber-600">₹{pen.toLocaleString()} due</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════ RECORDS ════ */}
      {activeTab === "records" && (
        <>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={tr("adminPages", "searchNameAdm", lang)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {(["all","paid","pending"] as const).map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                    statusFilter === s ? "bg-white shadow-sm text-gray-900" : "text-gray-500")}
                >{s}</button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className={cn("px-4 py-3 flex items-center justify-between", catColor.light)}>
              <div className="flex items-center gap-2">
                <CatIcon className={cn("w-4 h-4", catColor.text)} />
                <p className={cn("font-semibold text-sm", catColor.text)}>{cat.label} — {filtered.length} records</p>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700">
                <Download className="w-3.5 h-3.5" /> {tr("adminPages", "export", lang)}
              </button>
            </div>

            <div className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">{tr("adminPages", "noRecords", lang)}</div>
              ) : filtered.map((rec, i) => {
                const stu = getStudent(rec.studentId);
                const isPaid = rec.status === "paid";
                const isMarking = markingPaid === rec.id;
                return (
                  <motion.div key={rec.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-all cursor-pointer"
                    onClick={() => setSelectedRecord(rec.id)}
                  >
                    <span className="text-xs text-gray-300 font-mono w-5 shrink-0">{i+1}</span>
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                      isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                      {stu?.name.charAt(0) ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{stu?.name ?? rec.studentId}</p>
                      <p className="text-xs text-gray-400">{stu?.class} {stu?.division} · {stu?.admissionNumber}</p>
                      <p className="text-[10px] text-gray-300 mt-0.5">{rec.note}</p>
                    </div>
                    <div className="text-right mr-1 shrink-0">
                      <p className="text-sm font-bold text-gray-900">₹{rec.amount}</p>
                      {isPaid && rec.paidDate
                        ? <p className="text-[10px] text-emerald-600">{rec.paidDate}</p>
                        : <p className="text-[10px] text-amber-600">Due: {rec.dueDate}</p>}
                    </div>
                    <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 min-w-15 text-center",
                      isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                      {isPaid ? "✓ Paid" : "Pending"}
                    </span>
                    {!isPaid && (
                      <button onClick={(e) => { e.stopPropagation(); handleMarkPaid(rec.id); }} className="shrink-0 p-1" title="Mark paid">
                        <CheckCircle className={cn("w-5 h-5 transition-colors",
                          isMarking ? "text-emerald-500" : "text-gray-300 hover:text-emerald-500")} />
                      </button>
                    )}
                    {isPaid && (
                      <button onClick={(e) => { e.stopPropagation(); setShowReceipt(rec.id); }} className="shrink-0 p-1" title="Receipt">
                        <Receipt className="w-4 h-4 text-gray-300 hover:text-blue-500 transition-colors" />
                      </button>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-200 shrink-0" />
                  </motion.div>
                );
              })}
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">{paidRecs.length} paid · {pendingRecs.length} pending</p>
              <div className="flex gap-4 text-xs">
                <span className="text-emerald-600 font-bold">Collected: ₹{totalCollected.toLocaleString()}</span>
                <span className="text-amber-600 font-bold">Pending: ₹{totalPending.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Student Detail Drawer ── */}
      <AnimatePresence>
        {selectedRec && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setSelectedRecord(null)} />
            <motion.div
              initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
              transition={{ type:"spring", damping:28, stiffness:280 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl overflow-y-auto"
            >
              {(() => {
                const stu = getStudent(selectedRec.studentId);
                return (
                  <>
                    <div className={cn("px-5 py-4 flex items-center justify-between", catColor.light)}>
                      <div className="flex items-center gap-2">
                        <CatIcon className={cn("w-5 h-5", catColor.text)} />
                        <p className={cn("font-bold text-base", catColor.text)}>{cat.label}</p>
                      </div>
                      <button onClick={() => setSelectedRecord(null)} className="p-1.5 rounded-lg hover:bg-white/50">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-5 space-y-5">
                      {/* Student Profile */}
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                            {stu?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-base">{stu?.name}</p>
                            <p className="text-xs text-gray-500">{stu?.admissionNumber}</p>
                            <span className="mt-1 inline-block text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                              {stu?.class} – Div {stu?.division}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <ProfileItem icon={User}     label="Father"   value={stu?.fatherName ?? "—"} />
                          <ProfileItem icon={User}     label="Mother"   value={stu?.motherName ?? "—"} />
                          <ProfileItem icon={Phone}    label="Phone"    value={stu?.phone ?? "—"} />
                          <ProfileItem icon={Calendar} label="DOB"      value={stu?.dateOfBirth ?? "—"} />
                          <ProfileItem icon={Calendar} label="Joined"   value={stu?.joiningDate ?? "—"} />
                          <ProfileItem icon={MapPin}   label="Address"  value={stu?.address ?? "—"} />
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Details</p>
                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                          <DetailRow label="Category"  value={cat.label} />
                          <DetailRow label="Amount"    value={`₹${selectedRec.amount}`} bold />
                          <DetailRow label="Status" value={
                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold",
                              selectedRec.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                              {selectedRec.status === "paid" ? "✓ Paid" : "⏳ Pending"}
                            </span>
                          } />
                          <DetailRow label="Due Date"  value={selectedRec.dueDate} />
                          {selectedRec.paidDate && <DetailRow label="Paid On" value={selectedRec.paidDate} />}
                          <DetailRow label="Note"      value={selectedRec.note || "—"} />
                          <DetailRow label="Record ID" value={<span className="font-mono text-xs text-gray-400">{selectedRec.id}</span>} />
                        </div>
                      </div>

                      {/* Full History */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">All Payments – {stu?.name}</p>
                        <div className="space-y-2">
                          {studentAllPayments.map((p) => {
                            const c = otherPaymentCategories.find((x) => x.id === p.category);
                            const Ic = iconMap[c?.icon ?? "GraduationCap"] ?? GraduationCap;
                            const cc = colorMap[c?.color ?? "blue"];
                            return (
                              <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", cc.bg)}>
                                  <Ic className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-800 truncate">{c?.label}</p>
                                  <p className="text-[10px] text-gray-400">{p.paidDate ?? `Due: ${p.dueDate}`}</p>
                                </div>
                                <p className="text-sm font-bold text-gray-900 shrink-0">₹{p.amount}</p>
                                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                                  p.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                                  {p.status === "paid" ? "Paid" : "Pending"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3 bg-gray-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-[10px] text-gray-400">Paid</p>
                            <p className="text-sm font-bold text-emerald-600">
                              ₹{studentAllPayments.filter((p) => p.status === "paid").reduce((a, b) => a + b.amount, 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400">Pending</p>
                            <p className="text-sm font-bold text-amber-600">
                              ₹{studentAllPayments.filter((p) => p.status === "pending").reduce((a, b) => a + b.amount, 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400">Total</p>
                            <p className="text-sm font-bold text-gray-900">
                              ₹{studentAllPayments.reduce((a, b) => a + b.amount, 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        {selectedRec.status !== "paid" && (
                          <button onClick={() => handleMarkPaid(selectedRec.id)}
                            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4" /> Mark as Paid
                          </button>
                        )}
                        {selectedRec.status === "paid" && (
                          <button onClick={() => { setShowReceipt(selectedRec.id); setSelectedRecord(null); }}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 text-sm">
                            <Receipt className="w-4 h-4" /> View Receipt
                          </button>
                        )}
                        <button onClick={() => setSelectedRecord(null)}
                          className="py-3 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
                          Close
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Receipt Modal ── */}
      <AnimatePresence>
        {receiptRec && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setShowReceipt(null)} />
            <motion.div initial={{ scale:0.94, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.94, opacity:0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {(() => {
                const stu = getStudent(receiptRec.studentId);
                const c   = otherPaymentCategories.find((x) => x.id === receiptRec.category);
                return (
                  <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
                    <div className="bg-emerald-600 px-6 py-5 text-white text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <Receipt className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-bold text-lg">Payment Receipt</p>
                      <p className="text-emerald-100 text-xs">Darul Huda Madrasa</p>
                    </div>
                    <div className="px-6 py-5 space-y-3">
                      <ReceiptRow label="Receipt No"   value={receiptRec.id} mono />
                      <ReceiptRow label="Student"      value={stu?.name ?? "—"} />
                      <ReceiptRow label="Adm. No."     value={stu?.admissionNumber ?? "—"} />
                      <ReceiptRow label="Class"        value={`${stu?.class} – Div ${stu?.division}`} />
                      <ReceiptRow label="Father"       value={stu?.fatherName ?? "—"} />
                      <div className="border-t border-dashed border-gray-200 my-1" />
                      <ReceiptRow label="Category"     value={c?.label ?? "—"} />
                      <ReceiptRow label="Description"  value={receiptRec.note} />
                      <ReceiptRow label="Paid On"      value={receiptRec.paidDate ?? "—"} />
                      <div className="border-t border-dashed border-gray-200 my-1" />
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-gray-900">Amount Paid</p>
                        <p className="text-2xl font-bold text-emerald-600">₹{receiptRec.amount.toLocaleString()}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-2 mt-1">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        <p className="text-sm font-semibold text-emerald-700">Payment Confirmed</p>
                      </div>
                    </div>
                    <div className="px-6 pb-5 flex gap-3">
                      <button onClick={() => setShowReceipt(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">Close</button>
                      <button className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Download
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Add Campaign Modal ── */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Plus className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="font-bold text-gray-900 text-lg">New Payment Campaign</p>
                  </div>
                  <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="space-y-4">
                  <Field label="Campaign Title"           placeholder="e.g. Annual Building Fund" />
                  <Field label="Category"                 type="select" options={otherPaymentCategories.map((c) => c.label)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Amount per Student (₹)" placeholder="200" type="number" />
                    <Field label="Due Date"                type="date" />
                  </div>
                  <Field label="Target Classes"           type="select" options={["All Classes","Class 2","Class 3","Class 4"]} />
                  <Field label="Description / Note"       placeholder="Optional details..." />
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowAdd(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">Cancel</button>
                  <button onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold">Create Campaign</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function MiniStat({ label, value, sub, color }: { label:string; value:string; sub:string; color?:string }) {
  return (
    <div className="bg-white/60 rounded-xl p-2.5 text-center">
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className={cn("text-base font-bold", color ?? "text-gray-900")}>{value}</p>
      <p className="text-[10px] text-gray-400">{sub}</p>
    </div>
  );
}

function ProfileItem({ icon:Icon, label, value }: { icon:React.ElementType; label:string; value:string }) {
  return (
    <div className="bg-white rounded-lg p-2.5">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="w-3 h-3 text-gray-400" />
        <p className="text-[9px] text-gray-400 font-semibold uppercase">{label}</p>
      </div>
      <p className="text-xs font-semibold text-gray-800 truncate">{value}</p>
    </div>
  );
}

function DetailRow({ label, value, bold }: { label:string; value:React.ReactNode; bold?:boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <div className={cn("text-sm text-gray-900 text-right", bold && "font-bold")}>{value}</div>
    </div>
  );
}

function ReceiptRow({ label, value, mono }: { label:string; value:string; mono?:boolean }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <p className="text-xs text-gray-400 shrink-0">{label}</p>
      <p className={cn("text-xs font-semibold text-gray-900 text-right", mono && "font-mono text-gray-500")}>{value}</p>
    </div>
  );
}

function Field({ label, placeholder, type="text", options }: { label:string; placeholder?:string; type?:string; options?:string[] }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {type === "select" ? (
        <select className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
          {options?.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} placeholder={placeholder}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      )}
    </div>
  );
}
