import { useEffect, useEffectEvent } from "react";
import { nextHistoryAction, parseQueryToFilters } from "./filterQuery.ts";
import type { HistoryOrigin, QueryFilters } from "./filterQuery.ts";

/**
 * 필터 쿼리와 History API를 동기화하는 effect adapter.
 * push/replace/none 정책은 nextHistoryAction(순수)이 정하고, 이 훅은 그 결정을 실행만 한다.
 */
export function useUrlQuerySync(
  query: string,
  origin: HistoryOrigin,
  onPopState: (filters: QueryFilters) => void,
): void {
  useEffect(() => {
    const current = window.location.search.slice(1);
    const action = nextHistoryAction(current, query, origin);
    const target = query === "" ? window.location.pathname : `?${query}`;

    if (action === "push") {
      window.history.pushState(null, "", target);
    } else if (action === "replace") {
      window.history.replaceState(null, "", target);
    }
  }, [query, origin]);

  const handlePop = useEffectEvent(() => {
    onPopState(parseQueryToFilters(window.location.search));
  });

  useEffect(() => {
    const listener = () => handlePop();
    window.addEventListener("popstate", listener);
    return () => window.removeEventListener("popstate", listener);
  }, []);
}
