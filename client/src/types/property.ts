export type Property = {
  id: string;
  title: string;
  neighborhood: string;
  city: string;
  state?: string;
  price: number;
  type: "Apartamento" | "Casa" | "Studio" | "Cobertura" | "Comercial";
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking: number;
  match: number;
  images: string[];
  description: string;
  amenities: string[];
  nearby: { name: string; distance: string; icon: string }[];
  reason: string;
  petFriendly: boolean;
  contact: {
    agent: string;
    phone: string;
    whatsapp: string;
    email: string;
  };
};
