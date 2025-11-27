import { QuoteRequest, QuoteResponse } from "@/types";
import { getProviderById } from "./providers";

// Mock quote requests
export const quoteRequests: QuoteRequest[] = [
  {
    id: "qr-001",
    customerId: "c1",
    categoryId: "elektriker",
    title: "Installere 6 taklamper i ny leilighet",
    description: "Nyinnflyttet i leilighet, trenger å få montert taklamper i alle rom. Har lampene klare.",
    answers: [
      { questionId: "job-type", answer: "Installasjon av lamper/lysarmaturer" },
      { questionId: "job-description", answer: "6 taklamper fordelt på stue (2), kjøkken (1), soverom (2) og gang (1). Alle punkter har eksisterende uttak i tak." },
      { questionId: "building-type", answer: "Leilighet" },
      { questionId: "building-age", answer: "Etter 2010" },
    ],
    photos: [],
    address: {
      id: "a1",
      label: "Hjemme",
      street: "Storgata 15",
      postalCode: "0182",
      city: "Oslo",
    },
    preferredDates: ["2024-12-20", "2024-12-21"],
    status: "quoted",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "qr-002",
    customerId: "c1",
    categoryId: "hage",
    title: "Vårklargjøring av hage",
    description: "Trenger hjelp med å gjøre klar hagen til våren etter vinteren.",
    answers: [
      { questionId: "job-type", answer: "Vårklargjøring" },
      { questionId: "garden-size", answer: 450 },
      { questionId: "lawn-size", answer: 200 },
      { questionId: "frequency", answer: "Engangs" },
      { questionId: "equipment", answer: "Delvis" },
      { questionId: "job-description", answer: "Raking av løv, beskjæring av busker, gjødsling av plen, rydding av bed." },
    ],
    photos: [],
    address: {
      id: "a1",
      label: "Hjemme",
      street: "Storgata 15",
      postalCode: "0182",
      city: "Oslo",
    },
    status: "open",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: "qr-003",
    customerId: "c1",
    categoryId: "renhold",
    title: "Flyttevask 3-roms leilighet",
    description: "Skal flytte ut og trenger grundig flyttevask.",
    answers: [
      { questionId: "home-type", answer: "Leilighet" },
      { questionId: "home-size", answer: 75 },
      { questionId: "rooms", answer: 3 },
      { questionId: "bathrooms", answer: 1 },
      { questionId: "cleaning-type", answer: "Flyttevask" },
      { questionId: "frequency", answer: "Engangs" },
      { questionId: "special-requests", answer: "Må være ferdig innen 31. desember." },
    ],
    photos: [],
    address: {
      id: "a2",
      label: "Gammel leilighet",
      street: "Parkveien 22",
      postalCode: "0350",
      city: "Oslo",
    },
    preferredDates: ["2024-12-28", "2024-12-29"],
    status: "accepted",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
  // Additional requests for provider demo
  {
    id: "qr-004",
    customerId: "c2",
    categoryId: "elektriker",
    title: "Installere ladeboks for elbil",
    description: "Trenger installasjon av ladeboks i carport. Har sikringsskap i garasjen.",
    answers: [
      { questionId: "job-type", answer: "Installasjon av ladeboks" },
      { questionId: "job-description", answer: "Ønsker 11kW ladeboks installert i carport. Sikringsskapet er ca 8 meter unna. Muligens behov for oppgradering av hovedsikring." },
      { questionId: "building-type", answer: "Enebolig" },
      { questionId: "building-age", answer: "2000-2010" },
    ],
    photos: [],
    address: {
      id: "a3",
      label: "Hjemme",
      street: "Solveien 42",
      postalCode: "0283",
      city: "Oslo",
    },
    preferredDates: ["2024-12-23", "2024-12-27"],
    status: "open",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "qr-005",
    customerId: "c3",
    categoryId: "elektriker",
    title: "Bytte sikringsskap",
    description: "Gammelt sikringsskap med skrusikringer, ønsker moderne automatsikringer.",
    answers: [
      { questionId: "job-type", answer: "Oppgradering av sikringsskap" },
      { questionId: "job-description", answer: "Har gammelt skap fra 70-tallet med skrusikringer. Ønsker nytt skap med automatsikringer og jordfeilbryter. Huset har 3-fase inntak." },
      { questionId: "building-type", answer: "Enebolig" },
      { questionId: "building-age", answer: "Før 1980" },
    ],
    photos: [],
    address: {
      id: "a4",
      label: "Hjemme",
      street: "Granveien 8",
      postalCode: "0678",
      city: "Oslo",
    },
    status: "open",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: "qr-006",
    customerId: "c4",
    categoryId: "handverker",
    title: "Bygge innebygd garderobe",
    description: "Ønsker skreddersydd garderobe på soverom med skyvedører.",
    answers: [
      { questionId: "job-type", answer: "Snekkerarbeid" },
      { questionId: "job-description", answer: "Skal bygge garderobe fra gulv til tak, ca 2.5m bred og 60cm dyp. Ønsker skyvedører med speil og innvendig oppdeling med hyller og garderobestenger." },
      { questionId: "materials", answer: "Leverandør skaffer" },
    ],
    photos: [],
    address: {
      id: "a5",
      label: "Hjemme",
      street: "Åsveien 15B",
      postalCode: "0372",
      city: "Oslo",
    },
    preferredDates: ["2025-01-06", "2025-01-07", "2025-01-08"],
    status: "open",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: "qr-007",
    customerId: "c5",
    categoryId: "handverker",
    title: "Montere kjøkken fra IKEA",
    description: "Har kjøpt nytt IKEA-kjøkken som skal monteres.",
    answers: [
      { questionId: "job-type", answer: "Montering" },
      { questionId: "job-description", answer: "Komplett METOD-kjøkken med 12 underskap, 8 overskap, benkeplate og integrerte hvitevarer (oppvaskmaskin, komfyr, kjøleskap). Alt er levert og pakket ut." },
      { questionId: "materials", answer: "Kunde har" },
    ],
    photos: [],
    address: {
      id: "a6",
      label: "Ny leilighet",
      street: "Trondheimsveien 100",
      postalCode: "0565",
      city: "Oslo",
    },
    preferredDates: ["2025-01-02", "2025-01-03"],
    status: "open",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
  },
];

// Mock quote responses
export const quoteResponses: QuoteResponse[] = [
  {
    id: "qres-001",
    quoteRequestId: "qr-001",
    providerId: "p7",
    price: 4500,
    estimatedDuration: 180,
    materialsIncluded: false,
    message: "Hei! Jeg kan installere alle 6 lampene for deg. Prisen inkluderer arbeid og befaring. Jeg har god erfaring med lampeinstallasjon og kan komme på begge de foreslåtte datoene. Ta gjerne kontakt om du har spørsmål!",
    validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "qres-002",
    quoteRequestId: "qr-001",
    providerId: "p8",
    price: 5200,
    estimatedDuration: 150,
    materialsIncluded: false,
    message: "Kan utføre jobben raskt og effektivt. Har alle nødvendige sertifikater og forsikring. Inkluderer sjekk av sikringsskap og 2 års garanti på arbeidet.",
    validUntil: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    status: "pending",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: "qres-003",
    quoteRequestId: "qr-003",
    providerId: "p4",
    price: 3499,
    estimatedDuration: 240,
    materialsIncluded: true,
    message: "Vi kan utføre flyttevask med garanti. Prisen inkluderer alle rengjøringsmidler. Vi har erfaring med utleier-godkjente flyttevasker.",
    validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: "accepted",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

// Helper functions
export function getQuoteRequestById(id: string): QuoteRequest | undefined {
  return quoteRequests.find((qr) => qr.id === id);
}

export function getQuoteRequestsByCustomerId(customerId: string): QuoteRequest[] {
  return quoteRequests.filter((qr) => qr.customerId === customerId);
}

export function getQuoteRequestsByCategory(categoryId: string): QuoteRequest[] {
  return quoteRequests.filter((qr) => qr.categoryId === categoryId && qr.status === "open");
}

export function getOpenQuoteRequestsForProvider(providerId: string, categories: string[]): QuoteRequest[] {
  return quoteRequests.filter(
    (qr) => categories.includes(qr.categoryId) && (qr.status === "open" || qr.status === "quoted")
  );
}

export function getQuoteResponsesByRequestId(requestId: string): QuoteResponse[] {
  return quoteResponses
    .filter((qr) => qr.quoteRequestId === requestId)
    .map((response) => ({
      ...response,
      provider: getProviderById(response.providerId),
    }));
}

export function getQuoteResponsesByProviderId(providerId: string): QuoteResponse[] {
  return quoteResponses.filter((qr) => qr.providerId === providerId);
}

export function getQuoteResponseById(id: string): QuoteResponse | undefined {
  const response = quoteResponses.find((qr) => qr.id === id);
  if (response) {
    return {
      ...response,
      provider: getProviderById(response.providerId),
    };
  }
  return undefined;
}
