import {
  ClockIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  PhoneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { Store } from "../../models";
import { StoreCategoryLabels } from "../../models";

interface StoreInfoModalProps {
  store: Store | null;
  onClose: () => void;
}

export function StoreInfoModal({ store, onClose }: StoreInfoModalProps) {
  if (!store) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Logo */}
          {store.logo && (
            <div className="flex justify-center">
              <img
                src={store.logo}
                alt={`Logo ${store.name}`}
                className="max-h-32 object-contain"
              />
            </div>
          )}

          {/* Category Badge */}
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {StoreCategoryLabels[store.category] || store.category}
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Descrição
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {store.description}
            </p>
          </div>

          {/* Location */}
          <div className="flex items-start space-x-3">
            <MapPinIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-gray-700">
                Localização
              </h3>
              <p className="text-gray-600 text-sm">{store.floor}</p>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="flex items-start space-x-3">
            <ClockIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-gray-700">
                Horário de Funcionamento
              </h3>
              <p className="text-gray-600 text-sm">{store.openingHours}</p>
            </div>
          </div>

          {/* Contact Information */}
          {(store.phone || store.email || store.website) && (
            <div className="border-t pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Contato</h3>

              {store.phone && (
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <a
                    href={`tel:${store.phone}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {store.phone}
                  </a>
                </div>
              )}

              {store.email && (
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <a
                    href={`mailto:${store.email}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {store.email}
                  </a>
                </div>
              )}

              {store.website && (
                <div className="flex items-center space-x-3">
                  <GlobeAltIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <a
                    href={store.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Visitar website
                  </a>
                </div>
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
