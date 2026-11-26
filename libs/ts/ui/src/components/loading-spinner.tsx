import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function LoadingSpinner({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-24 text-slate-400',
        className,
      )}
    >
      <Loader2 className="size-6 animate-spin text-rose-500" />
      {label && <p className="text-xs font-semibold">{label}</p>}
    </div>
  );
}
