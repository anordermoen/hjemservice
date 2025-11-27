import {
  Scissors,
  Sparkles,
  Hammer,
  Zap,
  Wrench,
  Leaf,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  scissors: Scissors,
  sparkles: Sparkles,
  hammer: Hammer,
  zap: Zap,
  wrench: Wrench,
  leaf: Leaf,
};

interface CategoryIconProps {
  icon: string;
  className?: string;
}

export function CategoryIcon({ icon, className }: CategoryIconProps) {
  const Icon = iconMap[icon] || Hammer;
  return <Icon className={cn("h-6 w-6", className)} />;
}

export { iconMap };
