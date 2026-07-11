import { describe, expect, it } from "vitest";
import { escapeRegExp, splitByMatch } from "./highlight";

describe("escapeRegExp", () => {
  it("정규식 특수문자를 이스케이프한다", () => {
    expect(escapeRegExp("a.b*c(d)")).toBe("a\\.b\\*c\\(d\\)");
  });
});

describe("splitByMatch", () => {
  it("query가 빈 문자열이면 전체 텍스트를 단일 non-match 세그먼트로 반환한다", () => {
    expect(splitByMatch("hello", "")).toEqual([{ text: "hello", isMatch: false }]);
  });

  it("기본 매치를 매치/비매치 세그먼트로 분할한다", () => {
    expect(splitByMatch("hello", "ell")).toEqual([
      { text: "h", isMatch: false },
      { text: "ell", isMatch: true },
      { text: "o", isMatch: false },
    ]);
  });

  it("query의 정규식 특수문자도 리터럴로 매치한다", () => {
    expect(splitByMatch("a+b", "+")).toEqual([
      { text: "a", isMatch: false },
      { text: "+", isMatch: true },
      { text: "b", isMatch: false },
    ]);
  });

  it("대소문자를 무시하고 매치한다", () => {
    expect(splitByMatch("HELLO world", "hello")).toEqual([
      { text: "", isMatch: false },
      { text: "HELLO", isMatch: true },
      { text: " world", isMatch: false },
    ]);
  });
});
