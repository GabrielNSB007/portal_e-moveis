export const PROPERTY_TYPES = ["APARTAMENTO", "CASA", "STUDIO", "COBERTURA", "TERRENO"] as const;
export const AMENITIES = [
  "PISCINA",
  "ACADEMIA",
  "CHURRASQUEIRA",
  "ELEVADOR",
  "PORTARIA",
  "MOBILIADO",
  "PET_FRIENDLY",
  "VARANDA",
  "AREA_SERVICO",
] as const;
export const MATCH_STATUS = ["PENDENTE", "VISUALIZADO", "PROPOSTA_ENVIADA", "RECUSADO", "FEITO"] as const;
export const PROPOSAL_STATUS = ["PENDENTE", "ACEITA", "RECUSADA", "CANCELADA"] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type Amenity = (typeof AMENITIES)[number];
export type MatchStatus = (typeof MATCH_STATUS)[number];
export type ProposalStatus = (typeof PROPOSAL_STATUS)[number];

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  APARTAMENTO: "Apartamento",
  CASA: "Casa",
  STUDIO: "Studio",
  COBERTURA: "Cobertura",
  TERRENO: "Terreno",
};

export const AMENITY_LABEL: Record<Amenity, string> = {
  PISCINA: "Piscina",
  ACADEMIA: "Academia",
  CHURRASQUEIRA: "Churrasqueira",
  ELEVADOR: "Elevador",
  PORTARIA: "Portaria",
  MOBILIADO: "Mobiliado",
  PET_FRIENDLY: "Pet friendly",
  VARANDA: "Varanda",
  AREA_SERVICO: "Área de serviço",
};

export const PROPOSAL_STATUS_LABEL: Record<ProposalStatus, string> = {
  PENDENTE: "Pendente",
  ACEITA: "Aceita",
  RECUSADA: "Recusada",
  CANCELADA: "Cancelada",
};
