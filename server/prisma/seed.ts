import "dotenv/config";

import bcrypt from "bcrypt";
import {
  Amenity,
  DocumentStatus,
  MatchStatus,
  MediaType,
  OfferStatus,
  Prisma,
  PrismaClient,
  ProposalStatus,
  PropertyType,
  UserRole,
} from "@prisma/client";

import { generateProperties } from "./generateProperties";
import { loadImagePool } from "./imagePool";
import { validateProperties } from "./validateProperties";

const prisma = new PrismaClient();
const passwordPlain = "123456";
const OFFER_TOTAL = 170;

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const BUYERS = [
  {
    name: "Henrique Oliveira",
    email: "henrique@emoveis.app",
    phone: "+55 11 99999-1111",
    profile: {
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
      income: 22000,
      downPayment: 240000,
      needsFinancing: true,
      purchaseType: "moradia",
      documentStatus: DocumentStatus.REVIEW,
      documentId: "DOC-HENRIQUE-2026",
      documentSubmittedAt: daysAgo(1),
    },
  },
  {
    name: "Ana Mendes",
    email: "ana@emoveis.app",
    phone: "+55 11 99999-0000",
    profile: {
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
      income: 18000,
      downPayment: 180000,
      needsFinancing: true,
      purchaseType: "investimento",
      documentStatus: DocumentStatus.VERIFIED,
      documentId: "DOC-ANA-2026",
      verifiedAt: daysAgo(4),
    },
  },
  {
    name: "Beatriz Albuquerque",
    email: "beatriz@emoveis.app",
    phone: "+55 81 99999-2222",
    profile: {
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",
      income: 14500,
      downPayment: 120000,
      needsFinancing: true,
      purchaseType: "moradia-recife",
      documentStatus: DocumentStatus.PENDING,
    },
  },
  {
    name: "Lucas Match",
    email: "lucas.match@emoveis.app",
    phone: "+55 81 98888-3333",
    profile: {
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
      income: 16500,
      downPayment: 150000,
      needsFinancing: true,
      purchaseType: "moradia",
      documentStatus: DocumentStatus.VERIFIED,
      documentId: "DOC-LUCAS-MATCH-2026",
      verifiedAt: daysAgo(2),
    },
  },
] as const;

const SELLERS = [
  {
    name: "Marina Costa",
    email: "marina@emoveis.app",
    phone: "+55 11 99876-1234",
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Rafael Lima",
    email: "rafael@emoveis.app",
    phone: "+55 11 97654-3210",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Sofia Andrade",
    email: "sofia@emoveis.app",
    phone: "+55 81 98888-1010",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Pedro Cavalcanti",
    email: "pedro@emoveis.app",
    phone: "+55 81 97777-2020",
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Carla Anunciante",
    email: "carla.seller@emoveis.app",
    phone: "+55 81 96666-4444",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80",
  },
] as const;

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
}

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

async function resetDatabase() {
  await prisma.notification.deleteMany();
  await prisma.offerVisit.deleteMany();
  await prisma.offerView.deleteMany();
  await prisma.savedOffer.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.match.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.offerMedia.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.passwordRecoveryCode.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
}

async function createUser(data: {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  passwordHash: string;
  profile?: {
    avatarUrl?: string;
    income?: number;
    downPayment?: number;
    needsFinancing?: boolean;
    purchaseType?: string;
    documentStatus?: DocumentStatus;
    documentId?: string;
    documentSubmittedAt?: Date;
    verifiedAt?: Date;
  };
}) {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      password: data.passwordHash,
      profile: data.profile ? { create: data.profile } : undefined,
    },
  });
}

