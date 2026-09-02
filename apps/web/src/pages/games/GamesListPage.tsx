import { useState } from "react";
import { Link } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { BandBadge } from "@/components/BandBadge";
import { usePlacement } from "@/hooks/usePlacement";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/lib/utils";
import { getBandLabel, ACHIEVEMENTS } from "@learn-english/shared";
import type { Band } from "@learn-english/shared";
import { Lock, Info, Sparkles, RefreshCw, Trophy, Flame } from "lucide-react";

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
  useDocumentTitle("משחקים | הודיה ג'רבי");
  const { user, admin, unlockedBand, stats, loading: placementLoading } = usePlacement();
  const loggedIn = !!user;
  const [expandedAchievementId, setExpandedAchievementId] = useState<string | null>(null);
  const [expandedGameHref, setExpandedGameHref] = useState<string | null>(null);

  return (
    <div
      dir="rtl"
      className="
        ht-page
        font-sans
        selection:bg-rose-500
        selection:text-white
        pb-24
      "
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-4 flex flex-col gap-6">
        <TopBar backTo={{ href: "/", label: "חזרה לדף הבית" }} />

        {/* =====================================================
            LEVEL STATUS BANNER
        ====================================================== */}
        <section className="ht-card p-6 text-center">
          <div className="inline-flex items-center gap-2 mb-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400">
            <Sparkles className="w-3.5 h-3.5" />
            בחרו משחק כדי להתחיל לתרגל
          </div>

          {user && !admin && !placementLoading && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2 mt-1">
              <span>
                הרמה שלכם: <strong className="text-rose-600 dark:text-rose-400 font-bold">{getBandLabel(unlockedBand)}</strong>
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <Link
                to="/placement-test"
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 underline underline-offset-4 transition-colors font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                מבחן רמה מחדש
              </Link>
            </p>
          )}

          {!user && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              <Link to="/login" state={{ from: "/games" }} className="text-rose-600 dark:text-rose-400 font-bold hover:underline">
                התחברו
              </Link>{" "}
              ועברו מבחן רמה כדי לפתוח את כל המשחקים
            </p>
          )}
        </section>

        {/* =====================================================
            GAMES GRID
        ====================================================== */}
        <main className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 items-start">
          {GAMES.map((game) => {
            const locked = !placementLoading && game.minBand > unlockedBand;
            const isExpanded = expandedGameHref === game.href;
            const descId = `game-desc-${game.href}`;

            return (
              <div
                key={game.href}
                className={cn(
                  "relative flex flex-col rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800/80 dark:backdrop-blur-xl dark:shadow-2xl transition-all duration-300 overflow-hidden group",
                  locked
                    ? "opacity-60 bg-slate-50 border-slate-200 dark:opacity-50 dark:bg-slate-900/40 dark:border-slate-800/60"
                    : "ht-card-hover"
                )}
              >
                <Link
                  to={game.href}
                  className="flex flex-col items-center text-center gap-2 p-4 sm:p-5 no-underline text-slate-900 dark:text-white h-full justify-between"
                >
                  <div className="w-full flex items-center justify-between min-h-[24px]">
                    {game.minBand > 1 ? (
                      <div className="flex items-center gap-1.5">
                        <BandBadge band={game.minBand} />
                        {locked && (
                          <span
                            title="נדרשת רמה גבוהה יותר"
                            className="p-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 text-xs"
                          >
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">
                        זמין לכולם
                      </span>
                    )}
                  </div>

                  <div className="my-2 transition-transform duration-300 group-hover:scale-110">
                    <span className="text-4xl sm:text-5xl filter drop-shadow-sm">
                      {game.icon}
                    </span>
                  </div>

                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-tight">
                    {game.title}
                  </span>
                </Link>

                <button
                  type="button"
                  title={game.desc}
                  aria-label={locked ? "מידע על המשחק ועל הנעילה" : "מידע על המשחק"}
                  aria-expanded={isExpanded}
                  aria-controls={descId}
                  onClick={() => setExpandedGameHref(isExpanded ? null : game.href)}
                  className="absolute top-2.5 left-2.5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800/80 transition-colors z-20"
                >
                  <Info className="w-4 h-4" />
                </button>

                {isExpanded && (
                  <div
                    id={descId}
                    className="text-xs text-slate-600 dark:text-slate-400 text-center px-4 pb-4 pt-2 bg-slate-50 border-t border-slate-200 dark:bg-slate-950/40 dark:border-slate-800/60"
                  >
                    {locked && (
                      <span className="font-bold text-rose-600 dark:text-rose-400 mb-1 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" /> נדרשת רמה גבוהה יותר
                      </span>
                    )}
                    {game.desc}
                  </div>
                )}
              </div>
            );
          })}
        </main>

        {/* =====================================================
            USER ACHIEVEMENTS DASHBOARD
        ====================================================== */}
        {loggedIn && (
          <section className="mt-4 ht-card p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 text-xs font-bold mb-2">
                <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>הישגים וניקוד</span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {placementLoading ? "טוען הישגים..." : `ניקוד מצטבר בחשבון: ${stats?.totalScore ?? 0}`}
              </h2>

              {!placementLoading && (stats?.bestStreak ?? 0) > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  שיא תשובות נכונות ברצף: <strong className="text-slate-800 dark:text-slate-200">{stats?.bestStreak}</strong>
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2.5">
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = stats?.achievements?.includes(ach.id) ?? false;
                const isExpanded = expandedAchievementId === ach.id;
                const descId = `achievement-desc-${ach.id}`;

                return (
                  <div key={ach.id} className="flex flex-col items-center gap-1.5 max-w-[10rem]">
                    <button
                      type="button"
                      title={ach.descHe}
                      aria-expanded={isExpanded}
                      aria-controls={descId}
                      onClick={() => setExpandedAchievementId(isExpanded ? null : ach.id)}
                      className={cn(
                        "text-xs font-bold px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5",
                        unlocked
                          ? "bg-amber-50 border-amber-200 text-amber-800 shadow-xs dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300"
                          : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800/40 dark:border-slate-700/60 dark:text-slate-500 opacity-70 hover:opacity-100",
                        isExpanded && "ring-2 ring-rose-500 border-transparent"
                      )}
                    >
                      <span>{ach.icon}</span>
                      <span>{ach.nameHe}</span>
                    </button>

                    {isExpanded && (
                      <div
                        id={descId}
                        className="text-[11px] text-slate-600 dark:text-slate-400 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-sm dark:bg-slate-800/60 dark:border-slate-700/60"
                      >
                        <p className="text-slate-700 dark:text-slate-300">{ach.descHe}</p>
                        {!unlocked && stats != null && ach.progress && (() => {
                          const { current, target } = ach.progress(stats);
                          return (
                            <span className="block mt-1 font-semibold text-rose-600 dark:text-rose-400">
                              התקדמות: {Math.min(current, target)} / {target}
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}