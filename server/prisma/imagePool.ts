export type ImageType = "INTERIOR" | "EXTERIOR" | "BUILDING";

export type ImageSubtype =
  | "APARTMENT"
  | "PENTHOUSE"
  | "HOUSE"
  | "SMALL_HOUSE"
  | "STUDIO"
  | "LUXURY_APARTMENT"
  | "LUXURY_HOUSE";

export type ImageTag =
  | "APARTMENT"
  | "BUILDING"
  | "GROUND_HOUSE"
  | "INTERIOR"
  | "EXTERIOR"
  | "LUXURY"
  | "COMPACT"
  | "FAMILY"
  | "URBAN"
  | "BALCONY";

export type ImageCatalogItem = {
  id: string;
  url: string;
  type: ImageType;
  subtype: ImageSubtype;
  tags: ImageTag[];
  provider?: "CURATED" | "PEXELS";
  sourceUrl?: string;
  photographer?: string;
  searchQuery?: string;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82`;

const pexelsStatic = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

export const IMAGE_POOL: ImageCatalogItem[] = [
  { id: "apt-001", url: unsplash("photo-1522708323590-d24dbb6b0267"), type: "INTERIOR", subtype: "APARTMENT", tags: ["APARTMENT", "INTERIOR", "URBAN"] },
  { id: "apt-002", url: unsplash("photo-1493809842364-78817add7ffb"), type: "INTERIOR", subtype: "APARTMENT", tags: ["APARTMENT", "INTERIOR", "FAMILY"] },
  { id: "apt-003", url: unsplash("photo-1505691938895-1758d7feb511"), type: "INTERIOR", subtype: "APARTMENT", tags: ["APARTMENT", "INTERIOR"] },
  { id: "apt-004", url: unsplash("photo-1560448204-e02f11c3d0e2"), type: "INTERIOR", subtype: "APARTMENT", tags: ["APARTMENT", "INTERIOR", "URBAN"] },
  { id: "apt-005", url: unsplash("photo-1600607687939-ce8a6c25118c"), type: "INTERIOR", subtype: "APARTMENT", tags: ["APARTMENT", "INTERIOR", "FAMILY"] },

  { id: "studio-001", url: unsplash("photo-1502672023488-70e25813eb80"), type: "INTERIOR", subtype: "STUDIO", tags: ["APARTMENT", "INTERIOR", "COMPACT", "URBAN"] },
  { id: "studio-002", url: unsplash("photo-1505693416388-ac5ce068fe85"), type: "INTERIOR", subtype: "STUDIO", tags: ["APARTMENT", "INTERIOR", "COMPACT"] },
  { id: "studio-003", url: unsplash("photo-1554995207-c18c203602cb"), type: "INTERIOR", subtype: "STUDIO", tags: ["APARTMENT", "INTERIOR", "COMPACT", "URBAN"] },
  { id: "studio-004", url: pexelsStatic(271624), type: "INTERIOR", subtype: "STUDIO", tags: ["APARTMENT", "INTERIOR", "COMPACT"], provider: "PEXELS", sourceUrl: "https://www.pexels.com" },
  { id: "studio-005", url: pexelsStatic(276724), type: "INTERIOR", subtype: "STUDIO", tags: ["APARTMENT", "INTERIOR", "COMPACT"], provider: "PEXELS", sourceUrl: "https://www.pexels.com" },
  { id: "studio-006", url: pexelsStatic(1457842), type: "INTERIOR", subtype: "STUDIO", tags: ["APARTMENT", "INTERIOR", "COMPACT", "URBAN"], provider: "PEXELS", sourceUrl: "https://www.pexels.com" },
  { id: "studio-007", url: pexelsStatic(1643383), type: "INTERIOR", subtype: "STUDIO", tags: ["APARTMENT", "INTERIOR", "COMPACT"], provider: "PEXELS", sourceUrl: "https://www.pexels.com" },
  { id: "studio-008", url: pexelsStatic(1571460), type: "INTERIOR", subtype: "STUDIO", tags: ["APARTMENT", "INTERIOR", "COMPACT", "URBAN"], provider: "PEXELS", sourceUrl: "https://www.pexels.com" },
  { id: "studio-009", url: pexelsStatic(2079246), type: "INTERIOR", subtype: "STUDIO", tags: ["APARTMENT", "INTERIOR", "COMPACT"], provider: "PEXELS", sourceUrl: "https://www.pexels.com" },

  { id: "penthouse-001", url: unsplash("photo-1568605114967-8130f3a36994"), type: "INTERIOR", subtype: "PENTHOUSE", tags: ["APARTMENT", "INTERIOR", "LUXURY", "BALCONY"] },
  { id: "penthouse-002", url: unsplash("photo-1502672260266-1c1ef2d93688"), type: "INTERIOR", subtype: "PENTHOUSE", tags: ["APARTMENT", "INTERIOR", "LUXURY"] },
  { id: "penthouse-003", url: unsplash("photo-1600566753190-17f0baa2a6c3"), type: "INTERIOR", subtype: "PENTHOUSE", tags: ["APARTMENT", "INTERIOR", "LUXURY", "FAMILY"] },

  { id: "lux-apt-001", url: unsplash("photo-1600585154340-be6161a56a0c"), type: "INTERIOR", subtype: "LUXURY_APARTMENT", tags: ["APARTMENT", "INTERIOR", "LUXURY", "FAMILY"] },
  { id: "lux-apt-002", url: unsplash("photo-1560185007-cde436f6a4d0"), type: "INTERIOR", subtype: "LUXURY_APARTMENT", tags: ["APARTMENT", "INTERIOR", "LUXURY"] },
  { id: "lux-apt-003", url: unsplash("photo-1556909114-f6e7ad7d3136"), type: "INTERIOR", subtype: "LUXURY_APARTMENT", tags: ["APARTMENT", "INTERIOR", "LUXURY"] },

  { id: "house-001", url: unsplash("photo-1564013799919-ab600027ffc6"), type: "EXTERIOR", subtype: "HOUSE", tags: ["GROUND_HOUSE", "EXTERIOR", "FAMILY"] },
  { id: "house-002", url: unsplash("photo-1583608205776-bfd35f0d9f83"), type: "EXTERIOR", subtype: "HOUSE", tags: ["GROUND_HOUSE", "EXTERIOR", "FAMILY"] },
  { id: "house-003", url: unsplash("photo-1600047509807-ba8f99d2cdde"), type: "EXTERIOR", subtype: "HOUSE", tags: ["GROUND_HOUSE", "EXTERIOR"] },
  { id: "house-004", url: unsplash("photo-1600596542815-ffad4c1539a9"), type: "INTERIOR", subtype: "HOUSE", tags: ["GROUND_HOUSE", "INTERIOR", "FAMILY"] },

  { id: "small-house-001", url: unsplash("photo-1600210492486-724fe5c67fb0"), type: "INTERIOR", subtype: "SMALL_HOUSE", tags: ["GROUND_HOUSE", "INTERIOR", "COMPACT"] },
  { id: "small-house-002", url: unsplash("photo-1556228453-efd6c1ff04f6"), type: "INTERIOR", subtype: "SMALL_HOUSE", tags: ["GROUND_HOUSE", "INTERIOR", "COMPACT"] },

  { id: "lux-house-001", url: unsplash("photo-1600585154340-be6161a56a0c"), type: "EXTERIOR", subtype: "LUXURY_HOUSE", tags: ["GROUND_HOUSE", "EXTERIOR", "LUXURY", "FAMILY"] },
  { id: "lux-house-002", url: unsplash("photo-1600566753190-17f0baa2a6c3"), type: "INTERIOR", subtype: "LUXURY_HOUSE", tags: ["GROUND_HOUSE", "INTERIOR", "LUXURY", "FAMILY"] },

  { id: "building-001", url: unsplash("photo-1560448204-e02f11c3d0e2"), type: "BUILDING", subtype: "APARTMENT", tags: ["APARTMENT", "BUILDING", "URBAN"] },
  { id: "building-002", url: unsplash("photo-1560185007-cde436f6a4d0"), type: "BUILDING", subtype: "LUXURY_APARTMENT", tags: ["APARTMENT", "BUILDING", "LUXURY", "URBAN"] },
];

type PexelsPhoto = {
  id: number;
  url: string;
  photographer: string;
  src: {
    large2x?: string;
    large?: string;
    landscape?: string;
  };
};

type PexelsResponse = {
  photos?: PexelsPhoto[];
};

const PEXELS_QUERIES: Array<{
  query: string;
  subtype: ImageSubtype;
  type: ImageType;
  tags: ImageTag[];
}> = [
  { query: "apartment interior real estate", subtype: "APARTMENT", type: "INTERIOR", tags: ["APARTMENT", "INTERIOR", "URBAN"] },
  { query: "modern apartment living room", subtype: "APARTMENT", type: "INTERIOR", tags: ["APARTMENT", "INTERIOR", "FAMILY"] },
  { query: "apartment kitchen living room", subtype: "APARTMENT", type: "INTERIOR", tags: ["APARTMENT", "INTERIOR"] },
  { query: "small studio apartment interior", subtype: "STUDIO", type: "INTERIOR", tags: ["APARTMENT", "INTERIOR", "COMPACT", "URBAN"] },
  { query: "compact apartment interior", subtype: "STUDIO", type: "INTERIOR", tags: ["APARTMENT", "INTERIOR", "COMPACT"] },
  { query: "studio apartment bed living room", subtype: "STUDIO", type: "INTERIOR", tags: ["APARTMENT", "INTERIOR", "COMPACT"] },
  { query: "luxury penthouse apartment terrace", subtype: "PENTHOUSE", type: "INTERIOR", tags: ["APARTMENT", "INTERIOR", "LUXURY", "BALCONY"] },
  { query: "penthouse apartment interior luxury", subtype: "PENTHOUSE", type: "INTERIOR", tags: ["APARTMENT", "INTERIOR", "LUXURY"] },
  { query: "luxury apartment balcony interior", subtype: "PENTHOUSE", type: "INTERIOR", tags: ["APARTMENT", "INTERIOR", "LUXURY", "BALCONY"] },
  { query: "luxury apartment interior", subtype: "LUXURY_APARTMENT", type: "INTERIOR", tags: ["APARTMENT", "INTERIOR", "LUXURY"] },
  { query: "high end apartment interior", subtype: "LUXURY_APARTMENT", type: "INTERIOR", tags: ["APARTMENT", "INTERIOR", "LUXURY"] },
  { query: "luxury condominium apartment", subtype: "LUXURY_APARTMENT", type: "INTERIOR", tags: ["APARTMENT", "INTERIOR", "LUXURY", "URBAN"] },
  { query: "small house interior real estate", subtype: "SMALL_HOUSE", type: "INTERIOR", tags: ["GROUND_HOUSE", "INTERIOR", "COMPACT"] },
  { query: "cozy small house living room", subtype: "SMALL_HOUSE", type: "INTERIOR", tags: ["GROUND_HOUSE", "INTERIOR", "COMPACT"] },
  { query: "tiny house interior", subtype: "SMALL_HOUSE", type: "INTERIOR", tags: ["GROUND_HOUSE", "INTERIOR", "COMPACT"] },
  { query: "family house living room", subtype: "HOUSE", type: "INTERIOR", tags: ["GROUND_HOUSE", "INTERIOR", "FAMILY"] },
  { query: "house kitchen dining room", subtype: "HOUSE", type: "INTERIOR", tags: ["GROUND_HOUSE", "INTERIOR", "FAMILY"] },
  { query: "simple house interior real estate", subtype: "HOUSE", type: "INTERIOR", tags: ["GROUND_HOUSE", "INTERIOR"] },
  { query: "luxury house interior", subtype: "LUXURY_HOUSE", type: "INTERIOR", tags: ["GROUND_HOUSE", "INTERIOR", "LUXURY", "FAMILY"] },
  { query: "luxury house living room interior", subtype: "LUXURY_HOUSE", type: "INTERIOR", tags: ["GROUND_HOUSE", "INTERIOR", "LUXURY", "FAMILY"] },
  { query: "luxury home kitchen interior", subtype: "LUXURY_HOUSE", type: "INTERIOR", tags: ["GROUND_HOUSE", "INTERIOR", "LUXURY"] },
];

async function fetchPexelsImages() {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  const results = await Promise.all(
    PEXELS_QUERIES.map(async (queryConfig) => {
      const url = new URL("https://api.pexels.com/v1/search");
      url.searchParams.set("query", queryConfig.query);
      url.searchParams.set("orientation", "landscape");
      url.searchParams.set("per_page", "80");

      const response = await fetch(url, {
        headers: {
          Authorization: apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Pexels API falhou para "${queryConfig.query}": ${response.status} ${response.statusText}`);
      }

      const payload = (await response.json()) as PexelsResponse;
      return (payload.photos ?? []).map((photo): ImageCatalogItem => ({
        id: `pexels-${queryConfig.subtype.toLowerCase()}-${photo.id}`,
        url: photo.src.large2x ?? photo.src.large ?? photo.src.landscape ?? photo.url,
        type: queryConfig.type,
        subtype: queryConfig.subtype,
        tags: queryConfig.tags,
        provider: "PEXELS",
        sourceUrl: photo.url,
        photographer: photo.photographer,
        searchQuery: queryConfig.query,
      }));
    }),
  );

  return Array.from(new Map(results.flat().map((image) => [image.url, image])).values());
}

export async function loadImagePool() {
  if (process.env.SEED_IMAGE_PROVIDER !== "pexels") return IMAGE_POOL;

  const pexelsImages = await fetchPexelsImages();
  if (!pexelsImages.length) return IMAGE_POOL;

  return pexelsImages;
}
