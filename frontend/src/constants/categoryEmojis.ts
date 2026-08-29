/**
 * Emoji mappings for expense categories (fallback / default map)
 * Note: Category emojis are now stored in the database on the Category model.
 */

export const CATEGORY_EMOJIS: Record<string, string> = {
  Food: "🍔",
  Transportation: "🚗",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Bills: "📄",
  Healthcare: "🏥",
  Education: "📚",
  Travel: "✈️",
  Personal: "👤",
  Other: "📦",
};

export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJIS[category] || "📦";
}

