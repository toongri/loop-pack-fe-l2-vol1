import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { Product } from "./types";
import { ProductGrid } from "./ProductGrid";

const NOW = new Date("2022-03-15T00:00:00.000Z");

const baseProduct: Product = {
  id: 1,
  name: "테스트 상품",
  category: "electronics",
  price: 10000,
  stock: 10,
  imageUrl: "https://example.com/img.png",
  createdAt: "2022-03-07T00:00:00.000Z",
  rating: 4.0,
  reviewCount: 10,
};

const findCardByName = (name: string): HTMLElement => {
  const article = screen.getByRole("heading", { name }).closest("article");
  if (!article) throw new Error(`article not found for heading: ${name}`);
  return article;
};

describe("ProductGrid", () => {
  it("주입된 now를 기준으로 8일 전 상품엔 NEW 배지가 없고 1일 전 상품엔 있다", () => {
    const products: Product[] = [
      { ...baseProduct, id: 1, name: "8일 전 상품", createdAt: "2022-03-07T00:00:00.000Z" },
      { ...baseProduct, id: 2, name: "1일 전 상품", createdAt: "2022-03-14T00:00:00.000Z" },
    ];

    render(
      <ProductGrid
        products={products}
        viewMode="grid"
        isLoading={false}
        highlightQuery=""
        wishlist={[]}
        onToggleWishlist={vi.fn()}
        onProductClick={vi.fn()}
        now={NOW}
      />,
    );

    expect(screen.getAllByText("NEW")).toHaveLength(1);

    const oldCard = findCardByName("8일 전 상품");
    const newCard = findCardByName("1일 전 상품");
    expect(within(oldCard).queryByText("NEW")).not.toBeInTheDocument();
    expect(within(newCard).getByText("NEW")).toBeInTheDocument();
  });
});
