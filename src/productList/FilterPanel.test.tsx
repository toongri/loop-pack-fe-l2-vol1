import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterPanel } from "./FilterPanel";
import type { Filters } from "./types.ts";

afterEach(cleanup);

function renderFilterPanel(
  overrides: Partial<{ minPrice: Filters["minPrice"]; maxPrice: Filters["maxPrice"] }> = {},
) {
  return render(
    <FilterPanel
      category="all"
      onCategoryChange={vi.fn()}
      minPrice={overrides.minPrice ?? ""}
      onMinPriceChange={vi.fn()}
      maxPrice={overrides.maxPrice ?? ""}
      onMaxPriceChange={vi.fn()}
      inStockOnly={false}
      onInStockToggle={vi.fn()}
      onReset={vi.fn()}
    />,
  );
}

describe("FilterPanel 가격 범위 역전 경고", () => {
  it("최소가가 최대가보다 크면 role=alert 경고가 나타난다(역전)", () => {
    renderFilterPanel({ minPrice: 5000, maxPrice: 3000 });

    expect(screen.getByRole("alert")).toHaveTextContent("최소 가격이 최대 가격보다 큽니다");
  });

  it("최소가만 입력한 중간 상태에서는 경고가 없다", () => {
    renderFilterPanel({ minPrice: 5000, maxPrice: "" });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("경고가 떠도 입력값이 그대로 유지된다(자동 교정 없음, 입력값 유지)", async () => {
    const onMinPriceChange = vi.fn();
    const onMaxPriceChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterPanel
        category="all"
        onCategoryChange={vi.fn()}
        minPrice={5000}
        onMinPriceChange={onMinPriceChange}
        maxPrice={3000}
        onMaxPriceChange={onMaxPriceChange}
        inStockOnly={false}
        onInStockToggle={vi.fn()}
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("최소")).toHaveValue(5000);
    expect(screen.getByPlaceholderText("최대")).toHaveValue(3000);

    await user.tab();

    expect(screen.getByPlaceholderText("최소")).toHaveValue(5000);
    expect(screen.getByPlaceholderText("최대")).toHaveValue(3000);
    expect(onMinPriceChange).not.toHaveBeenCalled();
    expect(onMaxPriceChange).not.toHaveBeenCalled();
  });
});
