import type { ReactNode } from "react";
import { Trophy, Flame } from "lucide-react";

export function GameHeader({ title, score, streak }: { title: ReactNode; score: number; streak: number }) {
  return (
    <header className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
      <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">{title}</h1>
      <div className="flex items-center gap-3 text-xs font-bold">
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-amber-400">
          <Trophy className="w-3.5 h-3.5" />
          <span>{score}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-rose-400">
          <Flame className="w-3.5 h-3.5" />
          <span>{streak}</span>
        </div>
      </div>
    </header>
  );
}