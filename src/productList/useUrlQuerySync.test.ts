import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useUrlQuerySync } from "./useUrlQuerySync.ts";

describe("useUrlQuerySync", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
    vi.restoreAllMocks();
  });

  it("user 유래 변경은 pushState 1회, replaceState 0회를 호출한다", () => {
    window.history.replaceState(null, "", "/?category=all");
    const pushSpy = vi.spyOn(window.history, "pushState");
    const replaceSpy = vi.spyOn(window.history, "replaceState");

    renderHook(() => useUrlQuerySync("category=electronics", "user", vi.fn()));

    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(replaceSpy).toHaveBeenCalledTimes(0);
  });

  it("mount 유래 변경(정규화)은 replaceState 1회, pushState 0회를 호출한다", () => {
    window.history.replaceState(null, "", "/?page=999");
    const pushSpy = vi.spyOn(window.history, "pushState");
    const replaceSpy = vi.spyOn(window.history, "replaceState");

    renderHook(() => useUrlQuerySync("page=1", "mount", vi.fn()));

    expect(replaceSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledTimes(0);
  });

  it("popstate 유래 변경은 history에 아무것도 쓰지 않는다", () => {
    window.history.replaceState(null, "", "/?category=all");
    const pushSpy = vi.spyOn(window.history, "pushState");
    const replaceSpy = vi.spyOn(window.history, "replaceState");

    renderHook(() => useUrlQuerySync("category=electronics", "popstate", vi.fn()));

    expect(pushSpy).toHaveBeenCalledTimes(0);
    expect(replaceSpy).toHaveBeenCalledTimes(0);
  });

  it("직렬화 결과가 현재 URL과 같으면 쓰지 않는다(no-op)", () => {
    window.history.replaceState(null, "", "/?category=electronics");
    const pushSpy = vi.spyOn(window.history, "pushState");
    const replaceSpy = vi.spyOn(window.history, "replaceState");

    renderHook(() => useUrlQuerySync("category=electronics", "user", vi.fn()));

    expect(pushSpy).toHaveBeenCalledTimes(0);
    expect(replaceSpy).toHaveBeenCalledTimes(0);
  });

  it("언마운트 후 popstate 이벤트에 반응하지 않는다(리스너 해제)", () => {
    const onPopState = vi.fn();
    const { unmount } = renderHook(() => useUrlQuerySync("category=all", "mount", onPopState));

    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(onPopState).toHaveBeenCalledTimes(1);

    unmount();

    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(onPopState).toHaveBeenCalledTimes(1);
  });
});
