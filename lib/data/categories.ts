import { ServiceCategory } from "@/types";

export const categories: ServiceCategory[] = [
  {
    id: "frisor",
    slug: "frisor",
    name: "Frisør",
    icon: "scissors",
    description: "Klipp, farge og styling hjemme",
  },
  {
    id: "renhold",
    slug: "renhold",
    name: "Renhold",
    icon: "sparkles",
    description: "Husvask og rengjøring",
  },
  {
    id: "handverker",
    slug: "handverker",
    name: "Håndverker",
    icon: "hammer",
    description: "Montering og reparasjoner",
  },
  {
    id: "elektriker",
    slug: "elektriker",
    name: "Elektriker",
    icon: "zap",
    description: "Elektrisk arbeid",
  },
  {
    id: "rorlegger",
    slug: "rorlegger",
    name: "Rørlegger",
    icon: "wrench",
    description: "VVS og rørarbeid",
  },
  {
    id: "hage",
    slug: "hage",
    name: "Hage",
    icon: "leaf",
    description: "Hagearbeid og vedlikehold",
  },
];

export function getCategoryById(id: string): ServiceCategory | undefined {
  return categories.find((cat) => cat.id === id);
}

export function getCategoryByName(name: string): ServiceCategory | undefined {
  return categories.find((cat) => cat.name.toLowerCase() === name.toLowerCase());
}
