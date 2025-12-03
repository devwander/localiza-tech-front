import { useState } from "react";
import type { Store } from "../../models";
import { StoreCategory, StoreCategoryLabels } from "../../models";
import { ImageUpload } from "../upload";

interface StoreFormProps {
  store?: Store;
  mapId: string;
  featureId: string;
  location: { x: number; y: number; width?: number; height?: number };
  onSubmit: (data: StoreFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface StoreFormData {
  name: string;
  category: StoreCategory;
  openingHours: string;
  logo: string;
  description: string;
  phone?: string;
  email?: string;
  website?: string;
}

export const StoreForm = ({
  store,
  onSubmit,
  onCancel,
  isLoading = false,
}: StoreFormProps) => {
  const [formData, setFormData] = useState<StoreFormData>({
    name: store?.name || "",
    category: store?.category || StoreCategory.OTHER,
    openingHours: store?.openingHours || "",
    logo: store?.logo || "",
    description: store?.description || "",
    phone: store?.phone || "",
    email: store?.email || "",
    website: store?.website || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getButtonText = () => {
    if (isLoading) return "Salvando...";
    if (store) return "Atualizar";
    return "Criar";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="store-name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Espaço *
        </label>
        <input
          type="text"
          id="store-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Restaurante Bella Vista"
        />
      </div>

      <div>
        <label htmlFor="store-category" className="block text-sm font-medium text-gray-700 mb-1">
          Categoria *
        </label>
        <select
          id="store-category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(StoreCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="store-hours" className="block text-sm font-medium text-gray-700 mb-1">
          Horário de Funcionamento *
        </label>
        <input
          type="text"
          id="store-hours"
          name="openingHours"
          value={formData.openingHours}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: Seg-Sex: 9h-18h, Sáb: 9h-13h"
        />
      </div>

      <ImageUpload
        value={formData.logo}
        onChange={(url) => setFormData((prev) => ({ ...prev, logo: url }))}
        label="Logo/Ícone do Espaço (Opcional)"
        required={false}
      />

      <div>
        <label htmlFor="store-description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição *
        </label>
        <textarea
          id="store-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Descreva o espaço..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="store-phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <input
            type="tel"
            id="store-phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(00) 00000-0000"
          />
        </div>

        <div>
          <label htmlFor="store-email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            type="email"
            id="store-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="contato@espaco.com"
          />
        </div>

        <div>
          <label htmlFor="store-website" className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            id="store-website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://espaco.com"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {getButtonText()}
        </button>
      </div>
    </form>
  );
};
