"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { notifications } from "@/mock-data";
import { Bell, BookOpen, ClipboardList, GraduationCap, CreditCard, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language";
import { t } from "@/lib/i18n";

const typeConfig = {
  attendance: { icon: ClipboardList, color: "bg-emerald-50 text-emerald-600" },
  homework: { icon: BookOpen, color: "bg-blue-50 text-blue-600" },
  exam: { icon: GraduationCap, color: "bg-purple-50 text-purple-600" },
  fee: { icon: CreditCard, color: "bg-amber-50 text-amber-600" },
  diary: { icon: FileText, color: "bg-teal-50 text-teal-600" },
  announcement: { icon: Bell, color: "bg-gray-50 text-gray-600" },
};

export default function NotificationsPage() {
  const { lang } = useLanguageStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      <PageHeader
        title={t("notif", "title", lang)}
        subtitle={unread > 0 ? `${unread} ${t("notif", "unread", lang)}` : t("notif", "allCaughtUp", lang)}
        icon={Bell}
      />

      <div className="space-y-3">
        {notifications.map((notif, i) => {
          const cfg = typeConfig[notif.type as keyof typeof typeConfig] ?? typeConfig.announcement;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={cn("bg-white rounded-2xl p-4 border flex items-start gap-3", !notif.read ? "border-emerald-200 bg-emerald-50/30" : "border-gray-100")}
            >
              <div className={cn("p-2.5 rounded-xl shrink-0", cfg.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm font-semibold", !notif.read ? "text-gray-900" : "text-gray-700")}>{notif.title}</p>
                  {!notif.read && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-1.5" />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1.5">{new Date(notif.timestamp).toLocaleString(lang === "ml" ? "ml-IN" : "en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
