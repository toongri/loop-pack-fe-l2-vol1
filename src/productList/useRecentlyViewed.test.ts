import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useRecentlyViewed } from "./useRecentlyViewed";

declare global {
  // vitest jsdom 환경이 내부적으로 노출하는 참조(공식 타입 없음).
  var jsdom: { window: Window } | undefined;
}

// Node의 실험적 전역 localStorage가 jsdom의 실제 구현을 가리는 경우(undefined 반환) 대비:
// jsdom이 만든 실제 Storage 인스턴스를 전역에 다시 연결한다(vi.mock이 아니라 jsdom 실제 구현 재노출).
const jsdomWindow = globalThis.jsdom?.window;
if (jsdomWindow) {
  Object.defineProperty(globalThis, "localStorage", {
    value: jsdomWindow.localStorage,
    configurable: true,
  });
}

describe("useRecentlyViewed", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("손상된 값(스키마가 다른 객체)이 저장돼 있으면 빈 배열로 시작한다", () => {
    localStorage.setItem("recentlyViewed", '{"a":1}');

    const { result } = renderHook(() => useRecentlyViewed());

    expect(result.current.recentlyViewed).toEqual([]);
  });

  it("손상된 값(문자열 배열)이 저장돼 있으면 빈 배열로 시작한다", () => {
    localStorage.setItem("recentlyViewed", '["1","2"]');

    const { result } = renderHook(() => useRecentlyViewed());

    expect(result.current.recentlyViewed).toEqual([]);
  });

  it("JSON이 아닌 값이 저장돼 있으면 빈 배열로 시작한다", () => {
    localStorage.setItem("recentlyViewed", "not json");

    const { result } = renderHook(() => useRecentlyViewed());

    expect(result.current.recentlyViewed).toEqual([]);
  });

  it("정상 값이 저장돼 있으면 그대로 복원한다", () => {
    localStorage.setItem("recentlyViewed", "[1,2,3]");

    const { result } = renderHook(() => useRecentlyViewed());

    expect(result.current.recentlyViewed).toEqual([1, 2, 3]);
  });
});
