import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { BrandIcon } from "@/components/ui/brand-icon";
import { cn } from "@/lib/utils";

export type BrandActionCardProps = {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "primary" | "secondary";
  badgeText?: string;
  className?: string; // Add this line
};

export function BrandActionCard({
  to,
  icon,
  title,
  description,
  variant = "secondary",
  badgeText,
  className, // Destructure className
}: BrandActionCardProps) {
  const isPrimary = variant === "primary";

  return (
    <Link
      to={to}
      className={cn(
        "group relative flex items-center justify-between p-5 sm:p-6 rounded-2xl border transition-all duration-200",
        isPrimary
          ? "bg-gradient-to-r from-rose-50 via-white to-white border-rose-200 shadow-sm hover:border-rose-300 dark:from-rose-950/40 dark:via-slate-900/80 dark:to-slate-900/80 dark:border-rose-900/40 dark:shadow-xl dark:hover:border-rose-500/40"
          : "ht-card-hover",
        className // Merge custom className here
      )}
    >
      <div className="flex items-center gap-4 sm:gap-5">
        <BrandIcon icon={icon} size="lg" />
        <div className="flex flex-col gap-1">
          {badgeText && (
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              {badgeText}
            </span>
          )}
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>

      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400 group-hover:text-white group-hover:bg-rose-600 transition-all shrink-0 mr-3">
        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
      </div>
    </Link>
  );
}