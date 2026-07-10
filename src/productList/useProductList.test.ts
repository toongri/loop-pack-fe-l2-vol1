import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useProductList } from "./useProductList";
import type { ProductListParams } from "./api/productApi";

function makeParams(overrides: Partial<ProductListParams> = {}): ProductListParams {
  return {
    category: "all",
    sortBy: "latest",
    searchQuery: "",
    page: 1,
    pageSize: 10,
    minPrice: "",
    maxPrice: "",
    inStockOnly: false,
    ...overrides,
  };
}

describe("useProductList", () => {
  it("마운트 시 status가 loading에서 success로 전이한다", async () => {
    const params = makeParams();
    const { result } = renderHook(() => useProductList(params));

    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("success"));
  });

  it("params가 새 객체로 교체되면 fetch 결착 전까지 status가 loading이고 이전 totalCount가 success와 함께 노출되지 않는다", async () => {
    const snapshots: { status: string; totalCount: number }[] = [];

    const { result, rerender } = renderHook(
      ({ params }: { params: ProductListParams }) => {
        const hookResult = useProductList(params);
        snapshots.push({ status: hookResult.status, totalCount: hookResult.totalCount });
        return hookResult;
      },
      { initialProps: { params: makeParams({ category: "electronics" }) } },
    );

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.totalCount).toBe(40);

    snapshots.length = 0;
    rerender({ params: makeParams({ category: "fashion" }) });

    // fashion 데이터가 결착하기 전까지, 이전(electronics) totalCount가 "success"와 함께 노출된 적이 없어야 한다.
    expect(snapshots.some((s) => s.status === "success" && s.totalCount === 40)).toBe(false);

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.totalCount).toBe(5);
  });

  it("에러 응답 후에도 status가 loading에 갇히지 않고 error로 노출된다", async () => {
    const params = makeParams({ searchQuery: "__error__" });
    const { result } = renderHook(() => useProductList(params));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).not.toBeNull();
  });
});
