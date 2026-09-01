import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";

export function EmptyGameState() {
  return (
    <section className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800 rounded-3xl">
      <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-4" />
      <h2 className="text-white font-black text-lg mb-1">אין מספיק מילים בקטגוריה הזו</h2>
      <p className="text-slate-400 text-xs mb-6">נסו לבחור קטגוריה אחרת מהרשימה למעלה.</p>
      <Link to="/games">
        <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800">חזרה למשחקים</Button>
      </Link>
    </section>
  );
}