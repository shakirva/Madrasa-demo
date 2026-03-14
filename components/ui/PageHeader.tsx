"use client";
import { cn } from "@/lib/utils";
import { LucideIcon, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  back?: boolean;
  backHref?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon: Icon, back, backHref, action }: PageHeaderProps) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {back && (
          <button
            onClick={() => backHref ? router.push(backHref) : router.back()}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        {Icon && (
          <div className="p-2.5 bg-emerald-50 rounded-xl">
            <Icon className="w-6 h-6 text-emerald-600" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)}>
      <h2 className="text-base font-semibold text-gray-700">{title}</h2>
      {action}
    </div>
  );
}
