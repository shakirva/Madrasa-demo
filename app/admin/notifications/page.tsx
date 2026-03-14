"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader, SectionHeader } from "@/components/ui/PageHeader";
import { notifications, teachers, parents } from "@/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Send, Users, BookOpen, ClipboardList, GraduationCap, CreditCard, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  attendance: { icon: ClipboardList, color: "text-emerald-700", bg: "bg-emerald-100" },
  homework:   { icon: BookOpen,      color: "text-blue-700",    bg: "bg-blue-100"    },
  exam:       { icon: GraduationCap, color: "text-purple-700",  bg: "bg-purple-100"  },
  fee:        { icon: CreditCard,    color: "text-amber-700",   bg: "bg-amber-100"   },
  diary:      { icon: FileText,      color: "text-teal-700",    bg: "bg-teal-100"    },
  general:    { icon: Bell,          color: "text-gray-700",    bg: "bg-gray-100"    },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminNotificationsPage() {
  const [items, setItems] = useState(notifications);
  const [showCompose, setShowCompose] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", audience: "all" });

  const unread = items.filter((n) => !n.read).length;
  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOne = (id: string) => setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const handleSend = () => {
    setSent(true);
    setTimeout(() => { setSent(false); setShowCompose(false); setForm({ title: "", message: "", audience: "all" }); }, 1800);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : "All read"}
        icon={Bell}
        action={
          <button onClick={() => setShowCompose(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold"
          >
            <Send className="w-4 h-4" />Send
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-gray-900">{items.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-emerald-600">{unread}</p>
          <p className="text-xs text-gray-500">Unread</p>
        </div>
        <div className="bg-white rounded-2xl p-3 text-center border border-gray-100">
          <p className="text-xl font-bold text-blue-600">{teachers.length + parents.length}</p>
          <p className="text-xs text-gray-500">Recipients</p>
        </div>
      </div>

      {unread > 0 && (
        <button onClick={markAllRead} className="mb-4 text-sm text-emerald-700 font-semibold underline underline-offset-2">
          Mark all as read
        </button>
      )}

      <SectionHeader title="All Notifications" className="mb-3" />
      <div className="space-y-3">
        {items.map((notif, i) => {
          const cfg = typeConfig[notif.type] ?? typeConfig.general;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => markOne(notif.id)}
              className={cn(
                "bg-white rounded-2xl p-4 border flex gap-3 cursor-pointer",
                !notif.read ? "border-emerald-200 bg-emerald-50/30" : "border-gray-100"
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", cfg.bg)}>
                <Icon className={cn("w-5 h-5", cfg.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm">{notif.title}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                    <span className="text-xs text-gray-400">{timeAgo(notif.timestamp)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
          >
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-900 text-lg">Send Notification</h3>
                <button onClick={() => setShowCompose(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Send To</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "all", label: "Everyone", icon: Users },
                      { value: "parents", label: "Parents", icon: Users },
                      { value: "teachers", label: "Teachers", icon: BookOpen },
                    ].map((opt) => (
                      <button key={opt.value} onClick={() => setForm((f) => ({ ...f, audience: opt.value }))}
                        className={cn("py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1",
                          form.audience === opt.value ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600")}
                      >
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Title</label>
                  <input
                    type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Notification title..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Message</label>
                  <textarea
                    value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Write your message..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 resize-none"
                  />
                </div>
                <button onClick={handleSend}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  {sent ? "✓ Notification Sent!" : <><Send className="w-4 h-4" />Send to {form.audience === "all" ? "Everyone" : form.audience === "parents" ? "All Parents" : "All Teachers"}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
