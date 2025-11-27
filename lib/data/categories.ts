import { ServiceCategory } from "@/types";

export const categories: ServiceCategory[] = [
  {
    id: "frisor",
    name: "Frisør",
    icon: "scissors",
    description: "Klipp, farge og styling hjemme",
  },
  {
    id: "renhold",
    name: "Renhold",
    icon: "sparkles",
    description: "Husvask og rengjøring",
  },
  {
    id: "handverker",
    name: "Håndverker",
    icon: "hammer",
    description: "Montering og reparasjoner",
  },
  {
    id: "elektriker",
    name: "Elektriker",
    icon: "zap",
    description: "Elektrisk arbeid",
  },
  {
    id: "rorlegger",
    name: "Rørlegger",
    icon: "wrench",
    description: "VVS og rørarbeid",
  },
  {
    id: "hage",
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
