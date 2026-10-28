import { useCallback, useEffect, useState } from "react";
import type { Paginated } from "@/services/types";

interface ResourceApi<T> {
  list: (params?: Record<string, unknown>) => Promise<Paginated<T>>;
}

export function useResourceList<T>(api: ResourceApi<T>, params?: Record<string, unknown>) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setIsLoading(true);
    setError(null);
    api.list(params)
      .then((res) => setData(res.results ?? []))
      .catch(() => setError("Couldn't load this. Pull down to retry."))
      .finally(() => { setIsLoading(false); setRefreshing(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, isLoading, error, refreshing, refetch: () => fetchData(true), reload: () => fetchData(false) };
}
