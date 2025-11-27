import { QuoteQuestion } from "@/types";

// Category-specific questions for quote requests
export const categoryQuestions: Record<string, QuoteQuestion[]> = {
  frisor: [
    {
      id: "hair-type",
      question: "Hva slags hår har du?",
      type: "select",
      options: ["Kort", "Mellomlang", "Lang", "Veldig lang"],
      required: true,
    },
    {
      id: "service-type",
      question: "Hva slags tjeneste trenger du?",
      type: "select",
      options: ["Kun klipp", "Klipp og farge", "Kun farge", "Styling/oppsett", "Annet"],
      required: true,
    },
    {
      id: "color-details",
      question: "Hvis farge - hva slags fargebehandling?",
      type: "select",
      options: ["Helfarging", "Highlights/balayage", "Toning", "Avfarging", "Ikke aktuelt"],
      required: false,
    },
    {
      id: "additional-info",
      question: "Er det noe annet frisøren bør vite?",
      type: "textarea",
      placeholder: "F.eks. spesielle ønsker, allergier, referansebilder...",
      required: false,
    },
  ],

  renhold: [
    {
      id: "home-type",
      question: "Hva slags bolig gjelder det?",
      type: "select",
      options: ["Leilighet", "Rekkehus", "Enebolig", "Hytte", "Kontor/næring"],
      required: true,
    },
    {
      id: "home-size",
      question: "Hvor stor er boligen?",
      type: "number",
      placeholder: "Skriv inn antall",
      unit: "kvm",
      required: true,
    },
    {
      id: "rooms",
      question: "Hvor mange rom skal rengjøres?",
      type: "number",
      placeholder: "Antall rom",
      required: true,
    },
    {
      id: "bathrooms",
      question: "Hvor mange bad?",
      type: "number",
      placeholder: "Antall bad",
      required: true,
    },
    {
      id: "cleaning-type",
      question: "Hva slags rengjøring trenger du?",
      type: "select",
      options: ["Vanlig renhold", "Hovedrengjøring", "Flyttevask", "Vindusvask", "Etter oppussing"],
      required: true,
    },
    {
      id: "frequency",
      question: "Hvor ofte trenger du rengjøring?",
      type: "select",
      options: ["Engangs", "Ukentlig", "Annenhver uke", "Månedlig"],
      required: true,
    },
    {
      id: "special-requests",
      question: "Spesielle ønsker eller områder som trenger ekstra oppmerksomhet?",
      type: "textarea",
      placeholder: "F.eks. kjæledyr i hjemmet, allergier, spesielle rengjøringsmidler...",
      required: false,
    },
  ],

  handverker: [
    {
      id: "job-type",
      question: "Hva slags arbeid trenger du hjelp med?",
      type: "select",
      options: ["Montering", "Reparasjon", "Maling", "Snekkerarbeid", "Oppussing", "Annet"],
      required: true,
    },
    {
      id: "job-description",
      question: "Beskriv oppdraget i detalj",
      type: "textarea",
      placeholder: "Jo mer informasjon du gir, jo bedre tilbud får du. F.eks. hva skal monteres, dimensjoner, tilstand...",
      required: true,
    },
    {
      id: "materials",
      question: "Har du materialene som trengs?",
      type: "select",
      options: ["Ja, jeg har alt", "Delvis, trenger noe", "Nei, leverandør må skaffe", "Usikker"],
      required: true,
    },
    {
      id: "photos",
      question: "Last opp bilder av området/oppdraget",
      type: "photos",
      required: false,
    },
  ],

  elektriker: [
    {
      id: "job-type",
      question: "Hva slags elektrisk arbeid gjelder det?",
      type: "select",
      options: [
        "Installasjon av lamper/lysarmaturer",
        "Nye stikkontakter/brytere",
        "Sikringsskap",
        "Elbil-lader",
        "Varmekabel/panelovn",
        "Feilsøking/reparasjon",
        "Annet",
      ],
      required: true,
    },
    {
      id: "job-description",
      question: "Beskriv oppdraget i detalj",
      type: "textarea",
      placeholder: "Antall punkter, type installasjon, eksisterende forhold, tilgang til sikringsskap...",
      required: true,
    },
    {
      id: "building-type",
      question: "Hva slags bygg er det?",
      type: "select",
      options: ["Leilighet", "Rekkehus", "Enebolig", "Hytte", "Næringslokale"],
      required: true,
    },
    {
      id: "building-age",
      question: "Omtrent når ble bygget bygget/renovert sist?",
      type: "select",
      options: ["Før 1970", "1970-1990", "1990-2010", "Etter 2010", "Vet ikke"],
      required: false,
    },
    {
      id: "photos",
      question: "Last opp bilder av sikringsskap og arbeidsområde",
      type: "photos",
      required: false,
    },
  ],

  rorlegger: [
    {
      id: "job-type",
      question: "Hva slags rørleggerarbeid trenger du?",
      type: "select",
      options: [
        "Installasjon av servant/vask",
        "Installasjon av toalett",
        "Installasjon av dusj/badekar",
        "Bytte av kran/armatur",
        "Lekkasje/reparasjon",
        "Rør/avløp",
        "Varmtvannsbereder",
        "Annet",
      ],
      required: true,
    },
    {
      id: "urgency",
      question: "Hvor haster det?",
      type: "select",
      options: ["Akutt (i dag)", "Snart (denne uken)", "Planlagt (fleksibel)"],
      required: true,
    },
    {
      id: "job-description",
      question: "Beskriv problemet eller oppdraget",
      type: "textarea",
      placeholder: "Beskriv så detaljert som mulig. Ved lekkasje: hvor lekker det, hvor mye, hvor lenge har det pågått...",
      required: true,
    },
    {
      id: "photos",
      question: "Last opp bilder av problemet/området",
      type: "photos",
      required: false,
    },
  ],

  hage: [
    {
      id: "job-type",
      question: "Hva slags hagearbeid trenger du?",
      type: "select",
      options: [
        "Plenklipping",
        "Hekklipping",
        "Beskjæring av trær/busker",
        "Luking/stell av bed",
        "Vårklargjøring",
        "Høstklargjøring",
        "Snømåking",
        "Anlegg av ny hage",
        "Annet",
      ],
      required: true,
    },
    {
      id: "garden-size",
      question: "Hvor stort er hagearealet?",
      type: "number",
      placeholder: "Skriv inn antall",
      unit: "kvm",
      required: true,
    },
    {
      id: "lawn-size",
      question: "Hvor stor er plenen (hvis aktuelt)?",
      type: "number",
      placeholder: "Skriv inn antall",
      unit: "kvm",
      required: false,
    },
    {
      id: "frequency",
      question: "Hvor ofte trenger du hjelp?",
      type: "select",
      options: ["Engangs", "Ukentlig", "Annenhver uke", "Månedlig", "Sesongbasert"],
      required: true,
    },
    {
      id: "equipment",
      question: "Har du nødvendig utstyr (gressklipper, hekksaks osv)?",
      type: "select",
      options: ["Ja, alt utstyr", "Delvis", "Nei, leverandør må ha med", "Usikker"],
      required: true,
    },
    {
      id: "job-description",
      question: "Beskriv oppdraget nærmere",
      type: "textarea",
      placeholder: "F.eks. spesielle ønsker, type vegetasjon, tilgang til hagen...",
      required: false,
    },
    {
      id: "photos",
      question: "Last opp bilder av hagen",
      type: "photos",
      required: false,
    },
  ],
};

// Get questions for a specific category
export function getQuestionsForCategory(categoryId: string): QuoteQuestion[] {
  return categoryQuestions[categoryId] || [];
}
