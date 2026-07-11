import { http, HttpResponse } from "msw";

const CATEGORIES = ["electronics", "fashion", "home", "beauty"] as const;

type MockProduct = {
  id: number;
  name: string;
  category: (typeof CATEGORIES)[number];
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl: string;
  createdAt: string;
  rating: number;
  reviewCount: number;
};

// 카테고리별 개수를 다르게 둔다 — 페이지네이션(size=10 기준)이 실제로 갈라지는지 검증 가능하도록.
const CATEGORY_COUNTS: Record<MockProduct["category"], number> = {
  electronics: 40, // 4페이지
  fashion: 5, // 1페이지
  home: 8,
  beauty: 3,
};

function buildProducts(): MockProduct[] {
  const products: MockProduct[] = [];
  let id = 1;
  for (const category of CATEGORIES) {
    const count = CATEGORY_COUNTS[category];
    for (let i = 0; i < count; i++) {
      products.push({
        id: id++,
        name: `${category} 상품 ${i + 1}`,
        category,
        price: 10000 + i * 1000,
        stock: i % 7,
        imageUrl: "https://example.com/img.png",
        createdAt: "2026-06-01T00:00:00.000Z", // 고정 ISO 문자열 — 테스트 결정성
        rating: 4.0,
        reviewCount: i,
      });
    }
  }
  return products;
}

const PRODUCTS = buildProducts();

export const handlers = [
  http.get("/api/products", ({ request }) => {
    const url = new URL(request.url);

    if (url.searchParams.get("q") === "__error__") {
      return new HttpResponse(null, { status: 500 });
    }

    const category = url.searchParams.get("category") ?? "all";
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const page = Number(url.searchParams.get("page")) || 1;
    const size = Number(url.searchParams.get("size")) || 10;

    let matched = category === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);
    if (q) matched = matched.filter((p) => p.name.toLowerCase().includes(q));

    const totalCount = matched.length;
    const start = (page - 1) * size;
    const products = matched.slice(start, start + size);

    return HttpResponse.json({ products, totalCount });
  }),
];
