import {
  ArrowLeft,
  Baby,
  BookOpen,
  Calendar,
  Gem,
  Home,
  Laptop,
  MapPin,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Trophy,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { MapPreview } from "../../components/map";
import type { StoreFormData } from "../../components/store";
import { StoreForm, StoreList } from "../../components/store";
import type { Store, StoreCategory } from "../../models";
import { StoreCategoryLabels } from "../../models";
import {
  useCreateStoreMutation,
  useDeleteStoreMutation,
  useUpdateStoreMutation,
} from "../../mutation";
import { useStoresByMapQuery } from "../../queries";
import { useMap } from "../../queries/map.query";

export const StoresPage = () => {
  const { mapId } = useParams<{ mapId: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | undefined>();
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<StoreCategory | "all">(
    "all"
  );

  const { data: stores = [], isLoading } = useStoresByMapQuery(mapId || "");
  const { data: mapData } = useMap(mapId);
  const createMutation = useCreateStoreMutation();
  const updateMutation = useUpdateStoreMutation();
  const deleteMutation = useDeleteStoreMutation();

  const handleCreate = () => {
    // TODO: Integrar com o mapa para selecionar o feature/localização
    setSelectedStore(undefined);
    setSelectedFeatureId("feature-id-placeholder");
    setSelectedLocation({ x: 0, y: 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (store: Store) => {
    setSelectedStore(store);
    setIsModalOpen(true);
  };

  const handleDelete = async (store: Store) => {
    const confirmed = globalThis.confirm(
      `Tem certeza que deseja excluir o espaço "${store.name}"?`
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(store._id);
      toast.success("Espaço excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir espaço");
      console.error(error);
    }
  };

  const handleSubmit = async (data: StoreFormData) => {
    // Validar campos obrigatórios
    if (
      !data.name ||
      !data.floor ||
      !data.category ||
      !data.openingHours ||
      !data.description
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (selectedStore) {
        await updateMutation.mutateAsync({
          id: selectedStore._id,
          data,
        });
        toast.success("Espaço atualizado com sucesso!");
      } else {
        const createData = {
          ...data,
          mapId: mapId || "",
          featureId: selectedFeatureId,
          location: selectedLocation,
          logo: data.logo || "", // Garantir que logo não seja undefined
        };

        await createMutation.mutateAsync(createData);
        toast.success("Espaço criado com sucesso!");
      }
      setIsModalOpen(false);
      setSelectedStore(undefined);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.message || err?.message || "Erro desconhecido";
      toast.error(
        selectedStore
          ? `Erro ao atualizar espaço: ${errorMessage}`
          : `Erro ao criar espaço: ${errorMessage}`
      );
      console.error("Erro completo:", error);
      console.error("Resposta do servidor:", err?.response?.data);
    }
  };

  if (!mapId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">ID do mapa não fornecido</p>
      </div>
    );
  }

  // Filtrar stores
  const filteredStores = stores.filter((store) => {
    const matchesSearch = searchQuery
      ? store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory =
      categoryFilter === "all" || store.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calcular estatísticas por categoria
  const categoryStats = stores.reduce((acc, store) => {
    acc[store.category] = (acc[store.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto px-4 py-12 mt-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 mb-3 flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Espaços
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie os espaços cadastrados neste mapa.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Novo Espaço</span>
        </button>
      </div>

      {/* Visualização do Mapa */}
      {mapData && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Visualização do Mapa: {mapData.name}
          </h2>
          <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
            <MapPreview map={mapData} width={600} height={400} />
          </div>
        </div>
      )}

      {/* Dashboard de Estatísticas */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-blue-700 mb-1">
            <MapPin size={14} />
            <span className="font-medium">Total de Espaços</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {stores.length}
          </div>
        </div>

        {Object.entries(StoreCategoryLabels).map(([category, label]) => {
          const count = categoryStats[category] || 0;
          if (count === 0) return null;

          const getCategoryIconForDashboard = (cat: string) => {
            const iconMap: Record<string, React.ReactElement> = {
              food: <UtensilsCrossed size={14} />,
              clothing: <ShoppingBag size={14} />,
              electronics: <Laptop size={14} />,
              jewelry: <Gem size={14} />,
              books: <BookOpen size={14} />,
              sports: <Trophy size={14} />,
              home: <Home size={14} />,
              beauty: <Sparkles size={14} />,
              toys: <Baby size={14} />,
              services: <Calendar size={14} />,
              other: <Package size={14} />,
            };
            return iconMap[cat] || <Package size={14} />;
          };

          const getCategoryNumberColor = (cat: string): string => {
            const colors: Record<string, string> = {
              food: "text-orange-600",
              clothing: "text-blue-600",
              electronics: "text-purple-600",
              jewelry: "text-pink-600",
              books: "text-yellow-600",
              sports: "text-red-600",
              home: "text-green-600",
              beauty: "text-pink-600",
              toys: "text-indigo-600",
              services: "text-purple-600",
              other: "text-gray-600",
            };
            return colors[cat] || "text-gray-600";
          };

          return (
            <div
              key={category}
              className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                {getCategoryIconForDashboard(category)}
                <span className="font-medium">{label}</span>
              </div>
              <div
                className={`text-2xl font-bold ${getCategoryNumberColor(
                  category
                )}`}
              >
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Busca e Filtros */}
      <div className="mb-6 flex gap-4 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar espaço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as StoreCategory | "all")
          }
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas as categorias</option>
          {Object.entries(StoreCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <StoreList
        stores={filteredStores}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              {selectedStore ? "Editar Espaço" : "Novo Espaço"}
            </h2>
            <StoreForm
              store={selectedStore}
              mapId={mapId}
              featureId={selectedFeatureId}
              location={selectedLocation}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsModalOpen(false);
                setSelectedStore(undefined);
              }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
};
