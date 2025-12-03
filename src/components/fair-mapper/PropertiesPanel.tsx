import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useStoresQuery } from "../../queries";
import type { MapElement } from "../../types/fair-mapper";
import { DeleteElementModal } from "../modal";

interface PropertiesPanelProps {
  selectedElement: MapElement | null;
  onUpdateElement: (id: number, updates: Partial<MapElement>) => void;
  onDeleteElement: (id: number) => void;
}

export function PropertiesPanel({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
}: PropertiesPanelProps) {
  const { id: mapId } = useParams<{ id: string }>();

  // Buscar lojas apenas se tiver mapId válido e não for "new"
  const shouldFetchStores = mapId && mapId !== "new";
  const { data: storesData } = useStoresQuery(
    shouldFetchStores ? { mapId, limit: 100 } : undefined
  );

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    color: "#000000",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    storeId: "",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Função para copiar informações da loja quando vinculada
  const handleStoreLink = (storeId: string) => {
    const selectedStore = storesData?.data?.find((s) => s._id === storeId);

    if (selectedStore && selectedElement) {
      // Copiar o nome da loja para o nome do elemento
      setFormData((prev) => ({
        ...prev,
        storeId,
        name: selectedStore.name,
      }));

      // Atualizar imediatamente o elemento com as novas informações
      onUpdateElement(selectedElement.id, {
        name: selectedStore.name,
        storeId: storeId || undefined,
        storeName: selectedStore.name,
        storeCategory: selectedStore.category,
        storeLogo: selectedStore.logo || undefined,
      });
    } else if (!storeId) {
      // Se desvincular, limpar as informações da loja
      setFormData((prev) => ({ ...prev, storeId: "" }));
      if (selectedElement) {
        onUpdateElement(selectedElement.id, {
          storeId: undefined,
          storeName: undefined,
          storeCategory: undefined,
          storeLogo: undefined,
        });
      }
    } else {
      setFormData((prev) => ({ ...prev, storeId }));
    }
  };

  // Atualizar form quando elemento selecionado mudar
  useEffect(() => {
    if (selectedElement) {
      setFormData({
        name: selectedElement.name || "",
        type: selectedElement.type || "",
        color: selectedElement.color || "#000000",
        x: Math.round(selectedElement.x),
        y: Math.round(selectedElement.y),
        width: Math.round(selectedElement.width),
        height: Math.round(selectedElement.height),
        storeId: selectedElement.storeId || "",
      });
    } else {
      setFormData({
        name: "",
        type: "",
        color: "#000000",
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        storeId: "",
      });
    }
  }, [selectedElement]);

  const handleDelete = () => {
    if (!selectedElement) return;
    onDeleteElement(selectedElement.id);
  };

  const handleFieldChange = (
    field: keyof typeof formData,
    value: string | number
  ) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (!selectedElement) return;

    // Atualizar imediatamente o elemento
    onUpdateElement(selectedElement.id, {
      [field]: value === "" && field === "storeId" ? undefined : value,
    });
  };

  const getTypeOptions = () => {
    if (!selectedElement) return [];

    switch (selectedElement.layer) {
      case "background":
        return [
          "Corredor",
          "Praça",
          "Área Comum",
          "Entrada",
          "Banheiro",
          "Customizado",
        ];
      case "submaps":
        return ["Setor"];
      case "locations":
        return ["Alimentação", "Vestuário", "Artesanato", "Serviços", "Outros"];
      default:
        return [];
    }
  };

  return (
    <div className="p-3">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Propriedades</h3>

      {!selectedElement ? (
        <div className="text-xs text-gray-500">
          Selecione um elemento para editar suas propriedades
        </div>
      ) : (
        <div className="space-y-3">
          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleFieldChange("type", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {getTypeOptions().map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Cor */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Cor
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => handleFieldChange("color", e.target.value)}
              className="w-full h-8 border border-gray-300 rounded-md shadow-sm cursor-pointer"
            />
          </div>

          {/* Vincular Loja - apenas para locais */}
          {selectedElement.layer === "locations" && shouldFetchStores && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Vincular Loja/Espaço
              </label>
              <select
                value={formData.storeId || ""}
                onChange={(e) => handleStoreLink(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sem vínculo</option>
                {storesData?.data?.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name} - {store.floor}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Vincule este espaço a uma loja cadastrada. O nome será copiado
                automaticamente.
              </p>
            </div>
          )}

          {/* Posição */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                X
              </label>
              <input
                type="number"
                value={formData.x}
                onChange={(e) =>
                  handleFieldChange("x", parseInt(e.target.value) || 0)
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Y
              </label>
              <input
                type="number"
                value={formData.y}
                onChange={(e) =>
                  handleFieldChange("y", parseInt(e.target.value) || 0)
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tamanho */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Largura
              </label>
              <input
                type="number"
                value={formData.width}
                onChange={(e) =>
                  handleFieldChange("width", parseInt(e.target.value) || 0)
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Altura
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) =>
                  handleFieldChange("height", parseInt(e.target.value) || 0)
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Botão de Excluir */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <DeleteElementModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        element={selectedElement}
      />
    </div>
  );
}
