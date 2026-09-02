import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BrandBadgeProps = {
  children: ReactNode;
  icon?: LucideIcon;
  className?: string;
};

export function BrandBadge({ children, icon: Icon, className }: BrandBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/60 text-slate-300 border border-slate-700/60",
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{children}</span>
    </span>
  );
}