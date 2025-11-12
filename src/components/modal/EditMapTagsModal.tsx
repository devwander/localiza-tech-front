import { useState } from "react";
import { MapTag, MapTagLabels } from "../../models";

interface EditMapTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tags: MapTag[]) => void;
  currentTags: MapTag[];
  isLoading?: boolean;
}

export function EditMapTagsModal({
  isOpen,
  onClose,
  onSave,
  currentTags,
  isLoading = false,
}: EditMapTagsModalProps) {
  const [selectedTags, setSelectedTags] = useState<MapTag[]>(currentTags);

  if (!isOpen) return null;

  const toggleTag = (tag: MapTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    onSave(selectedTags);
    onClose();
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedTags(currentTags); // Reset to current tags
      onClose();
    }
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
            <h2 className="text-xl font-bold text-gray-900">Editar Tags</h2>
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

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecione as tags para este mapa
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
              <p className="mt-2 text-xs text-gray-500">
                {selectedTags.length > 0
                  ? `${selectedTags.length} tag(s) selecionada(s)`
                  : "Nenhuma tag selecionada"}
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
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
