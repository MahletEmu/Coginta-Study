import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  trend,
  icon: Icon,
  iconColor = "text-violet-600",
  iconBg = "bg-violet-50",
}: StatCardProps) {
  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between hover:border-stone-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 tracking-wider">
          {label}
        </span>
        <div className={cn("p-2 rounded-xl", iconBg, iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </span>
          {trend && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {trend}
            </span>
          )}
        </div>
        {subtext && (
          <p className="text-xs text-slate-500 mt-1">
            {subtext}
          </p>
        )}
      </div>
    </Card>
  );
}
