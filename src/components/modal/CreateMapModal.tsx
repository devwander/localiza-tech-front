import { useState } from "react";
import { MapTag, MapTagLabels } from "../../models";

interface CreateMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description?: string, tags?: MapTag[]) => void;
  isLoading?: boolean;
}

export function CreateMapModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateMapModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<MapTag[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(
        name.trim(),
        description.trim() || undefined,
        selectedTags.length > 0 ? selectedTags : undefined
      );
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName("");
      setDescription("");
      setSelectedTags([]);
      onClose();
    }
  };

  const toggleTag = (tag: MapTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Criar Novo Mapa
            </h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="mapName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nome do Mapa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="mapName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Feira de Tecnologia 2024"
                  required
                  disabled={isLoading}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="mapDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Descrição (opcional)
                </label>
                <textarea
                  id="mapDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Adicione uma descrição para o mapa..."
                  rows={3}
                  disabled={isLoading}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (opcional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(MapTagLabels).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleTag(value as MapTag)}
                      disabled={isLoading}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                        selectedTags.includes(value as MapTag)
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Selecione uma ou mais tags para categorizar o mapa
                </p>
              </div>
            </div>

            <div className="mt-6 flex space-x-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Criando...
                  </>
                ) : (
                  "Criar Mapa"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