async function createUsers(passwordHash: string) {
  const buyers = await Promise.all(
    BUYERS.map((buyer) =>
      createUser({
        ...buyer,
        role: UserRole.CLIENTE,
        passwordHash,
      }),
    ),
  );

  const sellers = await Promise.all(
    SELLERS.map((seller, index) =>
      createUser({
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        role: UserRole.VENDEDOR,
        passwordHash,
        profile: {
          avatarUrl: seller.avatarUrl,
          documentStatus: DocumentStatus.VERIFIED,
          verifiedAt: daysAgo(8 + index * 3),
        },
      }),
    ),
  );

  return { buyers, sellers };
}

async function createPreferences(buyers: Awaited<ReturnType<typeof createUsers>>["buyers"]) {
  const [henrique, ana, beatriz, lucasMatch] = buyers;

  const henriquePreference = await prisma.preference.create({
    data: {
      userId: henrique.id,
      title: "Busca principal em Sao Paulo",
      minPrice: 150000,
      maxPrice: 1500000,
      minAreaM2: 35,
      maxAreaM2: 180,
      minBedrooms: 2,
      minBathrooms: 1,
      minParkingSpots: 1,
      propertyTypes: [PropertyType.APARTAMENTO, PropertyType.COBERTURA, PropertyType.STUDIO],
      neighborhoods: ["Vila Madalena", "Pinheiros", "Itaim Bibi", "Perdizes", "Moema"],
      city: "Sao Paulo",
      state: "SP",
      desiredAmenities: [Amenity.PISCINA, Amenity.ACADEMIA, Amenity.PORTARIA, Amenity.PET_FRIENDLY, Amenity.VARANDA],
      isActive: true,
    },
  });

  const anaPreference = await prisma.preference.create({
    data: {
      userId: ana.id,
      title: "Curadoria para investimento",
      minPrice: 300000,
      maxPrice: 980000,
      minAreaM2: 28,
      maxAreaM2: 120,
      minBedrooms: 1,
      minBathrooms: 1,
      minParkingSpots: 0,
      propertyTypes: [PropertyType.STUDIO, PropertyType.APARTAMENTO],
      neighborhoods: ["Itaim Bibi", "Pinheiros", "Batel"],
      city: "Sao Paulo",
      state: "SP",
      desiredAmenities: [Amenity.MOBILIADO, Amenity.PORTARIA, Amenity.ACADEMIA],
      isActive: true,
    },
  });

  const beatrizPreference = await prisma.preference.create({
    data: {
      userId: beatriz.id,
      title: "Recife com foco em Boa Viagem e Zona Norte",
      minPrice: 250000,
      maxPrice: 1200000,
      minAreaM2: 35,
      maxAreaM2: 180,
      minBedrooms: 2,
      minBathrooms: 1,
      minParkingSpots: 1,
      propertyTypes: [PropertyType.APARTAMENTO, PropertyType.CASA, PropertyType.COBERTURA],
      neighborhoods: ["Boa Viagem", "Pina", "Casa Forte", "Gracas", "Espinheiro", "Aflitos", "Madalena", "Parnamirim"],
      city: "Recife",
      state: "PE",
      desiredAmenities: [Amenity.PISCINA, Amenity.PORTARIA, Amenity.PET_FRIENDLY, Amenity.VARANDA],
      isActive: true,
    },
  });

  const lucasMatchPreference = await prisma.preference.create({
    data: {
      userId: lucasMatch.id,
      title: "Cenario de teste com match fechado",
      minPrice: 200000,
      maxPrice: 950000,
      minAreaM2: 35,
      maxAreaM2: 160,
      minBedrooms: 2,
      minBathrooms: 1,
      minParkingSpots: 1,
      propertyTypes: [PropertyType.APARTAMENTO, PropertyType.CASA, PropertyType.STUDIO],
      neighborhoods: [],
      city: "Recife",
      state: "PE",
      desiredAmenities: [Amenity.PORTARIA, Amenity.PISCINA, Amenity.PET_FRIENDLY],
      isActive: true,
    },
  });

  return { henriquePreference, anaPreference, beatrizPreference, lucasMatchPreference };
}

