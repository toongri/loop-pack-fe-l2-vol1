import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useProductFilters } from "./useProductFilters.ts";
import { FILTER_DEFAULTS } from "./filterQuery.ts";

describe("useProductFilters", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("?category=fashion&page=3 URL에서 마운트하면 해당 상태로 복원된다", () => {
    window.history.replaceState(null, "", "/?category=fashion&page=3");

    const { result } = renderHook(() => useProductFilters());

    expect(result.current.category).toBe("fashion");
    expect(result.current.page).toBe(3);
  });

  it("필터 setter 호출 시 page 리셋(1)이 일어난다", () => {
    window.history.replaceState(null, "", "/?page=3");
    const { result } = renderHook(() => useProductFilters());
    expect(result.current.page).toBe(3);

    act(() => {
      result.current.setCategory("fashion");
    });

    expect(result.current.category).toBe("fashion");
    expect(result.current.page).toBe(1);
  });

  it("reset() 호출 시 모든 필터가 기본값으로 되돌아간다", () => {
    window.history.replaceState(null, "", "/?category=fashion&page=3&q=phone");
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      result.current.reset();
    });

    expect(result.current.category).toBe(FILTER_DEFAULTS.category);
    expect(result.current.searchQuery).toBe(FILTER_DEFAULTS.searchQuery);
    expect(result.current.page).toBe(FILTER_DEFAULTS.page);
  });

  it("popstate로 유입된 restore()가 필터와 page를 한 번에(벌크) 적용한다", () => {
    window.history.replaceState(null, "", "/?category=all");
    const { result } = renderHook(() => useProductFilters());

    act(() => {
      window.history.pushState(null, "", "/?category=fashion&page=5");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(result.current.category).toBe("fashion");
    expect(result.current.page).toBe(5);
  });
});
