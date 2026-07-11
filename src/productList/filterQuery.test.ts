import { describe, expect, it } from "vitest";
import {
  FILTER_DEFAULTS,
  clampPage,
  isPriceRangeInverted,
  nextHistoryAction,
  parseQueryToFilters,
  serializeFiltersToQuery,
  type QueryFilters,
} from "./filterQuery";

describe("parseQueryToFilters", () => {
  it("빈 문자열은 기본값을 반환한다", () => {
    expect(parseQueryToFilters("")).toEqual(FILTER_DEFAULTS);
  });

  it("category가 allowlist 밖이면 all로 떨어진다", () => {
    expect(parseQueryToFilters("?category=bogus").category).toBe("all");
  });

  it("sort가 allowlist 밖이면 latest로 떨어진다", () => {
    expect(parseQueryToFilters("?sort=bogus").sortBy).toBe("latest");
  });

  it("category가 allowlist 안이면 그대로 반영한다", () => {
    expect(parseQueryToFilters("?category=fashion").category).toBe("fashion");
  });

  it("page가 비정수 문자열이면 1로 떨어진다", () => {
    expect(parseQueryToFilters("?page=abc").page).toBe(1);
  });

  it("page가 음수면 1로 떨어진다", () => {
    expect(parseQueryToFilters("?page=-3").page).toBe(1);
  });

  it("page가 0이면 1로 떨어진다", () => {
    expect(parseQueryToFilters("?page=0").page).toBe(1);
  });

  it("page가 소수면 1로 떨어진다", () => {
    expect(parseQueryToFilters("?page=3.5").page).toBe(1);
  });

  it("page가 양의 정수면 상한 클램프 없이 통과시킨다", () => {
    expect(parseQueryToFilters("?page=999").page).toBe(999);
  });

  it("minPrice가 음수면 빈 문자열로 떨어진다", () => {
    expect(parseQueryToFilters("?minPrice=-5").minPrice).toBe("");
  });

  it("minPrice가 비숫자면 빈 문자열로 떨어진다", () => {
    expect(parseQueryToFilters("?minPrice=abc").minPrice).toBe("");
  });

  it("minPrice가 유효값이면 숫자로 파싱한다", () => {
    expect(parseQueryToFilters("?minPrice=100").minPrice).toBe(100);
  });

  it("inStock=true면 true를 반환한다", () => {
    expect(parseQueryToFilters("?inStock=true").inStockOnly).toBe(true);
  });

  it("inStock이 true 이외 값이면 false를 반환한다", () => {
    expect(parseQueryToFilters("?inStock=yes").inStockOnly).toBe(false);
  });

  it("모르는 param은 무시하고 나머지는 정상 파싱한다", () => {
    expect(parseQueryToFilters("?foo=bar&category=fashion").category).toBe("fashion");
  });
});

describe("serializeFiltersToQuery", () => {
  it("기본값은 빈 쿼리 문자열을 반환한다", () => {
    expect(serializeFiltersToQuery(FILTER_DEFAULTS)).toBe("");
  });
});

describe("parseQueryToFilters / serializeFiltersToQuery 왕복", () => {
  const roundTripFilters: QueryFilters = {
    category: "electronics",
    minPrice: 1000,
    maxPrice: "",
    sortBy: "popular",
    searchQuery: "phone case",
    inStockOnly: true,
    page: 2,
  };

  it("직렬화가 원본 URL write set을 그대로 mirror한다", () => {
    expect(serializeFiltersToQuery(roundTripFilters)).toBe(
      "category=electronics&q=phone+case&page=2&sort=popular&minPrice=1000&inStock=true",
    );
  });

  it("직렬화 후 파싱하면 원본과 일치한다", () => {
    expect(parseQueryToFilters(serializeFiltersToQuery(roundTripFilters))).toEqual(
      roundTripFilters,
    );
  });
});

describe("nextHistoryAction", () => {
  it("origin이 popstate이면 값이 바뀌어도 최우선으로 none을 반환한다", () => {
    expect(nextHistoryAction("a=1", "a=2", "popstate")).toBe("none");
  });

  it("다음 값이 현재와 같으면 origin과 무관하게 none을 반환한다", () => {
    expect(nextHistoryAction("a=1", "a=1", "user")).toBe("none");
  });

  it("origin이 mount이면 replace를 반환한다", () => {
    expect(nextHistoryAction("", "a=1", "mount")).toBe("replace");
  });

  it("origin이 normalize이면 replace를 반환한다", () => {
    expect(nextHistoryAction("page=999", "page=5", "normalize")).toBe("replace");
  });

  it("origin이 user이면 push를 반환한다", () => {
    expect(nextHistoryAction("a=1", "a=2", "user")).toBe("push");
  });
});

describe("clampPage", () => {
  it("page가 totalPages를 초과하면 totalPages로 클램프한다", () => {
    expect(clampPage(999, 5)).toBe(5);
  });

  it("page가 범위 안이면 그대로 반환한다", () => {
    expect(clampPage(3, 5)).toBe(3);
  });

  it("page가 0 이하면 1로 클램프한다", () => {
    expect(clampPage(0, 5)).toBe(1);
  });

  it("totalPages가 0이어도 최소 1을 반환한다", () => {
    expect(clampPage(1, 0)).toBe(1);
  });
});

describe("isPriceRangeInverted", () => {
  it("min이 빈 문자열이면 false를 반환한다", () => {
    expect(isPriceRangeInverted("", 100)).toBe(false);
  });

  it("max가 빈 문자열이면 false를 반환한다", () => {
    expect(isPriceRangeInverted(100, "")).toBe(false);
  });

  it("둘 다 숫자이고 min이 max보다 크면 true를 반환한다", () => {
    expect(isPriceRangeInverted(200, 100)).toBe(true);
  });

  it("둘 다 숫자이고 min이 max 이하면 false를 반환한다", () => {
    expect(isPriceRangeInverted(100, 200)).toBe(false);
  });
});
