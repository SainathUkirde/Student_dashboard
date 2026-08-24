import { useState, useEffect, useCallback } from 'react';

/**
 * Generic data fetching hook with loading and error states.
 * Pass a stable function reference (or use useCallback) for the fetchFn.
 * The hook re-runs whenever the fetchFn reference changes.
 */
export function useFetch(fetchFn) {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!fetchFn) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}

export default useFetch;
