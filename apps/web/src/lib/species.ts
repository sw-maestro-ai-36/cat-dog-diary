// ADR-0013 §종 이모지 매핑. 백엔드 normalize_species(prompts_loader.py)와 키워드 셋 정합.

export type SpeciesEmoji = "🐱" | "🐶" | "🐾";

const CAT_KEYWORDS = ["고양이", "냥이", "냥", "cat", "kitty", "kitten"];
const DOG_KEYWORDS = ["강아지", "멍멍이", "멍멍", "댕댕이", "dog", "puppy"];

export function normalizeSpecies(text: string): SpeciesEmoji {
  const s = text.toLowerCase();
  if (CAT_KEYWORDS.some((k) => s.includes(k))) return "🐱";
  if (DOG_KEYWORDS.some((k) => s.includes(k))) return "🐶";
  return "🐾";
}
