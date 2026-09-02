import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BrandHeroProps = {
  children: ReactNode;
  className?: string;
};

export function BrandHero({ children, className }: BrandHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-slate-800/80 bg-slate-900/80 backdrop-blur-xl p-8 sm:p-12 text-center shadow-2xl flex flex-col items-center gap-3",
        className
      )}
    >
      {children}
    </section>
  );
}