import type { ReactNode } from "react";

interface GameHeaderProps {
  title: ReactNode;
  score: number;
  streak: number;
}

export function GameHeader({ title, score, streak }: GameHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-4 flex-wrap gap-2">
      <h1 className="text-2xl font-bold m-0 flex items-center gap-2">{title}</h1>
      <div className="flex gap-3 font-semibold text-primary text-sm">
        <span>ניקוד: {score}</span>
        <span>רצף: {streak}</span>
      </div>
    </header>
  );
}
