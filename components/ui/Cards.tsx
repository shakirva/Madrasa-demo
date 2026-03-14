"use client";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
}

export function StatCard({ title, value, icon: Icon, iconColor = "text-emerald-600", iconBg = "bg-emerald-50", trend, trendUp, subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <p className={cn("text-xs font-medium mt-1", trendUp ? "text-emerald-600" : "text-red-500")}>
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconBg)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
      </div>
    </div>
  );
}

interface ActionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  onClick?: () => void;
  color?: "emerald" | "teal" | "amber" | "rose" | "blue" | "purple";
  badge?: string | number;
}

const colorMap = {
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100", badge: "bg-emerald-500" },
  teal:    { bg: "bg-teal-50",    icon: "text-teal-600",    border: "border-teal-100",    badge: "bg-teal-500" },
  amber:   { bg: "bg-amber-50",   icon: "text-amber-600",   border: "border-amber-100",   badge: "bg-amber-500" },
  rose:    { bg: "bg-rose-50",    icon: "text-rose-600",    border: "border-rose-100",    badge: "bg-rose-500" },
  blue:    { bg: "bg-blue-50",    icon: "text-blue-600",    border: "border-blue-100",    badge: "bg-blue-500" },
  purple:  { bg: "bg-purple-50",  icon: "text-purple-600",  border: "border-purple-100",  badge: "bg-purple-500" },
};

export function ActionCard({ title, description, icon: Icon, onClick, color = "emerald", badge }: ActionCardProps) {
  const c = colorMap[color];
  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl p-5 shadow-sm border text-left w-full card-hover active:scale-95 transition-all",
        c.border
      )}
    >
      <div className="relative w-fit">
        <div className={cn("p-3 rounded-xl mb-3", c.bg)}>
          <Icon className={cn("w-7 h-7", c.icon)} />
        </div>
        {badge !== undefined && (
          <span className={cn("absolute -top-1 -right-1 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center", c.badge)}>
            {badge}
          </span>
        )}
      </div>
      <p className="font-semibold text-gray-900 text-base">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
    </button>
  );
}
