import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function EmptyGameState() {
  return (
    <section className="text-center py-10">
      <p className="text-4xl mb-3">📭</p>
      <h2 className="text-primary font-bold text-xl mb-2">אין מספיק מילים בקטגוריה הזו כרגע</h2>
      <p className="text-muted-foreground mb-6">נסו לבחור קטגוריה אחרת מהרשימה למעלה.</p>
      <Link to="/games">
        <Button variant="outline">חזרה למשחקים</Button>
      </Link>
    </section>
  );
}
