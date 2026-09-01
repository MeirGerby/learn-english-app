import { useState, useCallback, useEffect } from "react";

export function useFetchData<T>(fetcher: () => Promise<T[]>, userId?: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refetch = useCallback(async () => {
    try {
      const data = await fetcher();
      setItems(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(false);
    void refetch();
  }, [userId, refetch]);

  return { items, loading, error, refetch };
}