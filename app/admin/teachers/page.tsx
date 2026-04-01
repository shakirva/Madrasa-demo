"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { teachers } from "@/mock-data";
import { useLanguageStore } from "@/store/language";
import { t as tr } from "@/lib/i18n";

export default function AdminTeachersPage() {
  const { lang } = useLanguageStore();
  return (
    <DashboardLayout>
      <PageHeader title={tr("adminPages", "teachersTitle", lang)} subtitle={`${tr("common", "total", lang)} ${teachers.length}`} />
      <div className="bg-white rounded-2xl p-4 border border-gray-100 mt-4">
        <div className="grid gap-2">
          {teachers.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
              <div>
                <div className="font-medium text-gray-900">{t.name}</div>
                <div className="text-xs text-gray-500">{t.subject} • {t.classes.join(", ")}</div>
              </div>
              <div className="text-sm text-gray-500">{t.phone}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
