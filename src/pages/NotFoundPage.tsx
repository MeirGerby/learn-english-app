import { Link } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar />
      <section className="text-center py-16 px-4">
        <p className="text-4xl mb-3">🧭</p>
        <h2 className="text-primary font-bold text-xl mb-2">הדף לא נמצא</h2>
        <p className="text-muted-foreground mb-6">
          הקישור שגוי או שהדף הוסר. אפשר לחזור לדף הבית.
        </p>
        <Link to="/">
          <Button variant="outline">חזרה לדף הבית</Button>
        </Link>
      </section>
    </div>
  );
}
