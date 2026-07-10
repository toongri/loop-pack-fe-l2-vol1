import { useEffect, useState } from "react";
import { fetchProductList, type ProductListParams } from "./api/productApi";
import type { Product } from "./types";

type Status = "idle" | "loading" | "success" | "error";

type UseProductListResult = {
  products: Product[];
  totalCount: number;
  status: Status;
  error: Error | null;
  refetch: () => void;
};

export function useProductList(params: ProductListParams): UseProductListResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [rawStatus, setRawStatus] = useState<Status>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [resolvedParams, setResolvedParams] = useState<ProductListParams | null>(null);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      if (!ignore) {
        setRawStatus("loading");
        setError(null);
      }
      try {
        const data = await fetchProductList(params);
        if (!ignore) {
          setProducts(data.products);
          setTotalCount(data.totalCount);
          setRawStatus("success");
          setResolvedParams(params);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setRawStatus("error");
          setResolvedParams(params);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [params, reloadKey]);

  const status: Status = resolvedParams === params ? rawStatus : "loading";

  const refetch = () => {
    setReloadKey((key) => key + 1);
  };

  return { products, totalCount, status, error, refetch };
}
