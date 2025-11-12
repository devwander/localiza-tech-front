import type { MapLayers } from "../types/fair-mapper";
import { ElementUtils } from "../utils/layer-utils";

/**
 * Dados de exemplo para demonstração do Fair Mapper
 */
export function createSampleData(): MapLayers {
  const layers: MapLayers = {
    background: [],
    submaps: [],
    locations: [],
  };

  // Adicionar alguns elementos de background
  layers.background.push(
    ElementUtils.createBackgroundElement(1, 50, 50, 700, 60, "Corredor"),
    ElementUtils.createBackgroundElement(2, 50, 150, 700, 60, "Corredor"),
    ElementUtils.createBackgroundElement(3, 300, 250, 200, 100, "Praça"),
    ElementUtils.createBackgroundElement(4, 50, 500, 80, 80, "Banheiro"),
    ElementUtils.createBackgroundElement(5, 150, 500, 80, 80, "Entrada")
  );

  // Adicionar submapas
  layers.submaps.push(
    ElementUtils.createSubmapElement(6, 100, 120, 200, 150),
    ElementUtils.createSubmapElement(7, 350, 120, 200, 150),
    ElementUtils.createSubmapElement(8, 600, 120, 150, 150)
  );

  // Adicionar locais
  layers.locations.push(
    ElementUtils.createLocationElement(9, 120, 140, 60, 40, "Alimentação"),
    ElementUtils.createLocationElement(10, 200, 140, 60, 40, "Alimentação"),
    ElementUtils.createLocationElement(11, 120, 200, 60, 40, "Vestuário"),
    ElementUtils.createLocationElement(12, 200, 200, 60, 40, "Artesanato"),

    ElementUtils.createLocationElement(13, 370, 140, 60, 40, "Serviços"),
    ElementUtils.createLocationElement(14, 450, 140, 60, 40, "Vestuário"),
    ElementUtils.createLocationElement(15, 370, 200, 60, 40, "Alimentação"),
    ElementUtils.createLocationElement(16, 450, 200, 60, 40, "Outros"),

    ElementUtils.createLocationElement(17, 620, 140, 60, 40, "Artesanato"),
    ElementUtils.createLocationElement(18, 690, 140, 60, 40, "Alimentação"),
    ElementUtils.createLocationElement(19, 620, 200, 60, 40, "Serviços"),
    ElementUtils.createLocationElement(20, 690, 200, 60, 40, "Vestuário")
  );

  // Ajustar nomes dos elementos
  layers.background[0].name = "Corredor Principal";
  layers.background[1].name = "Corredor Secundário";
  layers.background[2].name = "Praça Central";
  layers.background[3].name = "Banheiros";
  layers.background[4].name = "Entrada Principal";

  layers.submaps[0].name = "Setor Alimentação";
  layers.submaps[1].name = "Setor Vestuário";
  layers.submaps[2].name = "Setor Artesanato";

  layers.locations[0].name = "Frutas do João";
  layers.locations[1].name = "Verduras da Maria";
  layers.locations[2].name = "Roupas Fashion";
  layers.locations[3].name = "Arte & Craft";
  layers.locations[4].name = "Serviços Gerais";
  layers.locations[5].name = "Moda Jovem";
  layers.locations[6].name = "Lanchonete";
  layers.locations[7].name = "Diversos";
  layers.locations[8].name = "Artesanato Local";
  layers.locations[9].name = "Padaria";
  layers.locations[10].name = "Conserto de Roupas";
  layers.locations[11].name = "Boutique";

  return layers;
}
