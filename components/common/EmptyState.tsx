import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "card";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "py-8 text-center",
        variant === "card" && "rounded-lg border bg-muted/40 p-8",
        className
      )}
    >
      {Icon && (
        <Icon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
      )}
      <p className={cn("text-muted-foreground", description && "mb-2 font-medium text-foreground")}>
        {title}
      </p>
      {description && (
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
