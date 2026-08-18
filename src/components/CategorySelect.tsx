import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategoryLabel } from "@/lib/wordsDb";
import type { CategoryKey } from "@/types";

interface CategorySelectProps {
  categories: CategoryKey[];
  value: CategoryKey;
  onChange: (value: CategoryKey) => void;
}

export function CategorySelect({ categories, value, onChange }: CategorySelectProps) {
  return (
    <div className="flex items-center gap-2 mb-5 text-sm text-muted-foreground">
      <label htmlFor="category">קטגוריה:</label>
      <Select value={value} onValueChange={(v) => onChange(v as CategoryKey)}>
        <SelectTrigger id="category" className="flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map((key) => (
            <SelectItem key={key} value={key}>
              {getCategoryLabel(key)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
