import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({
  children,
  className = "",
}: PageShellProps) {
  return (
    <div dir="rtl" className={`ht-page ${className}`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="
            absolute
            top-[-250px]
            left-1/2
            -translate-x-1/2
            w-[800px]
            h-[600px]
            rounded-full
            bg-rose-600/[0.08]
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            bottom-[-250px]
            right-[-150px]
            w-[500px]
            h-[500px]
            rounded-full
            bg-rose-500/[0.04]
            blur-[130px]
          "
        />
      </div>

      <div className={`ht-container ${className}`}>
        {children}
      </div>
    </div>
  );
}

