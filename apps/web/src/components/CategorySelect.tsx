import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getBandLabel, getCategoryBand, getCategoryLabel } from "@learn-english/shared";
import type { CategoryKey } from "@learn-english/shared";

interface CategorySelectProps {
  categories: CategoryKey[];
  value: CategoryKey;
  onChange: (value: CategoryKey) => void;
  // If provided, categories not in this list render disabled/locked
  // instead of being selectable (band-gating).
  unlockedCategories?: CategoryKey[];
}

export function CategorySelect({ categories, value, onChange, unlockedCategories }: CategorySelectProps) {
  return (
    <div className="flex items-center gap-2 mb-5 text-sm text-muted-foreground">
      <label htmlFor="category">קטגוריה:</label>
      <Select value={value} onValueChange={(v) => onChange(v as CategoryKey)}>
        <SelectTrigger id="category" className="flex-1 data-[size=default]:h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map((key) => {
            const locked = !!unlockedCategories && !unlockedCategories.includes(key);
            return (
              <SelectItem key={key} value={key} disabled={locked}>
                {locked ? `🔒 ${getCategoryLabel(key)} (${getBandLabel(getCategoryBand(key))})` : getCategoryLabel(key)}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
