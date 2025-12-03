import { Clock, Globe, Mail, Phone, X } from "lucide-react";
import type { Store } from "../../models";
import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryLabel,
} from "../../utils/category-icon-components";

interface StoreInfoModalProps {
  store: Store | null;
  onClose: () => void;
}

export function StoreInfoModal({ store, onClose }: StoreInfoModalProps) {
  if (!store) return null;

  const CategoryIcon = getCategoryIcon(store.category);
  const categoryColor = getCategoryColor(store.category);
  const categoryLabel = getCategoryLabel(store.category);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com cor da categoria */}
        <div
          className="relative px-6 py-8 text-white"
          style={{ backgroundColor: categoryColor }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Ícone da categoria */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <CategoryIcon className="w-8 h-8" />
            </div>
          </div>

          {/* Nome e categoria */}
          <h2 className="text-2xl font-bold text-center mb-2">{store.name}</h2>
          <p className="text-center text-white text-opacity-90 text-sm uppercase tracking-wide">
            {categoryLabel}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Logo */}
          {store.logo && (
            <div className="flex justify-center py-2">
              <img
                src={store.logo}
                alt={`Logo ${store.name}`}
                className="max-h-24 object-contain"
              />
            </div>
          )}

          {/* Description */}
          {store.description && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Descrição
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {store.description}
              </p>
            </div>
          )}

          {/* Opening Hours */}
          {store.openingHours && (
            <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: categoryColor }}
              >
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Horário de Funcionamento
                </h3>
                <p className="text-gray-600 text-sm">{store.openingHours}</p>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(store.phone || store.email || store.website) && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Contato
              </h3>

              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  className="flex items-center gap-3 hover:bg-white rounded-lg p-2 transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: categoryColor }}
                  >
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 text-sm font-medium">
                    {store.phone}
                  </span>
                </a>
              )}

              {store.email && (
                <a
                  href={`mailto:${store.email}`}
                  className="flex items-center gap-3 hover:bg-white rounded-lg p-2 transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: categoryColor }}
                  >
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 text-sm font-medium">
                    {store.email}
                  </span>
                </a>
              )}

              {store.website && (
                <a
                  href={store.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:bg-white rounded-lg p-2 transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: categoryColor }}
                  >
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 text-sm font-medium">
                    Visitar site
                  </span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
