"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { students, attendanceRecords } from "@/mock-data";
import { useLanguageStore } from "@/store/language";
import { t } from "@/lib/i18n";

function getLatestDate(records: { date: string }[]) {
  if (!records.length) return null;
  return records.map(r => r.date).sort().pop();
}

export default function AdminPresentPage() {
  const { lang } = useLanguageStore();
  const latest = getLatestDate(attendanceRecords) || "";
  // flatten records for the latest date
  const latestGroups = attendanceRecords.filter(r => r.date === latest);
  const presentIds: string[] = [];
  latestGroups.forEach(g => {
    g.records.forEach((rec: { studentId: string; status: string }) => {
      if (rec.status === "present") presentIds.push(rec.studentId);
    });
  });
  const list = students.filter(s => presentIds.includes(s.id));

  return (
    <DashboardLayout>
      <PageHeader title={t("adminPages", "presentTitle", lang)} subtitle={latest ? `${t("common", "date", lang)}: ${latest}` : ""} />
      <div className="bg-white rounded-2xl p-4 border border-gray-100 mt-4">
        <div className="grid gap-2">
          {list.map(s => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
              <div>
                <div className="font-medium text-gray-900">{s.name}</div>
                <div className="text-xs text-gray-500">{s.class}</div>
              </div>
              <div className="text-sm text-emerald-600 font-semibold">{t("common", "present", lang)}</div>
            </div>
          ))}
          {list.length === 0 && <div className="text-sm text-gray-500">{t("common", "noResults", lang)}</div>}
        </div>
      </div>
    </DashboardLayout>
  );
}
