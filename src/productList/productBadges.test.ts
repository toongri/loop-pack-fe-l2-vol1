import { describe, expect, it } from "vitest";
import type { Product } from "./types";
import { computeBadges } from "./productBadges";

const NOW = new Date("2026-07-04T00:00:00.000Z");

const baseProduct: Product = {
  id: 1,
  name: "테스트 상품",
  category: "electronics",
  price: 10000,
  stock: 10,
  imageUrl: "https://example.com/img.png",
  createdAt: "2026-06-27T00:00:00.000Z",
  rating: 4.0,
  reviewCount: 10,
};

describe("computeBadges", () => {
  describe("discountRate", () => {
    it("originalPrice가 없으면 0을 반환한다", () => {
      expect(computeBadges(baseProduct, NOW).discountRate).toBe(0);
    });
  });

  describe("isFreeShipping", () => {
    it("가격이 50000원 미만이면 false를 반환한다", () => {
      expect(computeBadges({ ...baseProduct, price: 49999 }, NOW).isFreeShipping).toBe(false);
    });

    it("가격이 50000원 이상이면 true를 반환한다", () => {
      expect(computeBadges({ ...baseProduct, price: 50000 }, NOW).isFreeShipping).toBe(true);
    });
  });

  describe("isNew", () => {
    it("정확히 7일 경과하면 true를 반환한다", () => {
      expect(
        computeBadges({ ...baseProduct, createdAt: "2026-06-27T00:00:00.000Z" }, NOW).isNew,
      ).toBe(true);
    });

    it("8일 경과하면 false를 반환한다", () => {
      expect(
        computeBadges({ ...baseProduct, createdAt: "2026-06-26T00:00:00.000Z" }, NOW).isNew,
      ).toBe(false);
    });
  });

  describe("isHot", () => {
    it("할인율이 30%면 true를 반환한다", () => {
      expect(computeBadges({ ...baseProduct, price: 700, originalPrice: 1000 }, NOW).isHot).toBe(
        true,
      );
    });

    it("할인율이 29%면 false를 반환한다", () => {
      expect(computeBadges({ ...baseProduct, price: 710, originalPrice: 1000 }, NOW).isHot).toBe(
        false,
      );
    });
  });

  describe("isBest", () => {
    it("rating 4.5 이상 & reviewCount 100 이상이면 true를 반환한다", () => {
      expect(computeBadges({ ...baseProduct, rating: 4.5, reviewCount: 100 }, NOW).isBest).toBe(
        true,
      );
    });

    it("rating이 미달이면 false를 반환한다", () => {
      expect(computeBadges({ ...baseProduct, rating: 4.4, reviewCount: 100 }, NOW).isBest).toBe(
        false,
      );
    });

    it("reviewCount가 미달이면 false를 반환한다", () => {
      expect(computeBadges({ ...baseProduct, rating: 4.5, reviewCount: 99 }, NOW).isBest).toBe(
        false,
      );
    });
  });

  describe("isSoldOut / isAlmostSoldOut", () => {
    it("stock이 0이면 isSoldOut은 true, isAlmostSoldOut은 배타적으로 false를 반환한다", () => {
      const badges = computeBadges({ ...baseProduct, stock: 0 }, NOW);
      expect(badges.isSoldOut).toBe(true);
      expect(badges.isAlmostSoldOut).toBe(false);
    });

    it("stock이 5면 isAlmostSoldOut은 true, isSoldOut은 false를 반환한다", () => {
      const badges = computeBadges({ ...baseProduct, stock: 5 }, NOW);
      expect(badges.isAlmostSoldOut).toBe(true);
      expect(badges.isSoldOut).toBe(false);
    });

    it("stock이 6이면 isAlmostSoldOut은 false를 반환한다", () => {
      expect(computeBadges({ ...baseProduct, stock: 6 }, NOW).isAlmostSoldOut).toBe(false);
    });
  });

  describe("배지 공존", () => {
    it("hot·best·new 조건을 모두 만족하면 세 배지가 동시에 true다", () => {
      const badges = computeBadges(
        {
          ...baseProduct,
          price: 700,
          originalPrice: 1000,
          rating: 4.8,
          reviewCount: 200,
          createdAt: "2026-07-01T00:00:00.000Z",
        },
        NOW,
      );
      expect(badges.isHot && badges.isBest && badges.isNew).toBe(true);
    });
  });
});
