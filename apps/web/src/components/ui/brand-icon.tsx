import type { LucideIcon } from "lucide-react";

type BrandIconProps = {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
};

export function BrandIcon({
  icon: Icon,
  size = "md",
}: BrandIconProps) {
  const sizes = {
    sm: "w-9 h-9 rounded-lg",
    md: "w-11 h-11 rounded-xl",
    lg: "w-14 h-14 rounded-2xl",
  };

  return (
    <div
      className={`
        flex
        items-center
        justify-center
        shrink-0
        ${sizes[size]}
        bg-rose-500/[0.08]
        border
        border-rose-500/[0.12]
      `}
    >
      <Icon className="w-5 h-5 text-rose-400" />
    </div>
  );
}
