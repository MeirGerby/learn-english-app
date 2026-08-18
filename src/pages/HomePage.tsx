import { Link } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { LevelBadge } from "@/components/LevelBadge";
import { useAchievements } from "@/hooks/useAchievements";
import { ACHIEVEMENTS } from "@/lib/userStats";
import { cn } from "@/lib/utils";

const GAMES = [
  {
    href: "/games/flashcards",
    icon: "🗂️",
    title: "כרטיסיות וחידון",
    desc: "הפכו כרטיסיות כדי ללמוד מילים חדשות, ואז התאמנו עם חידון אמריקאי.",
    advanced: false,
  },
  {
    href: "/games/scramble",
    icon: "🔤",
    title: "ערבוב מילים",
    desc: "סדרו מחדש את האותיות המעורבבות כדי לגלות את המילה לפני שנגמרים הרמזים.",
    advanced: false,
  },
  {
    href: "/games/fill-blank",
    icon: "✏️",
    title: "השלמת משפטים",
    desc: "השלימו את המילה החסרה במשפט - ניבים, פעלים דו-מיליים ואוצר מילים מתקדם.",
    advanced: true,
  },
  {
    href: "/games/listening",
    icon: "🎧",
    title: "אתגר האזנה",
    desc: "הקשיבו למילה או לניב וכתבו את מה ששמעתם - תרגול הבנת הנשמע.",
    advanced: true,
  },
  {
    href: "/games/speed-round",
    icon: "⏱️",
    title: "סבב מהיר",
    desc: "ענו נכון כמה שיותר מהר לפני שהזמן נגמר - חידון קצב בכל הרמות.",
    advanced: true,
  },
];

export default function HomePage() {
  const { stats, loading, loggedIn } = useAchievements();

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar />

      <header className="flex flex-col items-center text-center gap-2 mb-7">
        <div className="w-18 h-18 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-indigo-400 text-white font-extrabold text-2xl mb-1">
          HG
        </div>
        <h1 className="text-2xl font-bold m-0">הודיה ג'רבי</h1>
        <p className="text-primary font-bold m-0">מורה לאנגלית</p>
        <p className="text-muted-foreground max-w-md leading-relaxed mt-1">
          עם 5 שנות ניסיון בהוראת אנגלית לילדים ותואר בהוראת אנגלית, הודיה מלווה תלמידים בדרך מהנה ובגובה העיניים
          לרכישת השפה - החל מאוצר מילים בסיסי ועד ביטחון אמיתי בדיבור, קריאה וכתיבה.
        </p>
        <div className="flex flex-wrap justify-center gap-2 my-1.5">
          <span className="bg-accent text-primary text-sm font-semibold px-3 py-1.5 rounded-full">🎓 תואר בהוראת אנגלית</span>
          <span className="bg-accent text-primary text-sm font-semibold px-3 py-1.5 rounded-full">🧒 התמחות בהוראת ילדים</span>
          <span className="bg-accent text-primary text-sm font-semibold px-3 py-1.5 rounded-full">⭐ 5+ שנות ניסיון</span>
        </div>
      </header>

      <p className="text-center text-muted-foreground font-semibold mb-3">בחרו איך להתחיל ללמוד:</p>

      <main className="flex flex-col gap-4">
        {GAMES.map((game) => (
          <Link
            key={game.href}
            to={game.href}
            className="flex flex-col gap-1.5 p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all no-underline text-foreground"
          >
            {game.advanced && <LevelBadge />}
            <span className="text-3xl">{game.icon}</span>
            <span className="text-lg font-bold text-primary">{game.title}</span>
            <span className="text-muted-foreground text-sm">{game.desc}</span>
          </Link>
        ))}
      </main>

      {loggedIn && (
        <section className="mt-5">
          <p className="text-center text-muted-foreground font-semibold text-sm mb-2.5">
            {loading ? "טוען הישגים..." : `ניקוד מצטבר בחשבון: ${stats?.totalScore ?? 0} · ההישגים שלי`}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = stats?.achievements?.includes(ach.id) ?? false;
              return (
                <span
                  key={ach.id}
                  title={ach.descHe}
                  className={cn(
                    "text-sm font-semibold px-3 py-1.5 rounded-full border",
                    unlocked ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-muted border-border text-muted-foreground opacity-60"
                  )}
                >
                  {ach.icon} {ach.nameHe}
                </span>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
