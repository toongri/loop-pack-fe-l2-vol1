import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useProductFilters } from "./useProductFilters.ts";
import { FILTER_DEFAULTS } from "./filterQuery.ts";

// useProductFilters.ts 내부 URL_WRITE_DEBOUNCE_MS와 동일한 값(비export 상수라 값으로 동기화).
const URL_WRITE_DEBOUNCE_MS = 300;

describe("useProductFilters", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
    vi.restoreAllMocks();
    vi.useRealTimers();
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

  it("popstate 직후 debounce 창 안에서 필터를 조작해도 stale 쿼리가 pushState되지 않는다", () => {
    vi.useFakeTimers();
    window.history.replaceState(null, "", "/?category=all");
    const { result } = renderHook(() => useProductFilters());

    // 마운트 시점의 normalize/debounce를 먼저 정착시킨다.
    act(() => {
      vi.advanceTimersByTime(URL_WRITE_DEBOUNCE_MS + 50);
    });

    // 브라우저 뒤로가기로 과거 URL(category=fashion&page=5)로 복원된 상황을 흉내낸다.
    act(() => {
      window.history.pushState(null, "", "/?category=fashion&page=5");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    // 감시는 popstate 시뮬레이션(테스트 코드 자체의 pushState) 이후부터 시작한다.
    const pushSpy = vi.spyOn(window.history, "pushState");

    // debounce 창(300ms) 안에서 사용자가 필터를 조작한다.
    act(() => {
      result.current.setCategory("electronics");
    });

    // origin이 "user"로 즉시 바뀌어도 아직 debounce가 정착되지 않았으므로 아무것도 push되면 안 된다.
    expect(pushSpy).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(URL_WRITE_DEBOUNCE_MS + 50);
    });

    // debounce가 정착된 뒤 최종 사용자 쿼리 한 번만 push되고, 유령(stale) 엔트리가 없다.
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith(null, "", "?category=electronics");
    expect(result.current.category).toBe("electronics");
    expect(result.current.page).toBe(1);
  });
});