async function createOffers(sellerIds: string[]) {
  const imagePool = await loadImagePool();
  const generatedProperties = generateProperties({
    total: OFFER_TOTAL,
    sellerIds,
    imagePool,
  });

  validateProperties(generatedProperties);

  for (const offerChunk of chunk(generatedProperties, 200)) {
    await prisma.offer.createMany({
      data: offerChunk.map((property) => ({
        title: property.title,
        description: property.images.some((image) => image.provider === "PEXELS")
          ? `${property.description} Fotos via Pexels: https://www.pexels.com`
          : property.description,
        price: property.price,
        areaM2: property.areaM2,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        parkingSpots: property.parkingSpots,
        propertyType: property.propertyType,
        status: property.status,
        neighborhood: property.neighborhood,
        city: property.city,
        state: property.state,
        address: property.address,
        amenities: property.amenities,
        userId: property.userId,
      })),
    });
  }

  const offers = await prisma.offer.findMany({
    where: { address: { startsWith: "Rua Seed " } },
    orderBy: { address: "asc" },
  });

  await prisma.offerMedia.createMany({
    data: offers.flatMap((offer, index) =>
      generatedProperties[index].images.map((image) => ({
        offerId: offer.id,
        type: MediaType.FOTO,
        url: image.url,
      })),
    ),
  });

  return { offers, generatedProperties };
}

