import { useEffect } from "react";

/** Sets the browser tab title for the page that calls it. Call unconditionally near the top of each page component, before any loading/locked-state branch, so the title updates immediately on navigation regardless of what renders. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} - הודיה ג'רבי`;
  }, [title]);
}
