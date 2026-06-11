export type Property = {
  id: string;
  title: string;
  neighborhood: string;
  city: string;
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
  contact: { agent: string; phone: string; whatsapp: string; email: string };
};

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const properties: Property[] = [
  {
    id: "p1",
    title: "Cobertura com vista panorâmica",
    neighborhood: "Vila Madalena",
    city: "São Paulo",
    price: 1280000,
    type: "Cobertura",
    bedrooms: 3,
    bathrooms: 2,
    area: 142,
    parking: 2,
    match: 94,
    images: [
      img("photo-1568605114967-8130f3a36994"),
      img("photo-1502672260266-1c1ef2d93688"),
      img("photo-1560448204-e02f11c3d0e2"),
      img("photo-1505691938895-1758d7feb511"),
    ],
    description:
      "Cobertura duplex completamente reformada, com terraço gourmet, vista privilegiada e acabamento de altíssimo padrão.",
    amenities: ["Piscina", "Academia", "Pet place", "Segurança 24h", "Coworking", "Terraço"],
    nearby: [
      { name: "Metrô Vila Madalena", distance: "350m", icon: "Train" },
      { name: "Parque Villa-Lobos", distance: "1,2km", icon: "Trees" },
      { name: "Hospital Albert Einstein", distance: "2,5km", icon: "Cross" },
    ],
    reason: "Compatível com sua preferência por segurança, modernidade e mobilidade.",
    petFriendly: true,
    contact: { agent: "Marina Costa", phone: "+55 11 99876-1234", whatsapp: "+55 11 99876-1234", email: "marina@imobiliaria.com" },
  },
  {
    id: "p2",
    title: "Apartamento moderno no Pinheiros",
    neighborhood: "Pinheiros",
    city: "São Paulo",
    price: 890000,
    type: "Apartamento",
    bedrooms: 2,
    bathrooms: 2,
    area: 78,
    parking: 1,
    match: 88,
    images: [
      img("photo-1522708323590-d24dbb6b0267"),
      img("photo-1493809842364-78817add7ffb"),
    ],
    description:
      "Apartamento moderno, planta inteligente, ideal para quem busca praticidade e localização central.",
    amenities: ["Academia", "Lavanderia", "Bicicletário", "Portaria 24h"],
    nearby: [
      { name: "Metrô Faria Lima", distance: "500m", icon: "Train" },
      { name: "Shopping Iguatemi", distance: "1km", icon: "ShoppingBag" },
    ],
    reason: "Combina com seu estilo moderno e proximidade ao trabalho.",
    petFriendly: false,
    contact: { agent: "Júlia Andrade", phone: "+55 11 98765-4321", whatsapp: "+55 11 98765-4321", email: "julia@imobiliaria.com" },
  },
  {
    id: "p3",
    title: "Studio minimalista premium",
    neighborhood: "Itaim Bibi",
    city: "São Paulo",
    price: 4200,
    type: "Studio",
    bedrooms: 1,
    bathrooms: 1,
    area: 38,
    parking: 1,
    match: 91,
    images: [
      img("photo-1502672023488-70e25813eb80"),
      img("photo-1505693416388-ac5ce068fe85"),
      img("photo-1554995207-c18c203602cb"),
    ],
    description:
      "Studio compacto com design minimalista, mobiliado e equipado. Pronto para morar.",
    amenities: ["Coworking", "Rooftop", "Pet friendly", "Smart lock"],
    nearby: [
      { name: "Faria Lima", distance: "200m", icon: "Train" },
      { name: "Parque do Povo", distance: "800m", icon: "Trees" },
    ],
    reason: "Estilo minimalista + localização premium combinam com seu perfil.",
    petFriendly: true,
    contact: { agent: "Rafael Lima", phone: "+55 11 97654-3210", whatsapp: "+55 11 97654-3210", email: "rafael@imobiliaria.com" },
  },
  {
    id: "p4",
    title: "Casa familiar com quintal",
    neighborhood: "Alto de Pinheiros",
    city: "São Paulo",
    price: 2150000,
    type: "Casa",
    bedrooms: 4,
    bathrooms: 3,
    area: 220,
    parking: 3,
    match: 86,
    images: [
      img("photo-1564013799919-ab600027ffc6"),
      img("photo-1583608205776-bfd35f0d9f83"),
      img("photo-1600585154340-be6161a56a0c"),
    ],
    description:
      "Casa em rua tranquila, quintal arborizado, ideal para famílias que buscam qualidade de vida.",
    amenities: ["Quintal", "Garagem 3 vagas", "Churrasqueira", "Pet friendly"],
    nearby: [
      { name: "Escola Móbile", distance: "600m", icon: "GraduationCap" },
      { name: "Parque Villa-Lobos", distance: "1km", icon: "Trees" },
    ],
    reason: "Perfil familiar com área de lazer e ambiente silencioso.",
    petFriendly: true,
    contact: { agent: "Carla Mendes", phone: "+55 11 96543-2109", whatsapp: "+55 11 96543-2109", email: "carla@imobiliaria.com" },
  },
  {
    id: "p5",
    title: "Loft industrial reformado",
    neighborhood: "Vila Olímpia",
    city: "São Paulo",
    price: 6800,
    type: "Apartamento",
    bedrooms: 1,
    bathrooms: 1,
    area: 65,
    parking: 1,
    match: 82,
    images: [
      img("photo-1560185007-cde436f6a4d0"),
      img("photo-1556909114-f6e7ad7d3136"),
      img("photo-1556228453-efd6c1ff04f6"),
    ],
    description:
      "Loft com pé direito alto, estética industrial e localização premium.",
    amenities: ["Academia", "Piscina", "Lounge", "Concierge"],
    nearby: [
      { name: "JK Iguatemi", distance: "450m", icon: "ShoppingBag" },
      { name: "Vila Olímpia", distance: "300m", icon: "Train" },
    ],
    reason: "Estilo moderno e proximidade ao trabalho.",
    petFriendly: false,
    contact: { agent: "Diego Ramos", phone: "+55 11 95432-1098", whatsapp: "+55 11 95432-1098", email: "diego@imobiliaria.com" },
  },
  {
    id: "p6",
    title: "Garden pet friendly em Perdizes",
    neighborhood: "Perdizes",
    city: "São Paulo",
    price: 5500,
    type: "Apartamento",
    bedrooms: 2,
    bathrooms: 2,
    area: 92,
    parking: 1,
    match: 89,
    images: [
      img("photo-1600596542815-ffad4c1539a9"),
      img("photo-1600210492486-724fe5c67fb0"),
      img("photo-1600607687939-ce8a6c25118c"),
    ],
    description:
      "Garden com 30m² de quintal privativo. Perfeito para quem tem pets.",
    amenities: ["Pet place", "Quintal privativo", "Playground", "Salão de festas"],
    nearby: [
      { name: "Praça Pompeia", distance: "400m", icon: "Trees" },
      { name: "PUC-SP", distance: "1km", icon: "GraduationCap" },
    ],
    reason: "Pet friendly + área de lazer combinam com seu perfil.",
    petFriendly: true,
    contact: { agent: "Bianca Toledo", phone: "+55 11 94321-0987", whatsapp: "+55 11 94321-0987", email: "bianca@imobiliaria.com" },
  },
];

