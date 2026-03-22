"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { feesRecords, students } from "@/mock-data";
import { useSearchParams } from "next/navigation";

function getStudent(id: string) {
  return students.find((s) => s.id === id);
}

export default function AdminFeesPaidPage() {
  const sp = useSearchParams();
  const month = sp?.get("month") || "";
  const cls = sp?.get("class") || "All Classes";

  const monthRecords = feesRecords.filter((f) => (month ? f.month === month : true));
  const classFiltered = monthRecords.filter((f) => {
    if (cls === "All Classes") return true;
    return getStudent(f.studentId)?.class === cls;
  });

  const paid = classFiltered.filter((f) => f.status === "paid");

  return (
    <DashboardLayout>
      <PageHeader title="Paid Fees" subtitle={month || "All months"} />
      <div className="bg-white rounded-2xl p-4 border border-gray-100 mt-4">
        {paid.length === 0 ? (
          <div className="text-sm text-gray-500">No paid records found.</div>
        ) : (
          <div className="space-y-2">
            {paid.map((f) => {
              const s = getStudent(f.studentId);
              return (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                  <div>
                    <div className="font-semibold text-gray-900">{s?.name}</div>
                    <div className="text-xs text-gray-500">{s?.class} · ₹{f.amount} · {f.month}</div>
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold">Paid</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
