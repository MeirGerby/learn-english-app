import { useState } from "react";
import { Link } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { BandBadge } from "@/components/BandBadge";
import { useAchievements } from "@/hooks/useAchievements";
import { usePlacement } from "@/hooks/usePlacement";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ACHIEVEMENTS } from "@/lib/userStats";
import { getBandLabel } from "@/lib/wordsDb";
import { cn } from "@/lib/utils";
import type { Band } from "@/types";

const GAMES: { href: string; icon: string; title: string; desc: string; minBand: Band }[] = [
  // Band 1
  {
    href: "/games/flashcards",
    icon: "🗂️",
    title: "כרטיסיות וחידון",
    desc: "הפכו כרטיסיות כדי ללמוד מילים חדשות, ואז התאמנו עם חידון אמריקאי.",
    minBand: 1,
  },
  {
    href: "/games/scramble",
    icon: "🔤",
    title: "ערבוב מילים",
    desc: "סדרו מחדש את האותיות המעורבבות כדי לגלות את המילה לפני שנגמרים הרמזים.",
    minBand: 1,
  },
  {
    href: "/games/speed-round",
    icon: "⏱️",
    title: "סבב מהיר",
    desc: "ענו נכון כמה שיותר מהר לפני שהזמן נגמר - חידון קצב, נעל קטגוריות לפי הרמה שלכם.",
    minBand: 1,
  },
  // Band 2
  {
    href: "/games/word-match",
    icon: "🧩",
    title: "התאמת מילים",
    desc: "התאימו כל מילה באנגלית לתרגום שלה בעברית - תרגול זיכרון והכרה.",
    minBand: 2,
  },
  {
    href: "/games/type-word",
    icon: "⌨️",
    title: "כתבו את המילה",
    desc: "קבלו את התרגום ואת המשפט, וכתבו את המילה באנגלית מהזיכרון.",
    minBand: 2,
  },
  {
    href: "/games/sentence-builder",
    icon: "🧱",
    title: "בניית משפטים",
    desc: "סדרו מילים מעורבבות כדי לבנות משפט נכון - תרגול תחביר והקשר.",
    minBand: 2,
  },
  // Band 3
  {
    href: "/games/fill-blank",
    icon: "✏️",
    title: "השלמת משפטים",
    desc: "השלימו את המילה החסרה במשפט - ניבים, פעלים דו-מיליים ואוצר מילים מתקדם.",
    minBand: 3,
  },
  {
    href: "/games/listening",
    icon: "🎧",
    title: "אתגר האזנה",
    desc: "הקשיבו למילה או לניב וכתבו את מה ששמעתם - תרגול הבנת הנשמע.",
    minBand: 3,
  },
];

export default function GamesListPage() {
  useDocumentTitle("משחקים");
  const { stats, loading, loggedIn } = useAchievements();
  const { user, admin, unlockedBand, loading: placementLoading } = usePlacement();
  const [expandedAchievementId, setExpandedAchievementId] = useState<string | null>(null);
  const [expandedGameHref, setExpandedGameHref] = useState<string | null>(null);

  return (
    <div className="app mx-auto max-w-3xl w-full px-4 py-6">
      <TopBar backTo={{ href: "/", label: "🏠 חזרה לדף הבית" }} />

      <p className="text-center text-muted-foreground font-semibold mb-1">בחרו איך להתחיל ללמוד:</p>

      {user && !admin && !placementLoading && (
        <p className="text-center text-sm text-muted-foreground mb-3">
          הרמה שלכם: <span className="font-semibold text-foreground">{getBandLabel(unlockedBand)}</span>{" "}
          ·{" "}
          <Link to="/placement-test" className="text-primary hover:underline">
            מבחן רמה מחדש
          </Link>
        </p>
      )}
      {!user && (
        <p className="text-center text-sm text-muted-foreground mb-3">
          <Link to="/login" className="text-primary hover:underline">
            התחברו
          </Link>{" "}
          ועברו מבחן רמה כדי לפתוח את כל התכנים המתאימים לכם
        </p>
      )}

      <main className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 items-start">
        {GAMES.map((game) => {
          const locked = !placementLoading && game.minBand > unlockedBand;
          const isExpanded = expandedGameHref === game.href;
          const descId = `game-desc-${game.href}`;
          return (
            <div
              key={game.href}
              className={cn(
                "relative flex flex-col rounded-2xl bg-card border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all",
                locked && "opacity-70"
              )}
            >
              <Link
                to={game.href}
                className="flex flex-col items-center text-center gap-1.5 p-3 sm:p-4 no-underline text-foreground"
              >
                {game.minBand > 1 ? (
                  <div className="flex items-center gap-1">
                    <BandBadge band={game.minBand} />
                    {locked && <span title="נדרשת רמה גבוהה יותר">🔒</span>}
                  </div>
                ) : (
                  <div className="h-5" />
                )}
                <span className="text-3xl sm:text-4xl">{game.icon}</span>
                <span className="text-sm sm:text-base font-bold text-primary leading-tight">{game.title}</span>
              </Link>
              <button
                type="button"
                title={game.desc}
                aria-label={locked ? "מידע על המשחק ועל הנעילה" : "מידע על המשחק"}
                aria-expanded={isExpanded}
                aria-controls={descId}
                onClick={() => setExpandedGameHref(isExpanded ? null : game.href)}
                className="absolute top-1 end-1 min-w-8 min-h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
              >
                ⓘ
              </button>
              {isExpanded && (
                <p id={descId} className="text-xs text-muted-foreground text-center px-3 pb-3 -mt-1">
                  {locked && (
                    <span className="block font-semibold text-foreground mb-1">
                      🔒 נדרשת רמה גבוהה יותר
                    </span>
                  )}
                  {game.desc}
                </p>
              )}
            </div>
          );
        })}
      </main>

      {loggedIn && (
        <section className="mt-5">
          <div className="mb-2.5">
            <p className="text-center text-muted-foreground font-semibold text-sm">
              {loading ? "טוען הישגים..." : `ניקוד מצטבר בחשבון: ${stats?.totalScore ?? 0} · ההישגים שלי`}
            </p>
            {!loading && (stats?.bestStreak ?? 0) > 0 && (
              <p className="text-center text-muted-foreground text-xs mt-0.5">
                השיא שלך: {stats?.bestStreak} תשובות נכונות ברצף
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = stats?.achievements?.includes(ach.id) ?? false;
              const isExpanded = expandedAchievementId === ach.id;
              const descId = `achievement-desc-${ach.id}`;
              return (
                <div key={ach.id} className="flex flex-col items-center gap-1 max-w-[9rem]">
                  <button
                    type="button"
                    title={ach.descHe}
                    aria-expanded={isExpanded}
                    aria-controls={descId}
                    onClick={() => setExpandedAchievementId(isExpanded ? null : ach.id)}
                    className={cn(
                      "text-sm font-semibold px-3 py-1.5 rounded-full border transition-colors",
                      unlocked ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-muted border-border text-muted-foreground opacity-60",
                      isExpanded && "ring-2 ring-primary"
                    )}
                  >
                    {ach.icon} {ach.nameHe}
                  </button>
                  {isExpanded && (
                    <p id={descId} className="text-xs text-muted-foreground text-center">
                      {ach.descHe}
                      {!unlocked && stats != null && ach.progress && (() => {
                        const { current, target } = ach.progress(stats);
                        return (
                          <span className="block mt-0.5">
                            התקדמות: {Math.min(current, target)} מתוך {target}
                          </span>
                        );
                      })()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
