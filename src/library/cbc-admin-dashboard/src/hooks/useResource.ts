import { useCallback, useEffect, useState } from "react";
import type { Paginated } from "@/services/types";

interface ResourceApi<T> {
  list: (params?: Record<string, unknown>) => Promise<Paginated<T>>;
}

export function useResourceList<T>(api: ResourceApi<T>, params?: Record<string, unknown>) {
  const [data, setData] = useState<T[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    api
      .list(params)
      .then((res) => {
        setData(res.results ?? []);
        setCount(res.count ?? 0);
      })
      .catch(() => setError("Couldn't load this data. Check your connection and try again."))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, count, isLoading, error, refetch: fetchData };
}
