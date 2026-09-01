import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getBandLabel } from "@learn-english/shared";
import type { Band } from "@learn-english/shared";

const BAND_STYLES: Record<Band, string> = {
  1: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  2: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  3: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export function BandBadge({ band }: { band: Band }) {
  return (
    <Badge className={cn(BAND_STYLES[band], "border font-bold text-xs px-2.5 py-0.5 rounded-md shadow-none")}>
      {getBandLabel(band)}
    </Badge>
  );
}