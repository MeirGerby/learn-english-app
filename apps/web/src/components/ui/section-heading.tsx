type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="text-center space-y-1">
      {eyebrow && (
        <span className="text-[11px] font-bold text-rose-400 tracking-widest uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl font-black text-white">{title}</h2>
      {description && <p className="text-sm text-zinc-400">{description}</p>}
    </div>
  );
}