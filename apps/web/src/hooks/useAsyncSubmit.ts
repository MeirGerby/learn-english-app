import { useState, useCallback } from "react";

export function useAsyncSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const clearStatus = useCallback(() => {
    setError("");
    setMessage("");
  }, []);

  const execute = useCallback(
    async <T>(asyncFn: () => Promise<T>, options?: { onSuccess?: (data: T) => void; onError?: (err: unknown) => void }) => {
      if (isSubmitting) return;
      clearStatus();
      setIsSubmitting(true);
      try {
        const result = await asyncFn();
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        options?.onError?.(err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, clearStatus]
  );

  return { isSubmitting, error, setError, message, setMessage, clearStatus, execute };
}