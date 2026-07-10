import { useState } from "react";
import {
  FILTER_DEFAULTS,
  clampPage,
  parseQueryToFilters,
  serializeFiltersToQuery,
} from "./filterQuery.ts";
import type { HistoryOrigin, QueryFilters } from "./filterQuery.ts";
import type { Filters } from "./types.ts";
import { useDebouncedValue } from "./useDebouncedValue.ts";
import { useUrlQuerySync } from "./useUrlQuerySync.ts";

const URL_WRITE_DEBOUNCE_MS = 300;

/**
 * 필터·검색·페이지 상태를 관리하고 URL 쿼리와 동기화하는 훅.
 * - 마운트 시 URL(`window.location.search`)에서 복원한다(lazy init).
 * - 직렬화된 쿼리를 debounce(`URL_WRITE_DEBOUNCE_MS`)한 뒤 `useUrlQuerySync`에 위임한다.
 *   push/replace/none 여부는 origin(mount/user/popstate/normalize)에 따라 그쪽이 결정한다.
 * - page를 제외한 필터가 바뀌면 page를 1로 리셋한다.
 */
export function useProductFilters() {
  const [initial] = useState(() => parseQueryToFilters(window.location.search));
  const [origin, setOrigin] = useState<HistoryOrigin>("mount");
  const [category, setCategoryState] = useState<Filters["category"]>(initial.category);
  const [minPrice, setMinPriceState] = useState<Filters["minPrice"]>(initial.minPrice);
  const [maxPrice, setMaxPriceState] = useState<Filters["maxPrice"]>(initial.maxPrice);
  const [sortBy, setSortByState] = useState<Filters["sortBy"]>(initial.sortBy);
  const [searchQuery, setSearchQueryState] = useState<Filters["searchQuery"]>(initial.searchQuery);
  const [inStockOnly, setInStockOnlyState] = useState<Filters["inStockOnly"]>(initial.inStockOnly);
  const [page, setPageState] = useState<number>(initial.page);

  const applyFilters = (f: QueryFilters) => {
    setCategoryState(f.category);
    setMinPriceState(f.minPrice);
    setMaxPriceState(f.maxPrice);
    setSortByState(f.sortBy);
    setSearchQueryState(f.searchQuery);
    setInStockOnlyState(f.inStockOnly);
    setPageState(f.page);
  };

  const setCategory = (value: Filters["category"]) => {
    setOrigin("user");
    setCategoryState(value);
    setPageState(1);
  };

  const setMinPrice = (value: Filters["minPrice"]) => {
    setOrigin("user");
    setMinPriceState(value);
    setPageState(1);
  };

  const setMaxPrice = (value: Filters["maxPrice"]) => {
    setOrigin("user");
    setMaxPriceState(value);
    setPageState(1);
  };

  const setSortBy = (value: Filters["sortBy"]) => {
    setOrigin("user");
    setSortByState(value);
    setPageState(1);
  };

  const setSearchQuery = (value: Filters["searchQuery"]) => {
    setOrigin("user");
    setSearchQueryState(value);
    setPageState(1);
  };

  const setInStockOnly = (value: Filters["inStockOnly"]) => {
    setOrigin("user");
    setInStockOnlyState(value);
    setPageState(1);
  };

  const setPage = (value: number) => {
    setOrigin("user");
    setPageState(value);
  };

  const reset = () => {
    setOrigin("user");
    applyFilters(FILTER_DEFAULTS);
  };

  const restore = (f: QueryFilters) => {
    setOrigin("popstate");
    applyFilters(f);
  };

  const normalizePage = (totalPages: number) => {
    if (page > totalPages) {
      setOrigin("normalize");
      setPageState(clampPage(page, totalPages));
    }
  };

  const query = serializeFiltersToQuery({
    category,
    minPrice,
    maxPrice,
    sortBy,
    searchQuery,
    inStockOnly,
    page,
  });
  const debouncedQuery = useDebouncedValue(query, URL_WRITE_DEBOUNCE_MS);
  useUrlQuerySync(debouncedQuery, origin, restore);

  return {
    category,
    minPrice,
    maxPrice,
    sortBy,
    searchQuery,
    inStockOnly,
    page,
    setCategory,
    setMinPrice,
    setMaxPrice,
    setSortBy,
    setSearchQuery,
    setInStockOnly,
    setPage,
    reset,
    normalizePage,
  };
}
