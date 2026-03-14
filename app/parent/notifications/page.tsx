"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { notifications } from "@/mock-data";
import { motion } from "framer-motion";
import { Bell, BookOpen, ClipboardList, GraduationCap, CreditCard, FileText } from "lucide-react";
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

export default function ParentNotificationsPage() {
  const [items, setItems] = useState(notifications);
  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOne = (id: string) => setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  return (
    <DashboardLayout>
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : "All read"}
        icon={Bell}
        back
        action={
          unread > 0 ? (
            <button onClick={markAllRead} className="text-sm text-emerald-700 font-semibold px-3 py-1.5 bg-emerald-50 rounded-xl">
              Mark all read
            </button>
          ) : undefined
        }
      />

      <div className="space-y-3">
        {items.map((notif, i) => {
          const cfg = typeConfig[notif.type] ?? typeConfig.general;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => markOne(notif.id)}
              className={cn(
                "bg-white rounded-2xl p-4 border flex gap-3 cursor-pointer active:scale-[0.99] transition-transform",
                !notif.read ? "border-emerald-200 bg-emerald-50/30" : "border-gray-100"
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", cfg.bg)}>
                <Icon className={cn("w-5 h-5", cfg.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm leading-tight">{notif.title}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                    <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(notif.timestamp)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-0.5 leading-snug">{notif.message}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
