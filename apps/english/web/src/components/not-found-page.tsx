import { Link } from '@tanstack/react-router';
import { TopBar } from './top-bar';
import { Button } from '@learn-english/ui/components/ui/button';
import { useDocumentTitle } from '../hooks/use-document-title';

export function NotFoundPage() {
  useDocumentTitle('הדף לא נמצא');

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar />
      <main className="text-center py-16 px-4">
        <p className="text-4xl mb-3" aria-hidden="true">
          🧭
        </p>
        <h1 className="text-primary font-bold text-xl mb-2">הדף לא נמצא</h1>
        <p className="text-muted-foreground mb-6">
          הקישור שגוי או שהדף הוסר. אפשר לחזור לדף הבית.
        </p>
        <Link to="/">
          <Button variant="outline">חזרה לדף הבית</Button>
        </Link>
      </main>
    </div>
  );
}
