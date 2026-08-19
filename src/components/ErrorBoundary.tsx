import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught render error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="text-center py-16 px-4">
          <p className="text-4xl mb-3">😕</p>
          <h2 className="text-primary font-bold text-xl mb-2">משהו השתבש</h2>
          <p className="text-muted-foreground mb-6">
            אירעה שגיאה בלתי צפויה. נסו לחזור לדף הבית.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = import.meta.env.BASE_URL;
            }}
          >
            חזרה לדף הבית
          </Button>
        </section>
      );
    }

    return this.props.children;
  }
}
