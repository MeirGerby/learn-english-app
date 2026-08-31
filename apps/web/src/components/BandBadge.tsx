import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getBandLabel } from "@learn-english/shared";
import type { Band } from "@learn-english/shared";

const BAND_STYLES: Record<Band, string> = {
  1: "bg-gradient-to-br from-emerald-500 to-emerald-600",
  2: "bg-gradient-to-br from-sky-500 to-sky-600",
  3: "bg-gradient-to-br from-amber-500 to-amber-600",
};

export function BandBadge({ band }: { band: Band }) {
  return <Badge className={cn(BAND_STYLES[band], "text-white border-0")}>{getBandLabel(band)}</Badge>;
}
