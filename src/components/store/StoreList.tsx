import type { Store } from "../../models";
import { StoreCategoryLabels } from "../../models";

interface StoreListProps {
  stores: Store[];
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
  isLoading?: boolean;
}

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
        <p className="text-gray-500">Nenhuma loja cadastrada</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stores.map((store) => (
        <div
          key={store._id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {store.logo && (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-12 h-12 object-contain rounded"
                />
              )}
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {store.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {StoreCategoryLabels[store.category]}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Andar:</span> {store.floor}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Horário:</span>{" "}
              {store.openingHours}
            </p>
            <p className="text-gray-600 line-clamp-2">{store.description}</p>

            {(store.phone || store.email || store.website) && (
              <div className="pt-2 border-t border-gray-100">
                {store.phone && (
                  <p className="text-gray-600">
                    <span className="font-medium">Tel:</span> {store.phone}
                  </p>
                )}
                {store.email && (
                  <p className="text-gray-600 truncate">
                    <span className="font-medium">Email:</span> {store.email}
                  </p>
                )}
                {store.website && (
                  <a
                    href={store.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Visitar site
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => onEdit(store)}
              className="flex-1 px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(store)}
              className="flex-1 px-3 py-2 text-sm text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