async function createRelationshipData({
  buyers,
  sellers,
  preferences,
  offers,
}: {
  buyers: Awaited<ReturnType<typeof createUsers>>["buyers"];
  sellers: Awaited<ReturnType<typeof createUsers>>["sellers"];
  preferences: Awaited<ReturnType<typeof createPreferences>>;
  offers: Awaited<ReturnType<typeof createOffers>>["offers"];
}) {
  const [henrique, ana, beatriz, lucasMatch] = buyers;
  const carla = sellers.find((seller) => seller.email === "carla.seller@emoveis.app") ?? sellers[sellers.length - 1];
  const saoPauloOffers = offers.filter((offer) => offer.city === "Sao Paulo" && offer.status === OfferStatus.ATIVA);
  const recifeOffers = offers.filter((offer) => offer.city === "Recife" && offer.status === OfferStatus.ATIVA);
  const curitibaOffers = offers.filter((offer) => offer.city === "Curitiba" && offer.status === OfferStatus.ATIVA);
  const carlaOffers = offers.filter((offer) => offer.userId === carla.id && offer.status === OfferStatus.ATIVA);
  const otherSellerOffers = offers.filter((offer) => offer.userId !== carla.id && offer.status === OfferStatus.ATIVA);
  const lucasMatchedOffer = carlaOffers.find((offer) => offer.city === "Recife") ?? carlaOffers[0] ?? recifeOffers[0];
  const lucasPendingOffer = carlaOffers.find((offer) => offer.id !== lucasMatchedOffer?.id) ?? recifeOffers.find((offer) => offer.id !== lucasMatchedOffer?.id);
  const sellerSentProposalOffer = otherSellerOffers.find((offer) => offer.city === "Recife") ?? otherSellerOffers[0];

  const featuredOffers = [
    ...saoPauloOffers.slice(0, 5),
    ...recifeOffers.slice(0, 10),
    ...curitibaOffers.slice(0, 2),
  ];

  await prisma.match.createMany({
    data: featuredOffers.map((offer, index) => ({
      offerId: offer.id,
      preferenceId:
        offer.city === "Recife"
          ? preferences.beatrizPreference.id
          : offer.city === "Curitiba"
            ? preferences.anaPreference.id
            : preferences.henriquePreference.id,
      score: 94 - (index % 9) * 2,
      status: pick([MatchStatus.PENDENTE, MatchStatus.VISUALIZADO, MatchStatus.PROPOSTA_ENVIADA, MatchStatus.FEITO], index),
      createdAt: hoursAgo(index + 2),
    })),
  });

  if (lucasMatchedOffer) {
    await prisma.match.upsert({
      where: {
        offerId_preferenceId: {
          offerId: lucasMatchedOffer.id,
          preferenceId: preferences.lucasMatchPreference.id,
        },
      },
      update: { score: 98, status: MatchStatus.FEITO },
      create: {
        offerId: lucasMatchedOffer.id,
        preferenceId: preferences.lucasMatchPreference.id,
        score: 98,
        status: MatchStatus.FEITO,
        createdAt: hoursAgo(2),
      },
    });
  }

  const proposalTargets = [
    { buyerId: henrique.id, offer: saoPauloOffers[0], valueOffset: -40000, status: ProposalStatus.PENDENTE },
    { buyerId: henrique.id, offer: saoPauloOffers[1], valueOffset: -20000, status: ProposalStatus.ACEITA },
    { buyerId: ana.id, offer: curitibaOffers[0] ?? saoPauloOffers[2], valueOffset: -30000, status: ProposalStatus.RECUSADA },
    { buyerId: beatriz.id, offer: recifeOffers[0], valueOffset: -25000, status: ProposalStatus.PENDENTE },
    { buyerId: beatriz.id, offer: recifeOffers[1], valueOffset: -15000, status: ProposalStatus.ACEITA },
    { buyerId: lucasMatch.id, offer: lucasMatchedOffer, valueOffset: -10000, status: ProposalStatus.ACEITA },
    { buyerId: lucasMatch.id, offer: lucasPendingOffer, valueOffset: -20000, status: ProposalStatus.PENDENTE },
    { buyerId: carla.id, offer: sellerSentProposalOffer, valueOffset: -18000, status: ProposalStatus.PENDENTE },
  ].filter((item): item is { buyerId: string; offer: typeof offers[number]; valueOffset: number; status: ProposalStatus } => Boolean(item.offer));

  await prisma.proposal.createMany({
    data: proposalTargets.map((item, index) => ({
      offerId: item.offer.id,
      buyerId: item.buyerId,
      message: "Tenho interesse e gostaria de avancar com uma visita.",
      value: new Prisma.Decimal(Math.max(Number(item.offer.price) + item.valueOffset, 1000)),
      status: item.status,
      createdAt: hoursAgo(index * 6 + 3),
    })),
  });

  await prisma.savedOffer.createMany({
    data: [
      ...saoPauloOffers.slice(0, 4).map((offer) => ({ userId: henrique.id, offerId: offer.id })),
      ...recifeOffers.slice(0, 10).map((offer) => ({ userId: beatriz.id, offerId: offer.id })),
      ...curitibaOffers.slice(0, 3).map((offer) => ({ userId: ana.id, offerId: offer.id })),
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: henrique.id, offerId: saoPauloOffers[0]?.id, type: "match", title: "Novo match em Sao Paulo", description: "Um imovel compativel entrou no seu radar.", read: false, createdAt: hoursAgo(2) },
      { userId: beatriz.id, offerId: recifeOffers[0]?.id, type: "new_compatible", title: "Recife esta cheio de oportunidades", description: "Novos imoveis em Boa Viagem, Casa Forte e Gracas.", read: false, createdAt: hoursAgo(1) },
      { userId: sellers[2].id, offerId: recifeOffers[0]?.id, type: "proposal", title: "Nova proposta recebida", description: "Beatriz demonstrou interesse em um imovel no Recife.", read: false, createdAt: hoursAgo(3) },
      { userId: sellers[0].id, offerId: saoPauloOffers[1]?.id, type: "proposal", title: "Proposta aceita", description: "Uma negociacao foi marcada como aceita.", read: true, createdAt: daysAgo(1) },
      { userId: lucasMatch.id, offerId: lucasMatchedOffer?.id, type: "match", title: "Match fechado com Carla", description: "Seu interesse foi aceito e o contato do anunciante esta liberado.", read: false, createdAt: hoursAgo(1) },
      { userId: carla.id, offerId: lucasPendingOffer?.id, type: "proposal", title: "Proposta pendente recebida", description: "Lucas Match enviou uma proposta que ainda nao foi aceita.", read: false, createdAt: hoursAgo(2) },
      { userId: carla.id, offerId: sellerSentProposalOffer?.id, type: "interest_sent", title: "Proposta enviada pendente", description: "Voce enviou uma proposta para outro anunciante. Ela ainda esta pendente.", read: false, createdAt: hoursAgo(4) },
    ].filter((item) => Boolean(item.offerId)),
  });

  const analyticsOffers = [...saoPauloOffers.slice(0, 20), ...recifeOffers.slice(0, 60), ...offers.slice(0, 25)];
  await prisma.offerView.createMany({
    data: analyticsOffers.flatMap((offer, offerIndex) =>
      Array.from({ length: 8 + (offerIndex % 18) }, (_, index) => ({
        offerId: offer.id,
        userId: index % 4 === 0 ? henrique.id : index % 5 === 0 ? beatriz.id : index % 7 === 0 ? ana.id : null,
        createdAt: hoursAgo(index + offerIndex),
      })),
    ),
  });

  await prisma.offerVisit.createMany({
    data: [
      ...recifeOffers.slice(0, 5).map((offer, index) => ({
        offerId: offer.id,
        userId: beatriz.id,
        status: index % 2 === 0 ? "REQUESTED" : "SCHEDULED",
        scheduledFor: index % 2 === 0 ? null : daysFromNow(index + 1),
        createdAt: hoursAgo(index + 5),
      })),
      ...saoPauloOffers.slice(0, 3).map((offer, index) => ({
        offerId: offer.id,
        userId: henrique.id,
        status: "REQUESTED",
        createdAt: hoursAgo(index + 12),
      })),
    ],
  });
}

