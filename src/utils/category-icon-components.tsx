import {
  Baby,
  BookOpen,
  Calendar,
  Gem,
  Home,
  Laptop,
  Package,
  ShoppingBag,
  Sparkles,
  Trophy,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Mapeamento de ícones por categoria usando lucide-react
export const getCategoryIcon = (category?: string): LucideIcon => {
  if (!category) return Package;

  const iconMap: Record<string, LucideIcon> = {
    food: UtensilsCrossed,
    clothing: ShoppingBag,
    electronics: Laptop,
    jewelry: Gem,
    books: BookOpen,
    sports: Trophy,
    home: Home,
    beauty: Sparkles,
    toys: Baby,
    services: Calendar,
    other: Package,
  };

  return iconMap[category] || Package;
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

// Labels das categorias
export const getCategoryLabel = (category?: string): string => {
  if (!category) return "Outros";

  const labels: Record<string, string> = {
    food: "Alimentação",
    clothing: "Roupas",
    electronics: "Tecnologia",
    jewelry: "Joias",
    books: "Livros",
    sports: "Esportes",
    home: "Casa",
    beauty: "Beleza",
    toys: "Brinquedos",
    services: "Serviços",
    other: "Outros",
  };

  return labels[category] || "Outros";
};
