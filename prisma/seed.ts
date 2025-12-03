import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create categories
  const categories = await Promise.all([
    prisma.serviceCategory.upsert({
      where: { slug: "frisor" },
      update: {},
      create: {
        slug: "frisor",
        name: "Frisør",
        icon: "scissors",
        description: "Klipp, farge og styling hjemme",
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "renhold" },
      update: {},
      create: {
        slug: "renhold",
        name: "Renhold",
        icon: "sparkles",
        description: "Husvask og rengjøring",
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "handverker" },
      update: {},
      create: {
        slug: "handverker",
        name: "Håndverker",
        icon: "hammer",
        description: "Montering og reparasjoner",
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "elektriker" },
      update: {},
      create: {
        slug: "elektriker",
        name: "Elektriker",
        icon: "zap",
        description: "Elektrisk arbeid",
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "rorlegger" },
      update: {},
      create: {
        slug: "rorlegger",
        name: "Rørlegger",
        icon: "wrench",
        description: "VVS og rørarbeid",
      },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: "hage" },
      update: {},
      create: {
        slug: "hage",
        name: "Hage",
        icon: "leaf",
        description: "Hagearbeid og vedlikehold",
      },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@hjemservice.no" },
    update: {},
    create: {
      email: "admin@hjemservice.no",
      passwordHash: adminPassword,
      firstName: "Admin",
      lastName: "Bruker",
      role: UserRole.ADMIN,
    },
  });
  console.log("Created admin user:", adminUser.email);

  // Create demo customer
  const customerPassword = await bcrypt.hash("kunde123", 12);
  const customerUser = await prisma.user.upsert({
    where: { email: "kunde@example.com" },
    update: {},
    create: {
      email: "kunde@example.com",
      passwordHash: customerPassword,
      firstName: "Kari",
      lastName: "Nordmann",
      phone: "912 34 567",
      role: UserRole.CUSTOMER,
      customerProfile: {
        create: {
          addresses: {
            create: {
              label: "Hjemme",
              street: "Storgata 15",
              postalCode: "0182",
              city: "Oslo",
              floor: "3. etasje",
            },
          },
        },
      },
    },
  });
  console.log("Created demo customer:", customerUser.email);

  // Create demo providers
  const frisorCategory = categories.find((c) => c.slug === "frisor")!;
  const renholdCategory = categories.find((c) => c.slug === "renhold")!;
  const handverkerCategory = categories.find((c) => c.slug === "handverker")!;
  const elektrikerCategory = categories.find((c) => c.slug === "elektriker")!;
  const rorleggerCategory = categories.find((c) => c.slug === "rorlegger")!;
  const hageCategory = categories.find((c) => c.slug === "hage")!;

  const providerPassword = await bcrypt.hash("leverandor123", 12);

  // Provider 1: Hairdresser
  const mariaUser = await prisma.user.upsert({
    where: { email: "maria@example.com" },
    update: {},
    create: {
      email: "maria@example.com",
      passwordHash: providerPassword,
      firstName: "Maria",
      lastName: "Hansen",
      phone: "912 34 567",
      role: UserRole.PROVIDER,
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
    },
  });

  await prisma.serviceProvider.upsert({
    where: { userId: mariaUser.id },
    update: {},
    create: {
      userId: mariaUser.id,
      businessName: "Marias Mobile Frisør",
      bio: "Jeg har over 15 års erfaring som frisør og elsker å gi kundene mine en fantastisk opplevelse hjemme hos dem. Spesialiserer meg på klipp for alle aldre, farge og styling til spesielle anledninger.",
      areasServed: ["Oslo", "Bærum", "Asker"],
      rating: 4.9,
      reviewCount: 127,
      verified: true,
      insurance: true,
      policeCheck: true,
      yearsExperience: 15,
      nationality: "Norge",
      education: "Frisørfag, Elvebakken VGS",
      leadTime: 24,
      approvedAt: new Date(),
      categories: {
        connect: [{ id: frisorCategory.id }],
      },
      services: {
        create: [
          { categoryId: frisorCategory.id, name: "Herreklipp", price: 549, duration: 30 },
          { categoryId: frisorCategory.id, name: "Dameklipp", price: 749, duration: 45 },
          { categoryId: frisorCategory.id, name: "Barneklipp", price: 399, duration: 25 },
          { categoryId: frisorCategory.id, name: "Klipp + farge", price: 1899, duration: 120 },
          { categoryId: frisorCategory.id, name: "Oppsetting til fest", price: 999, duration: 60 },
        ],
      },
      languages: {
        create: [
          { code: "no", name: "Norsk", proficiency: "morsmål" },
          { code: "en", name: "Engelsk", proficiency: "flytende" },
        ],
      },
      certificates: {
        create: [
          { name: "Frisørsvenn", issuer: "Utdanningsdirektoratet", year: 2009, verified: true },
          { name: "Frisørmester", issuer: "Mesterbrevnemnda", year: 2015, verified: true },
        ],
      },
      availability: {
        create: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 4, startTime: "09:00", endTime: "19:00" },
          { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
          { dayOfWeek: 6, startTime: "10:00", endTime: "15:00" },
        ],
      },
    },
  });
  console.log("Created provider: Maria Hansen (Frisør)");

  // Provider 2: Cleaning
  const elenaUser = await prisma.user.upsert({
    where: { email: "elena@example.com" },
    update: {},
    create: {
      email: "elena@example.com",
      passwordHash: providerPassword,
      firstName: "Elena",
      lastName: "Kowalski",
      phone: "945 67 890",
      role: UserRole.PROVIDER,
      avatarUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
    },
  });

  await prisma.serviceProvider.upsert({
    where: { userId: elenaUser.id },
    update: {},
    create: {
      userId: elenaUser.id,
      businessName: "Rent & Pent AS",
      bio: "Profesjonell rengjøring for private hjem. Vi bruker miljøvennlige produkter og har lang erfaring med alt fra ukentlig renhold til flyttevask.",
      areasServed: ["Oslo", "Bærum", "Asker", "Drammen"],
      rating: 4.8,
      reviewCount: 203,
      verified: true,
      insurance: true,
      policeCheck: true,
      yearsExperience: 12,
      nationality: "Polen",
      education: "Servicefag, Warszawa",
      leadTime: 24,
      approvedAt: new Date(),
      categories: {
        connect: [{ id: renholdCategory.id }],
      },
      services: {
        create: [
          { categoryId: renholdCategory.id, name: "Ukentlig renhold (2-3 rom)", price: 1199, duration: 120 },
          { categoryId: renholdCategory.id, name: "Ukentlig renhold (4-5 rom)", price: 1699, duration: 180 },
          { categoryId: renholdCategory.id, name: "Storrengjøring", price: 3499, duration: 300 },
          { categoryId: renholdCategory.id, name: "Flyttevask", price: 4999, duration: 420 },
          { categoryId: renholdCategory.id, name: "Vindusvask (per vindu)", price: 199, duration: 15 },
        ],
      },
      languages: {
        create: [
          { code: "pl", name: "Polsk", proficiency: "morsmål" },
          { code: "no", name: "Norsk", proficiency: "flytende" },
          { code: "en", name: "Engelsk", proficiency: "god" },
        ],
      },
      certificates: {
        create: [
          { name: "Renholdsoperatør", issuer: "NFVB", year: 2015, verified: true },
        ],
      },
      availability: {
        create: [
          { dayOfWeek: 1, startTime: "07:00", endTime: "18:00" },
          { dayOfWeek: 2, startTime: "07:00", endTime: "18:00" },
          { dayOfWeek: 3, startTime: "07:00", endTime: "18:00" },
          { dayOfWeek: 4, startTime: "07:00", endTime: "18:00" },
          { dayOfWeek: 5, startTime: "07:00", endTime: "16:00" },
          { dayOfWeek: 6, startTime: "09:00", endTime: "14:00" },
        ],
      },
    },
  });
  console.log("Created provider: Elena Kowalski (Renhold)");

  // Provider 3: Handyman
  const perUser = await prisma.user.upsert({
    where: { email: "per@example.com" },
    update: {},
    create: {
      email: "per@example.com",
      passwordHash: providerPassword,
      firstName: "Per",
      lastName: "Olsen",
      phone: "967 89 012",
      role: UserRole.PROVIDER,
      avatarUrl:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces",
    },
  });

  await prisma.serviceProvider.upsert({
    where: { userId: perUser.id },
    update: {},
    create: {
      userId: perUser.id,
      businessName: "Fiksern",
      bio: "Allsidig håndverker med over 20 års erfaring. Kan hjelpe med det meste - fra å montere hyller til å fikse en lekk kran. Ingen jobb er for liten!",
      areasServed: ["Oslo", "Bærum", "Asker", "Drammen", "Sandvika"],
      rating: 4.9,
      reviewCount: 312,
      verified: true,
      insurance: true,
      policeCheck: true,
      yearsExperience: 20,
      nationality: "Norge",
      education: "Tømrerfag, Kuben VGS",
      leadTime: 24,
      approvedAt: new Date(),
      categories: {
        connect: [{ id: handverkerCategory.id }],
      },
      services: {
        create: [
          { categoryId: handverkerCategory.id, name: "Småjobber (per time)", price: 749, duration: 60 },
          { categoryId: handverkerCategory.id, name: "Montering IKEA-møbler", price: 599, duration: 60 },
          { categoryId: handverkerCategory.id, name: "Opphenging av TV", price: 1199, duration: 60 },
          { categoryId: handverkerCategory.id, name: "Montere hyller/skap", price: 899, duration: 90 },
          { categoryId: handverkerCategory.id, name: "Maling (per rom)", price: 3499, duration: 300 },
        ],
      },
      languages: {
        create: [
          { code: "no", name: "Norsk", proficiency: "morsmål" },
          { code: "en", name: "Engelsk", proficiency: "god" },
        ],
      },
      certificates: {
        create: [
          { name: "Tømrersvenn", issuer: "Utdanningsdirektoratet", year: 2004, verified: true },
          { name: "Tømrermester", issuer: "Mesterbrevnemnda", year: 2012, verified: true },
        ],
      },
      availability: {
        create: [
          { dayOfWeek: 1, startTime: "07:00", endTime: "17:00" },
          { dayOfWeek: 2, startTime: "07:00", endTime: "17:00" },
          { dayOfWeek: 3, startTime: "07:00", endTime: "17:00" },
          { dayOfWeek: 4, startTime: "07:00", endTime: "17:00" },
          { dayOfWeek: 5, startTime: "07:00", endTime: "15:00" },
          { dayOfWeek: 6, startTime: "09:00", endTime: "13:00" },
        ],
      },
    },
  });
  console.log("Created provider: Per Olsen (Håndverker)");

  // Provider 4: Electrician
  const erikUser = await prisma.user.upsert({
    where: { email: "erik@example.com" },
    update: {},
    create: {
      email: "erik@example.com",
      passwordHash: providerPassword,
      firstName: "Erik",
      lastName: "Strøm",
      phone: "978 90 123",
      role: UserRole.PROVIDER,
      avatarUrl:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces",
    },
  });

  await prisma.serviceProvider.upsert({
    where: { userId: erikUser.id },
    update: {},
    create: {
      userId: erikUser.id,
      businessName: "Strøm & Sikring AS",
      bio: "Autorisert elektriker med bred erfaring. Utfører alt fra sikringsskap-oppgraderinger til installasjon av smarthjem-løsninger. Sikkerhet først!",
      areasServed: ["Oslo", "Bærum", "Asker", "Nesodden"],
      rating: 4.8,
      reviewCount: 98,
      verified: true,
      insurance: true,
      policeCheck: true,
      yearsExperience: 15,
      nationality: "Norge",
      education: "Elektrofag, Oslo Tekniske Skole",
      leadTime: 48,
      approvedAt: new Date(),
      categories: {
        connect: [{ id: elektrikerCategory.id }],
      },
      services: {
        create: [
          { categoryId: elektrikerCategory.id, name: "Befaring/vurdering", price: 1299, duration: 60 },
          { categoryId: elektrikerCategory.id, name: "Installasjon stikkontakt", price: 1899, duration: 60 },
          { categoryId: elektrikerCategory.id, name: "Installasjon taklampe", price: 1299, duration: 45 },
          { categoryId: elektrikerCategory.id, name: "Oppgradering sikringsskap", price: 14999, duration: 480 },
          { categoryId: elektrikerCategory.id, name: "Elbil-lader installasjon", price: 8999, duration: 180 },
        ],
      },
      languages: {
        create: [
          { code: "no", name: "Norsk", proficiency: "morsmål" },
          { code: "en", name: "Engelsk", proficiency: "flytende" },
        ],
      },
      certificates: {
        create: [
          { name: "Elektrikerfagbrev", issuer: "Utdanningsdirektoratet", year: 2009, verified: true },
          { name: "Installatørbevis L", issuer: "DSB", year: 2012, verified: true },
          { name: "NEK 400 sertifisering", issuer: "NEK", year: 2023, verified: true },
        ],
      },
      availability: {
        create: [
          { dayOfWeek: 1, startTime: "08:00", endTime: "16:00" },
          { dayOfWeek: 2, startTime: "08:00", endTime: "16:00" },
          { dayOfWeek: 3, startTime: "08:00", endTime: "16:00" },
          { dayOfWeek: 4, startTime: "08:00", endTime: "16:00" },
          { dayOfWeek: 5, startTime: "08:00", endTime: "14:00" },
        ],
      },
    },
  });
  console.log("Created provider: Erik Strøm (Elektriker)");

  // Provider 5: Plumber
  const janUser = await prisma.user.upsert({
    where: { email: "jan@example.com" },
    update: {},
    create: {
      email: "jan@example.com",
      passwordHash: providerPassword,
      firstName: "Jan",
      lastName: "Pedersen",
      phone: "989 01 234",
      role: UserRole.PROVIDER,
      avatarUrl:
        "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop&crop=faces",
    },
  });

  await prisma.serviceProvider.upsert({
    where: { userId: janUser.id },
    update: {},
    create: {
      userId: janUser.id,
      businessName: "Rørservice Oslo",
      bio: "Rask og pålitelig rørlegger for alle typer VVS-arbeid. Spesialiserer meg på reparasjoner og småjobber som må fikses raskt.",
      areasServed: ["Oslo", "Bærum"],
      rating: 4.7,
      reviewCount: 145,
      verified: true,
      insurance: true,
      policeCheck: true,
      yearsExperience: 18,
      nationality: "Sverige",
      education: "VVS-fag, Stockholm Tekniska Institut",
      leadTime: 4,
      approvedAt: new Date(),
      categories: {
        connect: [{ id: rorleggerCategory.id }],
      },
      services: {
        create: [
          { categoryId: rorleggerCategory.id, name: "Akutt utrykning", price: 2499, duration: 60 },
          { categoryId: rorleggerCategory.id, name: "Reparasjon lekkasje", price: 1899, duration: 60 },
          { categoryId: rorleggerCategory.id, name: "Bytte kran/armatur", price: 1499, duration: 45 },
          { categoryId: rorleggerCategory.id, name: "Installasjon oppvaskmaskin", price: 1999, duration: 90 },
          { categoryId: rorleggerCategory.id, name: "Installasjon vaskemaskin", price: 1699, duration: 60 },
        ],
      },
      languages: {
        create: [
          { code: "no", name: "Norsk", proficiency: "morsmål" },
          { code: "sv", name: "Svensk", proficiency: "flytende" },
          { code: "en", name: "Engelsk", proficiency: "god" },
        ],
      },
      certificates: {
        create: [
          { name: "Rørleggerfagbrev", issuer: "Utdanningsdirektoratet", year: 2006, verified: true },
          { name: "VVS-montør", issuer: "NRL", year: 2010, verified: true },
          { name: "ADK1-sertifisering", issuer: "Norsk Vann", year: 2020, verified: true },
        ],
      },
      availability: {
        create: [
          { dayOfWeek: 1, startTime: "07:00", endTime: "17:00" },
          { dayOfWeek: 2, startTime: "07:00", endTime: "17:00" },
          { dayOfWeek: 3, startTime: "07:00", endTime: "17:00" },
          { dayOfWeek: 4, startTime: "07:00", endTime: "17:00" },
          { dayOfWeek: 5, startTime: "07:00", endTime: "15:00" },
          { dayOfWeek: 6, startTime: "09:00", endTime: "13:00" },
        ],
      },
    },
  });
  console.log("Created provider: Jan Pedersen (Rørlegger)");

  // Provider 6: Gardener
  const kristineUser = await prisma.user.upsert({
    where: { email: "kristine@example.com" },
    update: {},
    create: {
      email: "kristine@example.com",
      passwordHash: providerPassword,
      firstName: "Kristine",
      lastName: "Skog",
      phone: "990 12 345",
      role: UserRole.PROVIDER,
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces",
    },
  });

  await prisma.serviceProvider.upsert({
    where: { userId: kristineUser.id },
    update: {},
    create: {
      userId: kristineUser.id,
      businessName: "Grønn Oase",
      bio: "Lidenskapelig gartner som elsker å skape vakre uterom. Tilbyr alt fra plenklipping og hekkearbeid til fullstendig hagedesign.",
      areasServed: ["Oslo", "Bærum", "Asker", "Nesodden", "Oppegård"],
      rating: 4.9,
      reviewCount: 87,
      verified: true,
      insurance: true,
      policeCheck: true,
      yearsExperience: 10,
      nationality: "Norge",
      education: "Anleggsgartner, Ås VGS / NMBU",
      leadTime: 24,
      approvedAt: new Date(),
      categories: {
        connect: [{ id: hageCategory.id }],
      },
      services: {
        create: [
          { categoryId: hageCategory.id, name: "Plenklipping (per gang)", price: 599, duration: 60 },
          { categoryId: hageCategory.id, name: "Hekklipping (per time)", price: 649, duration: 60 },
          { categoryId: hageCategory.id, name: "Luking og stell (per time)", price: 549, duration: 60 },
          { categoryId: hageCategory.id, name: "Vårklargjøring av hage", price: 3499, duration: 240 },
          { categoryId: hageCategory.id, name: "Høstklargjøring", price: 2999, duration: 180 },
        ],
      },
      languages: {
        create: [
          { code: "no", name: "Norsk", proficiency: "morsmål" },
          { code: "en", name: "Engelsk", proficiency: "flytende" },
          { code: "de", name: "Tysk", proficiency: "god" },
        ],
      },
      certificates: {
        create: [
          { name: "Anleggsgartner fagbrev", issuer: "Utdanningsdirektoratet", year: 2014, verified: true },
          { name: "Plantevern sertifikat", issuer: "Mattilsynet", year: 2022, verified: true },
        ],
      },
      availability: {
        create: [
          { dayOfWeek: 1, startTime: "08:00", endTime: "18:00" },
          { dayOfWeek: 2, startTime: "08:00", endTime: "18:00" },
          { dayOfWeek: 3, startTime: "08:00", endTime: "18:00" },
          { dayOfWeek: 4, startTime: "08:00", endTime: "18:00" },
          { dayOfWeek: 5, startTime: "08:00", endTime: "16:00" },
          { dayOfWeek: 6, startTime: "09:00", endTime: "15:00" },
        ],
      },
    },
  });
  console.log("Created provider: Kristine Skog (Hage)");

  console.log("\nSeed completed successfully!");
  console.log("\nDemo accounts:");
  console.log("  Admin: admin@hjemservice.no / admin123");
  console.log("  Customer: kunde@example.com / kunde123");
  console.log("  Provider: maria@example.com / leverandor123");
  console.log("           elena@example.com / leverandor123");
  console.log("           per@example.com / leverandor123");
  console.log("           erik@example.com / leverandor123");
  console.log("           jan@example.com / leverandor123");
  console.log("           kristine@example.com / leverandor123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