export type InterestStatus =
  | "Enviado"
  | "Interesse enviado"
  | "Visualizado"
  | "Aguardando resposta"
  | "Proposta recebida"
  | "Match"
  | "Match formado";

export type SentInterest = {
  id: string;
  propertyId: string;
  status: InterestStatus;
  sentAt: string;
  lastUpdate: string;
};

export const sentInterests: SentInterest[] = [
  { id: "s1", propertyId: "p1", status: "Match", sentAt: "há 3 dias", lastUpdate: "agora" },
  { id: "s2", propertyId: "p3", status: "Proposta recebida", sentAt: "há 2 dias", lastUpdate: "há 5h" },
  { id: "s3", propertyId: "p2", status: "Visualizado", sentAt: "ontem", lastUpdate: "há 3h" },
  { id: "s4", propertyId: "p5", status: "Aguardando resposta", sentAt: "ontem", lastUpdate: "ontem" },
  { id: "s5", propertyId: "p4", status: "Enviado", sentAt: "agora", lastUpdate: "agora" },
];

export type ReceivedInterest = {
  id: string;
  propertyId: string;
  reason: string;
  receivedAt: string;
  from: "Sistema" | "Corretor";
};

export const receivedInterests: ReceivedInterest[] = [
  {
    id: "r1",
    propertyId: "p6",
    reason: "Este imóvel combina com seu perfil",
    receivedAt: "há 1h",
    from: "Sistema",
  },
  {
    id: "r2",
    propertyId: "p4",
    reason: "Um corretor deseja apresentar este imóvel",
    receivedAt: "há 4h",
    from: "Corretor",
  },
  {
    id: "r3",
    propertyId: "p5",
    reason: "Novo imóvel compatível na sua região",
    receivedAt: "ontem",
    from: "Sistema",
  },
];

