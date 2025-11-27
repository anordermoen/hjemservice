import { Info, CheckCircle, AlertTriangle, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type InfoBoxVariant = "info" | "success" | "warning" | "muted";

interface InfoBoxProps {
  variant?: InfoBoxVariant;
  title?: string;
  icon?: LucideIcon;
  showIcon?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<InfoBoxVariant, { container: string; icon: string; defaultIcon: LucideIcon }> = {
  info: {
    container: "bg-blue-50 border border-blue-200",
    icon: "text-blue-600",
    defaultIcon: Info,
  },
  success: {
    container: "bg-green-50 border border-green-200",
    icon: "text-green-600",
    defaultIcon: CheckCircle,
  },
  warning: {
    container: "bg-amber-50 border border-amber-200",
    icon: "text-amber-600",
    defaultIcon: AlertTriangle,
  },
  muted: {
    container: "bg-muted/40",
    icon: "text-muted-foreground",
    defaultIcon: Info,
  },
};

export function InfoBox({
  variant = "muted",
  title,
  icon,
  showIcon = true,
  children,
  className,
}: InfoBoxProps) {
  const styles = variantStyles[variant];
  const Icon = icon || styles.defaultIcon;

  return (
    <div className={cn("rounded-lg p-4", styles.container, className)}>
      {showIcon && variant !== "muted" ? (
        <div className="flex gap-3">
          <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", styles.icon)} />
          <div className="flex-1">
            {title && <h4 className="mb-1 font-medium">{title}</h4>}
            <div className="text-sm text-muted-foreground">{children}</div>
          </div>
        </div>
      ) : (
        <>
          {title && <h4 className="mb-2 font-medium">{title}</h4>}
          <div className="text-sm text-muted-foreground">{children}</div>
        </>
      )}
    </div>
  );
}

// ============================================
// Tip List - Common pattern for help sections
// ============================================

interface TipListProps {
  title?: string;
  tips: string[];
  className?: string;
}

export function TipList({ title, tips, className }: TipListProps) {
  return (
    <InfoBox variant="muted" title={title} className={className}>
      <ul className="space-y-1">
        {tips.map((tip, index) => (
          <li key={index}>{tip}</li>
        ))}
      </ul>
    </InfoBox>
  );
}
