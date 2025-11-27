import Link from "next/link";
import {
  Scissors,
  Sparkles,
  Hammer,
  Zap,
  Wrench,
  Leaf,
  LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceCategory } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  scissors: Scissors,
  sparkles: Sparkles,
  hammer: Hammer,
  zap: Zap,
  wrench: Wrench,
  leaf: Leaf,
};

interface ServiceCardProps {
  category: ServiceCategory;
}

export function ServiceCard({ category }: ServiceCardProps) {
  const Icon = iconMap[category.icon] || Hammer;

  return (
    <Link href={`/tjenester/${category.id}`}>
      <Card className="group h-full transition-all hover:shadow-md hover:border-primary/50">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 font-semibold">{category.name}</h3>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
