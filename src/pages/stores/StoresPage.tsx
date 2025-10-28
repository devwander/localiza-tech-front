import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useStoresByMapQuery } from "../../queries";
import {
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
} from "../../mutation";
import { StoreForm, StoreList } from "../../components/store";
import type { StoreFormData } from "../../components/store";
import type { Store } from "../../models";

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

  const { data: stores = [], isLoading } = useStoresByMapQuery(mapId || "");
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
      `Tem certeza que deseja excluir a loja "${store.name}"?`
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(store._id);
      toast.success("Loja excluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir loja");
      console.error(error);
    }
  };

  const handleSubmit = async (data: StoreFormData) => {
    // Validar campos obrigatórios
    if (!data.name || !data.floor || !data.category || !data.openingHours || !data.description) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (selectedStore) {
        await updateMutation.mutateAsync({
          id: selectedStore._id,
          data,
        });
        toast.success("Loja atualizada com sucesso!");
      } else {
        const createData = {
          ...data,
          mapId: mapId || "",
          featureId: selectedFeatureId,
          location: selectedLocation,
          logo: data.logo || "", // Garantir que logo não seja undefined
        };
        
        console.log("Enviando dados:", createData); // Debug
        
        await createMutation.mutateAsync(createData);
        toast.success("Loja criada com sucesso!");
      }
      setIsModalOpen(false);
      setSelectedStore(undefined);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Erro desconhecido";
      toast.error(
        selectedStore ? `Erro ao atualizar loja: ${errorMessage}` : `Erro ao criar loja: ${errorMessage}`
      );
      console.error("Erro completo:", error);
      console.error("Resposta do servidor:", error?.response?.data);
    }
  };

  if (!mapId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">ID do mapa não fornecido</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Lojas
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie as lojas cadastradas neste mapa
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nova Loja
        </button>
      </div>

      <StoreList
        stores={stores}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              {selectedStore ? "Editar Loja" : "Nova Loja"}
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
              isLoading={
                createMutation.isPending || updateMutation.isPending
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
