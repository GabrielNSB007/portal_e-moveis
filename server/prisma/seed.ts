import bcrypt from "bcrypt";
import {
  Amenity,
  MediaType,
  MatchStatus,
  Prisma,
  PrismaClient,
  ProposalStatus,
  PropertyType,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning database...");

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

  const passwordHash = await bcrypt.hash("123456", 10);

  console.log("Creating users...");
  const henrique = await prisma.user.create({
    data: {
      name: "Henrique",
      email: "henrique@emoveis.app",
      password: passwordHash,
      role: UserRole.CLIENTE,
      phone: "+55 11 99999-1111",
    },
  });

  const ana = await prisma.user.create({
    data: {
      name: "Ana",
      email: "ana@emoveis.app",
      password: passwordHash,
      role: UserRole.CLIENTE,
      phone: "+55 11 99999-2222",
    },
  });

  const marina = await prisma.user.create({
    data: {
      name: "Marina",
      email: "marina@emoveis.app",
      password: passwordHash,
      role: UserRole.VENDEDOR,
      phone: "+55 11 98888-3333",
    },
  });

  const rafael = await prisma.user.create({
    data: {
      name: "Rafael",
      email: "rafael@emoveis.app",
      password: passwordHash,
      role: UserRole.VENDEDOR,
      phone: "+55 11 97777-4444",
    },
  });

  console.log("Creating buyer profiles...");
  await prisma.userProfile.create({
    data: {
      userId: henrique.id,
      avatarUrl: "https://images.unsplash.com/photo-1603415526960-f7e0328a66ff?auto=format&fit=crop&w=400&q=80",
      income: new Prisma.Decimal("12000.00"),
      downPayment: new Prisma.Decimal("45000.00"),
      needsFinancing: true,
      purchaseType: "COMPRA",
      documentId: "12345678901",
      documentStatus: "VERIFIED",
      verifiedAt: new Date(),
    },
  });

  await prisma.userProfile.create({
    data: {
      userId: ana.id,
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      income: new Prisma.Decimal("8600.00"),
      downPayment: new Prisma.Decimal("20000.00"),
      needsFinancing: true,
      purchaseType: "COMPRA",
      documentId: "10987654321",
      documentStatus: "PENDING",
    },
  });

  console.log("Creating offers...");
  const offers = await Promise.all([
    prisma.offer.create({
      data: {
        title: "Apartamento com varanda na Vila Madalena",
        description:
          "Apartamento ensolarado com varanda gourmet, 2 quartos, 1 vaga e localização privilegiada.",
        price: new Prisma.Decimal("750000.00"),
        areaM2: 75,
        bedrooms: 2,
        bathrooms: 2,
        parkingSpots: 1,
        propertyType: PropertyType.APARTAMENTO,
        neighborhood: "Vila Madalena",
        city: "Sao Paulo",
        state: "SP",
        address: "Rua Harmonia, 232",
        amenities: [Amenity.PISCINA, Amenity.PORTARIA, Amenity.VARANDA, Amenity.PET_FRIENDLY],
        userId: marina.id,
        media: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80",
              type: MediaType.FOTO,
            },
            {
              url: "https://images.unsplash.com/photo-1598928506314-35f5d30f70d9?auto=format&fit=crop&w=1400&q=80",
              type: MediaType.FOTO,
            },
          ],
        },
      },
    }),
    prisma.offer.create({
      data: {
        title: "Cobertura moderna em Pinheiros",
        description: "Cobertura com terraço, piscina privada e vista para a cidade.",
        price: new Prisma.Decimal("1480000.00"),
        areaM2: 155,
        bedrooms: 3,
        bathrooms: 3,
        parkingSpots: 2,
        propertyType: PropertyType.COBERTURA,
        neighborhood: "Pinheiros",
        city: "Sao Paulo",
        state: "SP",
        address: "Rua dos Pinheiros, 75",
        amenities: [Amenity.PISCINA, Amenity.ACADEMIA, Amenity.VARANDA],
        userId: marina.id,
        media: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
              type: MediaType.FOTO,
            },
          ],
        },
      },
    }),
    prisma.offer.create({
      data: {
        title: "Studio prático no Itaim Bibi",
        description: "Studio compacto e bem localizado, ideal para quem busca mobilidade.",
        price: new Prisma.Decimal("420000.00"),
        areaM2: 35,
        bedrooms: 1,
        bathrooms: 1,
        parkingSpots: 0,
        propertyType: PropertyType.STUDIO,
        neighborhood: "Itaim Bibi",
        city: "Sao Paulo",
        state: "SP",
        address: "Alameda Santos, 109",
        amenities: [Amenity.PORTARIA, Amenity.PET_FRIENDLY],
        userId: rafael.id,
        media: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1400&q=80",
              type: MediaType.FOTO,
            },
          ],
        },
      },
    }),
    prisma.offer.create({
      data: {
        title: "Apartamento amplo em Perdizes",
        description: "Apartamento com 3 quartos, sala ampla e área de serviço completa.",
        price: new Prisma.Decimal("980000.00"),
        areaM2: 120,
        bedrooms: 3,
        bathrooms: 2,
        parkingSpots: 2,
        propertyType: PropertyType.APARTAMENTO,
        neighborhood: "Perdizes",
        city: "Sao Paulo",
        state: "SP",
        address: "Rua Ministro Godói, 412",
        amenities: [Amenity.ACADEMIA, Amenity.PORTARIA, Amenity.AREA_SERVICO],
        userId: marina.id,
        media: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
              type: MediaType.FOTO,
            },
          ],
        },
      },
    }),
    prisma.offer.create({
      data: {
        title: "Casa com jardim em Moema",
        description: "Casa de vila com jardim, 3 quartos e cozinha gourmet.",
        price: new Prisma.Decimal("1350000.00"),
        areaM2: 180,
        bedrooms: 3,
        bathrooms: 3,
        parkingSpots: 2,
        propertyType: PropertyType.CASA,
        neighborhood: "Moema",
        city: "Sao Paulo",
        state: "SP",
        address: "Rua Gaivota, 98",
        amenities: [Amenity.CHURRASQUEIRA, Amenity.PET_FRIENDLY, Amenity.PORTARIA],
        userId: rafael.id,
        media: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
              type: MediaType.FOTO,
            },
          ],
        },
      },
    }),
    prisma.offer.create({
      data: {
        title: "Apartamento de luxo em Ipanema",
        description: "Apartamento à beira-mar com varanda e vista para a praia.",
        price: new Prisma.Decimal("3200000.00"),
        areaM2: 145,
        bedrooms: 3,
        bathrooms: 3,
        parkingSpots: 2,
        propertyType: PropertyType.APARTAMENTO,
        neighborhood: "Ipanema",
        city: "Rio de Janeiro",
        state: "RJ",
        address: "Rua Visconde de Pirajá, 300",
        amenities: [Amenity.PISCINA, Amenity.ACADEMIA, Amenity.VARANDA],
        userId: marina.id,
        media: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
              type: MediaType.FOTO,
            },
          ],
        },
      },
    }),
    prisma.offer.create({
      data: {
        title: "Cobertura no Batel, Curitiba",
        description: "Cobertura com varanda gourmet e piscina no condomínio.",
        price: new Prisma.Decimal("1950000.00"),
        areaM2: 170,
        bedrooms: 3,
        bathrooms: 3,
        parkingSpots: 2,
        propertyType: PropertyType.COBERTURA,
        neighborhood: "Batel",
        city: "Curitiba",
        state: "PR",
        address: "Rua Bispo Dom José, 835",
        amenities: [Amenity.PISCINA, Amenity.PORTARIA, Amenity.ACADEMIA],
        userId: rafael.id,
        media: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80",
              type: MediaType.FOTO,
            },
          ],
        },
      },
    }),
    prisma.offer.create({
      data: {
        title: "Terreno em Florianopolis",
        description: "Terreno plano no Centro, pronto para construção residencial.",
        price: new Prisma.Decimal("650000.00"),
        areaM2: 360,
        bedrooms: 0,
        bathrooms: 0,
        parkingSpots: 0,
        propertyType: PropertyType.TERRENO,
        neighborhood: "Centro",
        city: "Florianopolis",
        state: "SC",
        address: "Avenida Beira-Mar Norte, 1120",
        amenities: [],
        userId: marina.id,
        media: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
              type: MediaType.FOTO,
            },
          ],
        },
      },
    }),
  ]);

  const henriquePreference = await prisma.preference.create({
    data: {
      userId: henrique.id,
      title: "Preferência principal",
      minPrice: new Prisma.Decimal("150000.00"),
      maxPrice: new Prisma.Decimal("1500000.00"),
      minAreaM2: 35,
      maxAreaM2: 180,
      minBedrooms: 2,
      minBathrooms: 1,
      minParkingSpots: 1,
      propertyTypes: [PropertyType.APARTAMENTO, PropertyType.COBERTURA, PropertyType.STUDIO],
      neighborhoods: ["Vila Madalena", "Pinheiros", "Itaim Bibi", "Perdizes"],
      city: "Sao Paulo",
      state: "SP",
      desiredAmenities: [
        Amenity.PISCINA,
        Amenity.ACADEMIA,
        Amenity.PORTARIA,
        Amenity.PET_FRIENDLY,
        Amenity.VARANDA,
      ],
      isActive: true,
    },
  });

  console.log("Creating matches, proposals and saved offers...");

  await prisma.match.createMany({
    data: [
      {
        offerId: offers[0].id,
        preferenceId: henriquePreference.id,
        score: 0.95,
        status: MatchStatus.PENDENTE,
      },
      {
        offerId: offers[1].id,
        preferenceId: henriquePreference.id,
        score: 0.92,
        status: MatchStatus.PROPOSTA_ENVIADA,
      },
      {
        offerId: offers[2].id,
        preferenceId: henriquePreference.id,
        score: 0.88,
        status: MatchStatus.FEITO,
      },
    ],
  });

  await prisma.proposal.create({
    data: {
      offerId: offers[1].id,
      buyerId: henrique.id,
      message: "Tenho interesse em visitar e enviar proposta para este imóvel.",
      value: new Prisma.Decimal("1450000.00"),
      status: ProposalStatus.PENDENTE,
    },
  });

  await prisma.savedOffer.create({
    data: {
      userId: henrique.id,
      offerId: offers[2].id,
    },
  });

  await prisma.savedOffer.create({
    data: {
      userId: ana.id,
      offerId: offers[3].id,
    },
  });

  console.log("Creating notifications and analytics...");

  await prisma.notification.createMany({
    data: [
      {
        userId: henrique.id,
        type: "WELCOME",
        title: "Conta criada com sucesso",
        description: "Seu perfil foi configurado e sua preferência está ativa.",
        read: false,
      },
      {
        userId: henrique.id,
        type: "MATCH",
        title: "Novo imóvel compatível",
        description: "Encontramos um imóvel na sua área de interesse.",
        read: false,
      },
      {
        userId: marina.id,
        type: "PROPOSAL",
        title: "Nova proposta recebida",
        description: "Henrique enviou uma proposta para um dos seus imóveis.",
        read: false,
      },
      {
        userId: rafael.id,
        type: "ALERT",
        title: "Seu imóvel recebeu visualização",
        description: "Um comprador visualizou sua oferta em Pinheiros.",
        read: true,
      },
    ],
  });

  await prisma.offerView.createMany({
    data: [
      { offerId: offers[0].id, userId: henrique.id },
      { offerId: offers[0].id, userId: ana.id },
      { offerId: offers[1].id, userId: henrique.id },
      { offerId: offers[4].id, userId: henrique.id },
    ],
  });

  await prisma.offerVisit.create({
    data: {
      offerId: offers[1].id,
      userId: henrique.id,
      scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: "REQUESTED",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
