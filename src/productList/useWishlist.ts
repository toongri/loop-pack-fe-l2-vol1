import { useEffect, useState } from "react";
import { parseIdList, toggleId } from "./listOps";

const STORAGE_KEY = "wishlist";

/** 위시리스트 상태를 localStorage(`"wishlist"`)와 동기화하는 훅. */
export function useWishlist() {
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      return parseIdList(localStorage.getItem(STORAGE_KEY));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // localStorage 사용 불가 시 무시
    }
  }, [wishlist]);

  const toggle = (id: number) => {
    setWishlist((prev) => toggleId(prev, id));
  };

  return { wishlist, toggle };
}