async function main() {
  console.log("Seeding Portal E-moveis...");
  await resetDatabase();

  const passwordHash = await bcrypt.hash(passwordPlain, 10);
  const { buyers, sellers } = await createUsers(passwordHash);
  const preferences = await createPreferences(buyers);
  const { offers, generatedProperties } = await createOffers(sellers.map((seller) => seller.id));
  await createRelationshipData({ buyers, sellers, preferences, offers });

  const countByCity = await prisma.offer.groupBy({
    by: ["state", "city"],
    _count: { _all: true },
    orderBy: [{ state: "asc" }, { city: "asc" }],
  });
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.offer.count(),
    prisma.offer.count({ where: { city: "Recife" } }),
    prisma.offer.count({ where: { propertyType: PropertyType.CASA } }),
    prisma.offer.count({ where: { propertyType: PropertyType.APARTAMENTO } }),
    prisma.offer.count({ where: { propertyType: PropertyType.STUDIO } }),
    prisma.offer.count({ where: { propertyType: PropertyType.COBERTURA } }),
    prisma.offerMedia.count(),
    prisma.match.count(),
    prisma.proposal.count(),
    prisma.savedOffer.count(),
  ]);

  console.log("Seed completed successfully.");
  console.table({
    users: counts[0],
    offers: counts[1],
    validatedProperties: generatedProperties.length,
    recifeOffers: counts[2],
    houses: counts[3],
    apartments: counts[4],
    studios: counts[5],
    penthouses: counts[6],
    media: counts[7],
    matches: counts[8],
    proposals: counts[9],
    savedOffers: counts[10],
  });
  console.table(countByCity.map((item) => ({ state: item.state, city: item.city, offers: item._count._all })));
  console.table([
    ...BUYERS.map((user) => ({ role: "comprador", email: user.email, password: passwordPlain })),
    ...SELLERS.map((user) => ({ role: "vendedor", email: user.email, password: passwordPlain })),
  ]);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


