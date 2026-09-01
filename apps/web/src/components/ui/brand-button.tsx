import type { ButtonHTMLAttributes } from "react";

type BrandButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
  };

export function BrandButton({
  variant = "primary",
  className = "",
  ...props
}: BrandButtonProps) {
  const variants = {
    primary: `
      bg-rose-600
      text-white
      hover:bg-rose-500
      shadow-lg
      shadow-rose-950/30
    `,

    secondary: `
      bg-white/[0.04]
      text-zinc-200
      border
      border-white/[0.08]
      hover:bg-white/[0.08]
      hover:border-white/[0.12]
    `,

    ghost: `
      text-zinc-400
      hover:text-white
      hover:bg-white/[0.04]
    `,
  };

  return (
    <button
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        px-4
        py-2.5
        text-sm
        font-semibold
        transition-all
        ht-focus
        ${variants[variant]}
        ${className}
      `}
      {...props}
    />
  );
}
