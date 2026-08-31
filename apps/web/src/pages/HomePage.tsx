import { Link } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function HomePage() {
  useDocumentTitle("מורה לאנגלית");

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar />

      <header className="flex flex-col items-center text-center gap-2 mb-8 mt-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-indigo-400 text-white font-extrabold text-2xl mb-1">
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

      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        <Link to="/games">
          <Button size="lg" className="w-full text-base h-14">
            🎮 למשחקים
          </Button>
        </Link>
        <Link to="/course">
          <Button size="lg" variant="outline" className="w-full text-base h-14">
            🎓 לקורס של הודיה
          </Button>
        </Link>
        <Link to="/materials">
          <Button size="lg" variant="outline" className="w-full text-base h-14">
            📄 חומרים של הודיה
          </Button>
        </Link>
      </div>
    </div>
  );
}
