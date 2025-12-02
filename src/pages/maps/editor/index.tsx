import { CheckIcon, ShareIcon } from "@heroicons/react/24/outline";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Canvas } from "../../../components/fair-mapper/Canvas";
import { Sidebar } from "../../../components/fair-mapper/Sidebar";
import { Toolbar } from "../../../components/fair-mapper/Toolbar";
import { Loading } from "../../../components/loading";
import { ConfirmExitModal, EditMapTagsModal } from "../../../components/modal";
import { useFairMapper } from "../../../hooks/useFairMapper";
import type { MapTag } from "../../../models";
import { MapTagColors, MapTagLabels } from "../../../models";
import { useCreateMap, useUpdateMap } from "../../../mutation";
import { useMap, useStoresQuery } from "../../../queries";
import { Service } from "../../../services";
import {
  apiFormatToLayers,
  layersToApiFormat,
  layersToUpdateFormat,
} from "../../../utils/map-converter";
import { enrichLayersWithStoreData } from "../../../utils/store-enrichment";

export function MapEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewMap = id === "new";
  const queryClient = useQueryClient();

  const {
    data: mapData,
    isLoading,
    isError,
  } = useMap(isNewMap ? undefined : id);

  // Buscar lojas do mapa para enriquecer os elementos
  const { data: storesData } = useStoresQuery(
    !isNewMap && id ? { mapId: id, limit: 1000 } : undefined
  );

  const createMutation = useCreateMap();
  const updateMutation = useUpdateMap();

  console.log("Map data:", mapData);

  const fairMapper = useFairMapper();
  const hasLoadedMap = useRef(false);
  const skipNextLayerChange = useRef(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [mapTags, setMapTags] = useState<MapTag[]>([]);
  const [showTagsModal, setShowTagsModal] = useState(false);

  // Reset quando o ID mudar (navegação entre mapas)
  useEffect(() => {
    hasLoadedMap.current = false;
    setHasUnsavedChanges(false);
    skipNextLayerChange.current = true;
  }, [id]);

  // Load map data from API when available
  useEffect(() => {
    if (mapData && !hasLoadedMap.current && !isNewMap) {
      console.log("[MapEditor] Loading map from API:", mapData);
      console.log("[MapEditor] Map has features:", mapData.features?.length);
      const { layers: initialLayers, nextId } = apiFormatToLayers(mapData);

      // Carregar tags do mapa
      setMapTags(mapData.tags || []);

      // Enriquecer os elementos com informações das lojas vinculadas
      let layers = initialLayers;
      if (storesData?.data && storesData.data.length > 0) {
        console.log(
          "[MapEditor] Enriching layers with store data:",
          storesData.data.length
        );
        layers = enrichLayersWithStoreData(initialLayers, storesData.data);
      }

      console.log("[MapEditor] Converted layers:", {
        background: layers.background.length,
        submaps: layers.submaps.length,
        locations: layers.locations.length,
        nextId,
      });
      // Sempre carregar do banco de dados (cache foi limpo no loadLayers)
      skipNextLayerChange.current = true;
      fairMapper.loadLayers(layers, nextId, id);
      hasLoadedMap.current = true;
      setHasUnsavedChanges(false);
    }
  }, [mapData, isNewMap, fairMapper, id, storesData]);

  // Marcar alterações não salvas quando layers mudam
  useEffect(() => {
    if (skipNextLayerChange.current) {
      skipNextLayerChange.current = false;
      return;
    }

    if (isNewMap) {
      setHasUnsavedChanges(true);
      return;
    }

    if (id && hasLoadedMap.current) {
      setHasUnsavedChanges(true);
    }
  }, [fairMapper.layers, isNewMap, id]);

  // Custom save handler that saves to API instead of localStorage
  const handleSaveToAPI = useCallback(async () => {
    try {
      if (isNewMap) {
        // Create new map - shouldn't happen as new maps are created via modal
        const finalMapName = mapData?.name || "Mapa sem nome";
        const createData = layersToApiFormat(fairMapper.layers, finalMapName);
        const newMap = await createMutation.mutateAsync(createData);

        if (!newMap?._id) {
          throw new Error("Resposta inválida da API ao criar mapa");
        }

        // Garante que o mapa recém-criado esteja persistido e disponível
        await queryClient.invalidateQueries({
          queryKey: ["maps"],
          exact: false,
        });
        await queryClient.ensureQueryData({
          queryKey: ["map", newMap._id],
          queryFn: () => Service.map.findOne(newMap._id),
        });

        skipNextLayerChange.current = true;
        setHasUnsavedChanges(false);
        toast.success("Mapa criado com sucesso!");
        navigate(`/dashboard/maps/${newMap._id}`, { replace: true });
      } else if (id) {
        // Update existing map - only save layers, keep the name
        console.log("[MapEditor] Updating map with layers:", fairMapper.layers);
        const updateData = layersToUpdateFormat(fairMapper.layers);

        // Adicionar tags ao updateData
        if (mapTags.length > 0) {
          updateData.tags = mapTags;
        }

        console.log("[MapEditor] Update data being sent:", updateData);
        console.log("[MapEditor] Total features:", updateData.features?.length);

        if (updateData.features && updateData.features.length > 0) {
          console.log(
            "[MapEditor] First feature to send:",
            JSON.stringify(updateData.features[0], null, 2)
          );
          console.log(
            "[MapEditor] First feature coordinates:",
            updateData.features[0].geometry?.coordinates
          );
        }

        await updateMutation.mutateAsync({ id, data: updateData });
        setHasUnsavedChanges(false);
        toast.success("Mapa salvo com sucesso!");
      }
    } catch (error) {
      console.error("Error saving map:", error);
      toast.error("Erro ao salvar mapa");
    }
  }, [
    fairMapper,
    isNewMap,
    id,
    mapData,
    mapTags,
    createMutation,
    updateMutation,
    navigate,
    queryClient,
  ]);

  const handleBack = () => {
    // Se não há alterações não salvas, volta diretamente
    if (!hasUnsavedChanges) {
      navigate("/dashboard/maps");
      return;
    }

    // Se há alterações não salvas, abre o modal
    setShowExitModal(true);
  };

  const handleSaveAndExit = async () => {
    try {
      await handleSaveToAPI();
      navigate("/dashboard/maps");
    } catch (error) {
      // O erro já é tratado no handleSaveToAPI
      console.error("Erro ao salvar antes de sair:", error);
    }
  };

  const handleExitWithoutSaving = () => {
    setShowExitModal(false);
    navigate("/dashboard/maps");
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const handleShareMap = async () => {
    if (!id || isNewMap) {
      toast.warning("Salve o mapa antes de compartilhar");
      return;
    }

    const publicUrl = `${window.location.origin}/maps/public/${id}`;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setLinkCopied(true);
      toast.success("Link público copiado!");

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Erro ao copiar link");
    }
  };

  const handleSaveTags = (tags: MapTag[]) => {
    setMapTags(tags);
    setHasUnsavedChanges(true);
    toast.success("Tags atualizadas! Salve o mapa para aplicar as alterações.");
  };

  if (isLoading && !isNewMap) {
    return <Loading />;
  }

  if (isError && !isNewMap) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Erro ao carregar mapa
          </h2>
          <p className="text-gray-600 mb-4">
            Não foi possível carregar o mapa solicitado.
          </p>
          <button
            onClick={() => navigate("/dashboard/maps")}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Voltar para lista de mapas
          </button>
        </div>
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden pt-[56px] md:pt-[64px]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                ← Voltar
              </button>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-gray-900">
                  {isNewMap ? "Novo Mapa" : mapData?.name || "Editando Mapa"}
                </h1>
                {!isNewMap && mapTags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {mapTags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${MapTagColors[tag]}`}
                      >
                        {MapTagLabels[tag]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {!isNewMap && (
                <button
                  onClick={() => setShowTagsModal(true)}
                  className="ml-2 inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                  title="Editar tags"
                >
                  🏷️ Tags
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Botão principal de salvar no banco de dados */}
              <button
                onClick={handleSaveToAPI}
                disabled={isSaving}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-semibold rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                  isSaving
                    ? "bg-gray-400"
                    : hasUnsavedChanges
                    ? "bg-green-600 hover:bg-green-700 shadow-lg"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                title={
                  hasUnsavedChanges
                    ? "Salvar alterações no banco de dados"
                    : "Tudo salvo no banco de dados"
                }
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white"
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
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    {hasUnsavedChanges ? (
                      <>
                        Salvar{" "}
                        <span className="hidden xl:inline">Alterações</span>
                      </>
                    ) : (
                      "Salvo"
                    )}
                  </>
                )}
                {hasUnsavedChanges && !isSaving && (
                  <span className="ml-1.5 text-xs">⚠️</span>
                )}
              </button>

              {/* Share button */}
              {!isNewMap && (
                <button
                  onClick={handleShareMap}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  title="Compartilhar link público"
                >
                  {linkCopied ? (
                    <>
                      <CheckIcon className="w-4 h-4 mr-1.5 text-green-600" />
                      <span className="hidden lg:inline text-green-600">
                        Copiado!
                      </span>
                    </>
                  ) : (
                    <>
                      <ShareIcon className="w-4 h-4 mr-1.5" />
                      <span className="hidden lg:inline">Compartilhar</span>
                    </>
                  )}
                </button>
              )}

              {/* Background image upload */}
              <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                <span className="hidden lg:inline">🖼️ Planta</span>
                <span className="lg:hidden">🖼️</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && fairMapper.uploadBackgroundImage) {
                      fairMapper
                        .uploadBackgroundImage(file)
                        .catch(console.error);
                    }
                    e.currentTarget.value = "";
                  }}
                  className="sr-only"
                />
              </label>

              {/* Opacity slider and remove button */}
              {fairMapper.backgroundMeta && (
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={fairMapper.backgroundMeta.opacity}
                    onChange={(e) =>
                      fairMapper.setBackgroundOpacity?.(Number(e.target.value))
                    }
                    className="w-24"
                  />
                  <button
                    onClick={() => fairMapper.removeBackgroundImage?.()}
                    title="Remover rascunho"
                    className="px-2 py-1 text-sm border rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={fairMapper.debugMode}
                  onChange={fairMapper.toggleDebugMode}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 hidden lg:inline">
                  Debug
                </span>
              </label>
            </div>
          </div>
        </div>
      </header>
      {/* Toolbar */}
      <Toolbar
        currentTool={fairMapper.currentTool}
        currentLayer={fairMapper.currentLayer}
        onToolChange={fairMapper.setTool}
        onLayerChange={fairMapper.setDrawMode}
      />
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center p-2 min-h-0">
          <div className="w-full h-full bg-white rounded-lg shadow-sm border">
            <Canvas canvasRef={fairMapper.canvasRef} />
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          layers={fairMapper.layers}
          selectedElement={fairMapper.selectedElement}
          onUpdateElement={fairMapper.updateElement}
          onDeleteElement={(id) => fairMapper.deleteElement(id)}
          debugMode={fairMapper.debugMode}
          debugInfo={fairMapper.debugInfo}
        />
      </div>

      {/* Modal de confirmação para sair */}
      <ConfirmExitModal
        isOpen={showExitModal}
        onClose={handleCancelExit}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSaving={handleExitWithoutSaving}
        isSaving={isSaving}
      />

      {/* Modal de edição de tags */}
      <EditMapTagsModal
        isOpen={showTagsModal}
        onClose={() => setShowTagsModal(false)}
        onSave={handleSaveTags}
        currentTags={mapTags}
        isLoading={false}
      />
    </div>
  );
}
