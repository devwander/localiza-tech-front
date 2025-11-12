import { useEffect, useState } from "react";
import type { MapElement } from "../../types/fair-mapper";

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
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    color: "#000000",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

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
      });
    }
  }, [selectedElement]);

  const handleUpdate = () => {
    if (!selectedElement) return;

    onUpdateElement(selectedElement.id, {
      name: formData.name,
      color: formData.color,
      x: formData.x,
      y: formData.y,
      width: formData.width,
      height: formData.height,
    });
  };

  const handleDelete = () => {
    if (!selectedElement) return;

    if (confirm("Tem certeza que deseja excluir este elemento?")) {
      onDeleteElement(selectedElement.id);
    }
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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              className="w-full h-8 border border-gray-300 rounded-md shadow-sm cursor-pointer"
            />
          </div>

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
                  setFormData({ ...formData, x: parseInt(e.target.value) || 0 })
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
                  setFormData({ ...formData, y: parseInt(e.target.value) || 0 })
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
                  setFormData({
                    ...formData,
                    width: parseInt(e.target.value) || 0,
                  })
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
                  setFormData({
                    ...formData,
                    height: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Atualizar
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
