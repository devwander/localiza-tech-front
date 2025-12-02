import {
  Building2,
  Calendar,
  Check,
  Eye,
  Map as MapIcon,
  MapPin,
  Package,
  Pencil,
  Plus,
  Search,
  Share2,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Loading } from "../../../components/loading";
import { MapPreview } from "../../../components/map";
import { CreateMapModal } from "../../../components/modal";
import type { MapTag } from "../../../models";
import { MapTagColors, MapTagLabels } from "../../../models";
import { useCreateMap, useDeleteMap } from "../../../mutation";
import { useMaps, useMapTags } from "../../../queries";

type MapType = "all" | string;
type OrderType = "most_recent" | "oldest" | "a_z" | "z_a";

export function MapList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState<OrderType>("most_recent");
  const [mapType, setMapType] = useState<MapType>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedMapId, setCopiedMapId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Converter order para o formato da API
  const apiOrder = order === "a_z" || order === "z_a" ? "alphabetical" : order;

  // Buscar tags disponíveis
  const { data: availableTags, isLoading: isLoadingTags } = useMapTags();

  // Debug: log das tags
  console.log("[MapList] Available tags:", availableTags);
  console.log("[MapList] Is loading tags:", isLoadingTags);

  const { data, isLoading, isError, error } = useMaps({
    query: debouncedSearchQuery || undefined,
    tags: mapType !== "all" ? mapType : undefined,
    page,
    limit: 10,
    order: apiOrder as "alphabetical" | "most_recent" | "oldest",
  });

  // Ordenar A-Z ou Z-A no frontend se necessário
  let displayData = data;
  if (data && data.data && (order === "a_z" || order === "z_a")) {
    const sortedData = [...data.data];
    if (order === "a_z") {
      sortedData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (order === "z_a") {
      sortedData.sort((a, b) => b.name.localeCompare(a.name));
    }
    displayData = {
      ...data,
      data: sortedData,
    };
  }

  const deleteMutation = useDeleteMap();
  const createMapMutation = useCreateMap();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o mapa "${name}"?`)) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Mapa excluído com sucesso!");
    } catch (err) {
      toast.error("Erro ao excluir mapa");
      console.error(err);
    }
  };

  const handleCreateNew = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSubmit = async (
    name: string,
    description?: string,
    tags?: MapTag[]
  ) => {
    try {
      const newMap = await createMapMutation.mutateAsync({
        name,
        metadata: { description },
        tags,
        features: [],
      });
      toast.success("Mapa criado com sucesso!");
      setIsModalOpen(false);
      navigate(`/dashboard/maps/${newMap._id}`);
    } catch (err) {
      toast.error("Erro ao criar mapa");
      console.error(err);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/dashboard/maps/${id}`);
  };

  const handleView = (id: string) => {
    navigate(`/dashboard/maps/${id}`);
  };

  const handleShare = async (id: string, name: string) => {
    const publicUrl = `${window.location.origin}/maps/public/${id}`;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedMapId(id);
      toast.success(`Link do mapa "${name}" copiado!`);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedMapId(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Erro ao copiar link");
    }
  };

  const handleManageStores = (id: string) => {
    navigate(`/stores/${id}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Erro ao carregar mapas: {error?.message || "Erro desconhecido"}
          </p>
        </div>
      </div>
    );
  }

  // Calcular estatísticas
  const totalMaps = data?.total || 0;
  const totalSpaces =
    data?.data.reduce((sum, map) => sum + (map.features?.length || 0), 0) || 0;
  const publishedMaps =
    data?.data.filter((map) => map.tags && map.tags.length > 0).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8 mt-20">
      <CreateMapModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        isLoading={createMapMutation.isPending}
      />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Mapas</h1>
              <p className="mt-2 text-gray-600">
                Gerencie seus mapas de feiras, polos comerciais e eventos.
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="mr-2 h-5 w-5" />
              Novo Mapa
            </button>
          </div>
        </div>

        {/* Dashboard de Estatísticas */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <MapIcon size={14} className="text-blue-600" />
              <span className="font-medium">Total de Mapas</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{totalMaps}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <Package size={14} className="text-green-600" />
              <span className="font-medium">Total de Espaços</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {totalSpaces}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <MapPin size={14} className="text-purple-600" />
              <span className="font-medium">Mapas Publicados</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {publishedMaps}
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="sr-only">
                Buscar mapas
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {debouncedSearchQuery !== searchQuery ? (
                    <svg
                      className="animate-spin h-5 w-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <Search className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Buscar mapa por nome..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
            <div>
              <label htmlFor="type" className="sr-only">
                Filtrar por tipo
              </label>
              <select
                id="type"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={mapType}
                onChange={(e) => {
                  setMapType(e.target.value as MapType);
                  setPage(1);
                }}
                disabled={isLoadingTags}
              >
                <option value="all">
                  {isLoadingTags ? "Carregando..." : "Todos os tipos"}
                </option>
                {availableTags && availableTags.length > 0
                  ? availableTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {MapTagLabels[tag as MapTag] ||
                          tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </option>
                    ))
                  : !isLoadingTags && (
                      <option disabled>Nenhuma tag disponível</option>
                    )}
              </select>
            </div>
            <div>
              <label htmlFor="order" className="sr-only">
                Ordenar por
              </label>
              <select
                id="order"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={order}
                onChange={(e) => {
                  setOrder(e.target.value as OrderType);
                  setPage(1);
                }}
              >
                <option value="most_recent">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
                <option value="a_z">A-Z</option>
                <option value="z_a">Z-A</option>
              </select>
            </div>
          </div>
        </div>
        {displayData && displayData.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayData.data.map((map) => (
                <div
                  key={map._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  {/* Map Preview */}
                  <div className="w-full bg-gray-50 flex items-center justify-center p-4">
                    <MapPreview map={map} width={280} height={180} />
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {map.name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {map.tags && map.tags.length > 0
                            ? map.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${MapTagColors[tag]}`}
                                >
                                  {MapTagLabels[tag]}
                                </span>
                              ))
                            : map.type
                            ? (() => {
                                const type = map.type.toLowerCase();
                                let badgeClass = "bg-green-100 text-green-800";
                                if (type === "evento")
                                  badgeClass = "bg-pink-100 text-pink-800";
                                else if (type === "shopping")
                                  badgeClass = "bg-blue-100 text-blue-800";

                                return (
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
                                  >
                                    {map.type.charAt(0).toUpperCase() +
                                      map.type.slice(1)}
                                  </span>
                                );
                              })()
                            : null}
                        </div>
                      </div>
                    </div>
                    {map.metadata?.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {map.metadata.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{map.features.length} espaços cadastrados</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {map.createdAt
                            ? new Date(map.createdAt).toLocaleDateString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )
                            : "Data desconhecida"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(map._id)}
                          className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Visualizar
                        </button>
                        <button
                          onClick={() => handleEdit(map._id)}
                          className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Pencil className="mr-1 h-4 w-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleShare(map._id, map.name)}
                          className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          title="Compartilhar link público"
                        >
                          {copiedMapId === map._id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Share2 className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(map._id, map.name)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleManageStores(map._id)}
                        className="w-full inline-flex justify-center items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Building2 className="mr-1 h-4 w-4" />
                        Gerenciar Espaços
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {displayData.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando{" "}
                  <span className="font-medium">{(page - 1) * 10 + 1}</span> a{" "}
                  <span className="font-medium">
                    {Math.min(page * 10, displayData.total)}
                  </span>{" "}
                  de <span className="font-medium">{displayData.total}</span>{" "}
                  resultados
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(displayData.totalPages, p + 1))
                    }
                    disabled={page === displayData.totalPages}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum mapa encontrado
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando um novo mapa de feira, shopping ou evento.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="mr-2 h-5 w-5" />
                Criar Novo Mapa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