export type Match = {
  id: string;
  propertyId: string;
  matchedAt: string;
  isNew: boolean;
  status: "Novo Match" | "Interesse enviado" | "Visita agendada" | "Em negociação";
  step: 1 | 2 | 3 | 4;
};

export const matches: Match[] = [
  { id: "m1", propertyId: "p1", matchedAt: "há 2h", isNew: true, status: "Novo Match", step: 4 },
  { id: "m2", propertyId: "p3", matchedAt: "ontem", isNew: false, status: "Visita agendada", step: 3 },
];

export type AlertType =
  | "match"
  | "interest_received"
  | "proposal"
  | "price_drop"
  | "new_compatible"
  | "interest_sent";

export type Alert = {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  time: string;
  group: "Hoje" | "Ontem" | "Esta semana";
  propertyId?: string;
  read: boolean;
};

export const alerts: Alert[] = [
  {
    id: "a1",
    type: "match",
    title: "Novo match! 🎉",
    description: "Você e o anunciante da Cobertura Vila Madalena se interessaram mutuamente.",
    time: "agora",
    group: "Hoje",
    propertyId: "p1",
    read: false,
  },
  {
    id: "a2",
    type: "proposal",
    title: "Proposta recebida",
    description: "O proprietário do Studio Itaim respondeu sua contraproposta.",
    time: "há 2h",
    group: "Hoje",
    propertyId: "p3",
    read: false,
  },
  {
    id: "a3",
    type: "interest_received",
    title: "Alguém se interessou em apresentar um imóvel",
    description: "Um corretor acredita que a Casa Alto de Pinheiros combina com você.",
    time: "há 5h",
    group: "Hoje",
    propertyId: "p4",
    read: true,
  },
  {
    id: "a4",
    type: "price_drop",
    title: "Imóvel baixou de preço",
    description: "Loft Vila Olímpia agora está 8% mais barato.",
    time: "ontem",
    group: "Ontem",
    propertyId: "p5",
    read: true,
  },
  {
    id: "a5",
    type: "new_compatible",
    title: "Novo imóvel compatível",
    description: "Garden em Perdizes com 89% de compatibilidade.",
    time: "ontem",
    group: "Ontem",
    propertyId: "p6",
    read: true,
  },
  {
    id: "a6",
    type: "interest_sent",
    title: "Seu interesse foi enviado",
    description: "O anunciante do Apartamento Pinheiros foi notificado.",
    time: "há 3 dias",
    group: "Esta semana",
    propertyId: "p2",
    read: true,
  },
];

export const user = {
  name: "Ana Mendes",
  email: "ana@emoveis.app",
  phone: "+55 11 99999-0000",
  avatar: "https://i.pravatar.cc/150?img=49",
  income: 18000,
  needsFinancing: true,
  urgency: "Quero comprar logo" as const,
  stats: { matches: 2, viewed: 87, saved: 9, interests: 5 },
  preferences: {
    objective: "Comprar",
    cities: ["São Paulo"],
    neighborhoods: ["Vila Madalena", "Pinheiros", "Perdizes"],
    budget: [600000, 1500000] as [number, number],
    types: ["Apartamento", "Cobertura"],
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    petFriendly: true,
    security: true,
    nearby: ["Metrô", "Parques"],
    lifestyle: ["Segurança", "Moderno", "Transporte fácil"],
  },
};

export const SEARCH_STYLES = [
  { id: "exploring", label: "Apenas explorando", desc: "Estou conhecendo o mercado" },
  { id: "planning", label: "Planejando próximos meses", desc: "Vou comprar em 3-6 meses" },
  { id: "soon", label: "Quero comprar logo", desc: "Pronto para visitar e fechar" },
  { id: "urgent", label: "Urgente", desc: "Preciso decidir nas próximas semanas" },
] as const;

export const profileCompleteness = 78;

export const propertyById = (id: string) => properties.find((p) => p.id === id);
export const isMatched = (propertyId: string) =>
  matches.some((m) => m.propertyId === propertyId);

export const fmtCurrency = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
