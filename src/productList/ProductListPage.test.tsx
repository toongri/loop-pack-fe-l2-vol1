import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductListPage } from "./ProductListPage";

// src/mocks/handlers.ts의 CATEGORY_COUNTS 기준, 페이지당 12개(ProductListPage.PAGE_SIZE):
//   electronics=40개 → 4페이지, fashion=5개 → 1페이지, 전체 합계 56개 → 5페이지.

describe("ProductListPage — 페이지 클램프 + 히스토리 통합(MSW)", () => {
  beforeEach(() => {
    // jsdom이 scrollTo를 구현하지 않아 "Not implemented" 에러를 출력하므로 막는다.
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  it("존재하지 않는 페이지(page=999)로 마운트하면 마지막 유효 페이지로 보정되고 replaceState 1회, pushState 0회만 발생한다", async () => {
    window.history.replaceState(null, "", "/?category=electronics&page=999");
    const pushSpy = vi.spyOn(window.history, "pushState");
    const replaceSpy = vi.spyOn(window.history, "replaceState");

    render(<ProductListPage />);

    const nav = await screen.findByRole("navigation");
    // electronics는 4페이지뿐이므로, 마지막 유효 페이지로 보정됐다면 다음/마지막 이동이 비활성화된다.
    await waitFor(() =>
      expect(within(nav).getByRole("button", { name: "다음 페이지" })).toBeDisabled(),
    );
    expect(within(nav).getByRole("button", { name: "마지막 페이지" })).toBeDisabled();
    await waitFor(() => expect(replaceSpy).toHaveBeenCalledTimes(1));
    expect(pushSpy).toHaveBeenCalledTimes(0);
  });

  it("[회귀] 4페이지 카테고리의 3페이지에서 1페이지 카테고리로 전환 후 뒤로가기해도 3페이지가 유지되고 클램프가 발화하지 않는다", async () => {
    window.history.replaceState(null, "", "/?category=electronics&page=3");
    render(<ProductListPage />);

    await waitFor(() => expect(screen.getByText(/총 40개의 상품/)).toBeInTheDocument());

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "패션" }));

    await waitFor(() => expect(screen.getByText(/총 5개의 상품/)).toBeInTheDocument());

    // 뒤로가기 시뮬레이션: jsdom이 history.back()에서 popstate를 동기 발화하지 않을 수 있으므로,
    // URL을 직접 이전 상태로 되돌린 뒤 popstate를 수동 발화한다(useUrlQuerySync는 이벤트만 구독해
    // window.location.search를 다시 읽으므로 실제 뒤로가기와 같은 코드 경로를 탄다).
    window.history.replaceState(null, "", "/?category=electronics&page=3");
    window.dispatchEvent(new PopStateEvent("popstate"));

    await waitFor(() => expect(screen.getByText(/총 40개의 상품/)).toBeInTheDocument());
    const nav = screen.getByRole("navigation");
    // 클램프가 발화했다면(회귀) page가 1로 튕겨 "이전 페이지"가 비활성화됐을 것이다.
    expect(within(nav).getByRole("button", { name: "이전 페이지" })).toBeEnabled();
  });

  it("페이지가 있는 URL에서 검색어를 입력하면 debounce 후 pushState가 정확히 1회 발생하고 중간 엔트리가 없다", async () => {
    window.history.replaceState(null, "", "/?page=3");
    render(<ProductListPage />);
    await screen.findByRole("navigation");

    const pushSpy = vi.spyOn(window.history, "pushState");
    const replaceSpy = vi.spyOn(window.history, "replaceState");

    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText("상품 검색...");
    await user.type(searchInput, "삼성");

    await waitFor(() => expect(pushSpy).toHaveBeenCalledTimes(1));
    expect(replaceSpy).not.toHaveBeenCalled();
    const target = String(pushSpy.mock.calls[0]?.[2] ?? "");
    expect(decodeURIComponent(target)).toContain("q=삼성");
  });
});
