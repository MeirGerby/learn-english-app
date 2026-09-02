import { useEffect, useState } from "react";
import { BookOpen, ListTree } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { loadWords } from "@/lib/wordsDb";
import { getBandLabel, getCategoryBand, getCategoryLabel } from "@learn-english/shared";
import type { CategoryKey, WordEntry } from "@learn-english/shared";

interface WordListDialogProps {
  category: CategoryKey;
}

export function WordListDialog({ category }: WordListDialogProps) {
  const [open, setOpen] = useState(false);
  const [words, setWords] = useState<WordEntry[] | null>(null);

  useEffect(() => {
    if (!open) return;
    setWords(null);
    let cancelled = false;
    loadWords(category).then((data) => {
      if (!cancelled) setWords(data);
    });
    return () => {
      cancelled = true;
    };
  }, [open, category]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        type="button"
        className="inline-flex items-center gap-1.5 h-11 px-3 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white text-xs sm:text-sm font-medium whitespace-nowrap transition-colors"
      >
        <ListTree className="w-4 h-4 shrink-0" />
        <span>כל המילים</span>
      </DialogTrigger>

      <DialogContent>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />
          <DialogTitle>
            כל המילים · {getCategoryLabel(category)}
          </DialogTitle>
        </div>
        <DialogDescription className="mb-4">
          {getBandLabel(getCategoryBand(category))} · {words ? `${words.length} מילים` : "טוען..."}
        </DialogDescription>

        <div className="overflow-y-auto -mx-2 px-2">
          {words === null ? (
            <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">טוען מילים...</p>
          ) : words.length === 0 ? (
            <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">
              לא נמצאו מילים בקטגוריה זו.
            </p>
          ) : (
            <ul className="space-y-1">
              {words.map((w, i) => (
                <li
                  key={`${w.word}-${i}`}
                  className="flex items-center justify-between gap-3 text-sm py-1.5 px-2 rounded-lg odd:bg-slate-50 dark:odd:bg-slate-800/40"
                >
                  <span dir="ltr" lang="en" className="font-medium text-slate-900 dark:text-white">
                    {w.word}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-end">{w.translation}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
