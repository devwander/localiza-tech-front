// Mapeamento de ícones emoji por categoria de loja
export const getCategoryEmoji = (category?: string): string => {
  if (!category) return "📦";
  
  const emojiMap: Record<string, string> = {
    food: "🍽️",
    clothing: "👔",
    electronics: "💻",
    jewelry: "💎",
    books: "📚",
    sports: "🏆",
    home: "🏠",
    beauty: "✨",
    toys: "🧸",
    services: "📅",
    other: "📦",
  };
  
  return emojiMap[category] || "📦";
};

// Cores por categoria
export const getCategoryColor = (category?: string): string => {
  if (!category) return "#6B7280";
  
  const colors: Record<string, string> = {
    food: "#F97316",
    clothing: "#3B82F6",
    electronics: "#9333EA",
    jewelry: "#EC4899",
    books: "#EAB308",
    sports: "#EF4444",
    home: "#10B981",
    beauty: "#EC4899",
    toys: "#6366F1",
    services: "#9333EA",
    other: "#6B7280",
  };
  
  return colors[category] || "#6B7280";
};
