import { describe, expect, it } from "vitest";
import { addRecentId, parseIdList, toggleId } from "./listOps";

describe("toggleId", () => {
  it("없는 id는 끝에 추가한다", () => {
    expect(toggleId([1, 2], 3)).toEqual([1, 2, 3]);
  });

  it("있는 id는 제거한다", () => {
    expect(toggleId([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it("추가 후 재토글하면 원본과 동일하다(중복 없음)", () => {
    expect(toggleId(toggleId([1, 2], 5), 5)).toEqual([1, 2]);
  });
});

describe("addRecentId", () => {
  it("중복 제거 후 맨 앞으로 옮긴다", () => {
    expect(addRecentId([1, 2, 3], 2, 10)).toEqual([2, 1, 3]);
  });

  it("max 길이로 자른다", () => {
    expect(addRecentId([1, 2, 3], 4, 3)).toEqual([4, 1, 2]);
  });

  it("기본 max는 10이다", () => {
    expect(addRecentId([1, 2, 3], 5)).toEqual([5, 1, 2, 3]);
  });
});

describe("parseIdList", () => {
  it("정상 JSON 배열 문자열을 복원한다", () => {
    expect(parseIdList("[1,2,3]")).toEqual([1, 2, 3]);
  });

  it("null이면 빈 배열을 반환한다", () => {
    expect(parseIdList(null)).toEqual([]);
  });

  it("빈 문자열이면 빈 배열을 반환한다", () => {
    expect(parseIdList("")).toEqual([]);
  });

  it("스키마가 다른 값(객체)은 빈 배열로 떨어뜨린다", () => {
    expect(parseIdList('{"a":1}')).toEqual([]);
  });

  it("스키마가 다른 값(문자열 배열)은 빈 배열로 떨어뜨린다", () => {
    expect(parseIdList('["1","2"]')).toEqual([]);
  });

  it("스키마가 다른 값(혼합 배열)은 빈 배열로 떨어뜨린다", () => {
    expect(parseIdList('[1,"2"]')).toEqual([]);
  });

  it("JSON이 아닌 값은 빈 배열로 떨어뜨린다", () => {
    expect(parseIdList("not json")).toEqual([]);
  });
});
