import type { ReactNode } from "react";

type BrandCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
};

export function BrandCard({
  children,
  className = "",
  hover = false,
}: BrandCardProps) {
  return (
    <div
      className={`
        ${hover ? "ht-card-hover" : "ht-card"}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
