import type { Store } from "../../models";
import { StoreCategoryLabels } from "../../models";
import {
  UtensilsCrossed,
  ShoppingBag,
  Laptop,
  Gem,
  BookOpen,
  Trophy,
  Home,
  Sparkles,
  Baby,
  Calendar,
  Package,
  Building2,
  Clock,
  Pencil,
  Trash2,
} from "lucide-react";

interface StoreListProps {
  stores: Store[];
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
  isLoading?: boolean;
}

// Ícones por categoria
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, React.ReactElement> = {
    food: <UtensilsCrossed size={20} />,
    clothing: <ShoppingBag size={20} />,
    electronics: <Laptop size={20} />,
    jewelry: <Gem size={20} />,
    books: <BookOpen size={20} />,
    sports: <Trophy size={20} />,
    home: <Home size={20} />,
    beauty: <Sparkles size={20} />,
    toys: <Baby size={20} />,
    services: <Calendar size={20} />,
    other: <Package size={20} />,
  };
  return iconMap[category] || <Package size={20} />;
};

// Cores por categoria
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    food: "bg-orange-100 text-orange-800",
    clothing: "bg-blue-100 text-blue-800",
    electronics: "bg-purple-100 text-purple-800",
    jewelry: "bg-pink-100 text-pink-800",
    books: "bg-yellow-100 text-yellow-800",
    sports: "bg-red-100 text-red-800",
    home: "bg-green-100 text-green-800",
    beauty: "bg-pink-100 text-pink-800",
    toys: "bg-indigo-100 text-indigo-800",
    services: "bg-purple-100 text-purple-800",
    other: "bg-gray-100 text-gray-800",
  };
  return colors[category] || "bg-gray-100 text-gray-800";
};

export const StoreList = ({
  stores,
  onEdit,
  onDelete,
  isLoading = false,
}: StoreListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhum espaço cadastrado</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoria
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Localização
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Horário
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descrição
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stores.map((store) => (
            <tr key={store._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="text-blue-600">
                    {getCategoryIcon(store.category)}
                  </div>
                  <span className="font-medium text-gray-900">{store.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(store.category)}`}>
                  {StoreCategoryLabels[store.category]}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 size={16} />
                  <span>{store.floor}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span>{store.openingHours}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-gray-600 line-clamp-2 max-w-xs">
                  {store.description}
                </p>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(store)}
                    className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(store)}
                    className="text-red-600 hover:text-red-800 transition-colors p-1"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
