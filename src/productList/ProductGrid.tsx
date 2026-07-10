import type { Product } from "./types.ts";
import type { ViewMode } from "./SearchSortBar.tsx";
import { ProductCard } from "./ProductCard.tsx";

type ProductGridProps = {
  products: Product[];
  viewMode: ViewMode;
  isLoading: boolean;
  highlightQuery: string;
  wishlist: number[];
  onToggleWishlist: (productId: number) => void;
  onProductClick: (productId: number) => void;
  /** 배지 계산 기준 시각 — 페이지에서 렌더 밖 1회 캡처 후 주입 */
  now: Date;
};

export function ProductGrid({
  products,
  viewMode,
  isLoading,
  highlightQuery,
  wishlist,
  onToggleWishlist,
  onProductClick,
  now,
}: ProductGridProps) {
  return (
    <>
      <section
        className="product-grid"
        style={viewMode === "list" ? { gridTemplateColumns: "1fr" } : undefined}
      >
        {products.length === 0 ? (
          <div className="empty">조건에 맞는 상품이 없습니다.</div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              highlightQuery={highlightQuery}
              isWished={wishlist.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onClick={onProductClick}
              now={now}
            />
          ))
        )}
      </section>

      {isLoading && products.length > 0 && (
        <div className="background-loading">데이터 갱신 중...</div>
      )}
    </>
  );
}
