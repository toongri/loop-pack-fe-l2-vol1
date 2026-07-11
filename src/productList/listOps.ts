/** id가 없으면 끝에 추가하고, 있으면 제거한다(중복 없음). 위시리스트 토글용. */
export function toggleId(ids: readonly number[], id: number): number[] {
  return ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id];
}

/** id를 맨 앞으로 옮기고(중복 제거) max 길이로 자른다. 최근 본 상품 목록용. */
export function addRecentId(ids: readonly number[], id: number, max = 10): number[] {
  const without = ids.filter((existing) => existing !== id);
  return [id, ...without].slice(0, max);
}

function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "number" && Number.isFinite(item))
  );
}

/** localStorage에서 읽은 원본 문자열을 id 배열로 파싱한다. 스키마가 다르면 빈 배열(throw 없음). */
export function parseIdList(raw: string | null): number[] {
  if (raw === null || raw === "") return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return isNumberArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
