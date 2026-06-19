import { PropertyType } from "@prisma/client";

import type { GeneratedProperty } from "./generateProperties";

function assertRule(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const RECENT_IMAGE_WINDOW = 24;

export function validateProperties(properties: GeneratedProperty[]) {
  const errors: string[] = [];
  const recentImages: Array<{ id: string; title: string }> = [];
  const imagesByState = new Map<string, Map<string, string>>();
  const imagesByCity = new Map<string, Map<string, string>>();

  for (const property of properties) {
    try {
      assertRule(property.images.length >= 1, `${property.title}: precisa de ao menos uma imagem.`);
      const stateImages = imagesByState.get(property.state) ?? new Map<string, string>();
      const cityKey = `${property.state}:${property.city}`;
      const cityImages = imagesByCity.get(cityKey) ?? new Map<string, string>();
      const recentDuplicate = property.images
        .map((image) => recentImages.find((recentImage) => recentImage.id === image.url))
        .find(Boolean);
      const stateDuplicate = property.images
        .map((image) => stateImages.get(image.url))
        .find(Boolean);
      const cityDuplicate = property.images
        .map((image) => cityImages.get(image.url))
        .find(Boolean);

      assertRule(
        !recentDuplicate,
        `${property.title}: imagem repetida muito perto de ${recentDuplicate?.title}.`,
      );
      assertRule(!stateDuplicate, `${property.title}: imagem repetida no mesmo estado de ${stateDuplicate}.`);
      assertRule(!cityDuplicate, `${property.title}: imagem repetida na mesma cidade de ${cityDuplicate}.`);

      if (property.subtype === "PENTHOUSE") {
        assertRule(
          property.images.every((image) => image.subtype === "PENTHOUSE"),
          `${property.title}: PENTHOUSE so pode usar imagem subtype PENTHOUSE.`,
        );
        assertRule(property.category === "APARTMENT", `${property.title}: PENTHOUSE sempre deve ser APARTMENT.`);
        assertRule(property.propertyType === PropertyType.COBERTURA, `${property.title}: PENTHOUSE deve persistir como COBERTURA no schema atual.`);
      }

      if (property.subtype === "SMALL_HOUSE") {
        assertRule(property.category === "HOUSE", `${property.title}: SMALL_HOUSE sempre deve ser HOUSE.`);
        assertRule(property.propertyType === PropertyType.CASA, `${property.title}: SMALL_HOUSE deve persistir como CASA.`);
      }

      if (property.subtype === "STUDIO") {
        assertRule(property.bedrooms <= 1, `${property.title}: STUDIO deve ter no maximo 1 quarto.`);
        assertRule(property.areaM2 >= 25 && property.areaM2 <= 60, `${property.title}: STUDIO deve ter area entre 25 e 60 m2.`);
        assertRule(property.propertyType === PropertyType.STUDIO, `${property.title}: STUDIO deve persistir como STUDIO.`);
      }

      if (property.subtype === "SMALL_HOUSE") {
        assertRule(
          property.images.every((image) => !image.tags.includes("BUILDING")),
          `${property.title}: casa pequena nao pode usar imagem de predio.`,
        );
      }

      if (property.category === "APARTMENT") {
        assertRule(
          property.images.every((image) => !image.tags.includes("GROUND_HOUSE")),
          `${property.title}: apartamento nao pode usar imagem de casa terrea.`,
        );
      }

      if (property.propertyType === PropertyType.COBERTURA || property.subtype === "PENTHOUSE") {
        assertRule(property.areaM2 >= 120, `${property.title}: cobertura deve ter area minima de 120 m2.`);
      }

      if (property.isLuxury) {
        assertRule(property.areaM2 >= 120, `${property.title}: imovel de luxo precisa ter area compativel.`);
        assertRule(Number(property.price) >= 1200000, `${property.title}: imovel de luxo precisa ter preco compativel.`);
        assertRule(
          property.images.every((image) => image.tags.includes("LUXURY")),
          `${property.title}: imovel de luxo precisa usar imagens com tag LUXURY.`,
        );
      }

      for (const image of property.images) {
        assertRule(
          image.subtype === property.subtype ||
            (property.subtype === "APARTMENT" && image.subtype === "APARTMENT") ||
            (property.subtype === "HOUSE" && image.subtype === "HOUSE") ||
            (property.subtype === "LAND" && image.tags.includes("GROUND_HOUSE")),
          `${property.title}: imagem ${image.id} incompatível com subtipo ${property.subtype}.`,
        );
      }
      property.images.forEach((image) => recentImages.push({ id: image.url, title: property.title }));
      property.images.forEach((image) => stateImages.set(image.url, property.title));
      property.images.forEach((image) => cityImages.set(image.url, property.title));
      imagesByState.set(property.state, stateImages);
      imagesByCity.set(cityKey, cityImages);
      if (recentImages.length > RECENT_IMAGE_WINDOW) recentImages.splice(0, recentImages.length - RECENT_IMAGE_WINDOW);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (errors.length) {
    throw new Error(`Seed invalida: ${errors.length} inconsistencias encontradas.\n${errors.slice(0, 30).join("\n")}`);
  }
}
