import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ============================================
// Status Types
// ============================================

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type QuoteRequestStatus = "open" | "quoted" | "accepted" | "expired" | "cancelled";
export type QuoteResponseStatus = "pending" | "accepted" | "rejected" | "expired";
export type ProviderStatus = "pending" | "approved" | "rejected" | "suspended";

// ============================================
// Status Configuration
// ============================================

interface StatusConfig {
  label: string;
  className: string;
}

const bookingStatusConfig: Record<BookingStatus, StatusConfig> = {
  pending: {
    label: "Venter",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  },
  confirmed: {
    label: "Bekreftet",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  completed: {
    label: "Fullført",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  cancelled: {
    label: "Avbestilt",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};

const quoteRequestStatusConfig: Record<QuoteRequestStatus, StatusConfig> = {
  open: {
    label: "Venter på tilbud",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  quoted: {
    label: "Har mottatt tilbud",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  },
  accepted: {
    label: "Akseptert",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  expired: {
    label: "Utløpt",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
  cancelled: {
    label: "Kansellert",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};

const quoteResponseStatusConfig: Record<QuoteResponseStatus, StatusConfig> = {
  pending: {
    label: "Venter på svar",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  },
  accepted: {
    label: "Akseptert",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  rejected: {
    label: "Avslått",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  expired: {
    label: "Utløpt",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
};

const providerStatusConfig: Record<ProviderStatus, StatusConfig> = {
  pending: {
    label: "Venter godkjenning",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  },
  approved: {
    label: "Godkjent",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  rejected: {
    label: "Avvist",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  suspended: {
    label: "Suspendert",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  },
};

// ============================================
// Component Props & Implementation
// ============================================

type StatusBadgeProps = {
  className?: string;
  customLabel?: string;
} & (
  | { type: "booking"; status: BookingStatus }
  | { type: "quoteRequest"; status: QuoteRequestStatus }
  | { type: "quoteResponse"; status: QuoteResponseStatus }
  | { type: "provider"; status: ProviderStatus }
);

export function StatusBadge({ className, customLabel, ...props }: StatusBadgeProps) {
  let config: StatusConfig;

  switch (props.type) {
    case "booking":
      config = bookingStatusConfig[props.status];
      break;
    case "quoteRequest":
      config = quoteRequestStatusConfig[props.status];
      break;
    case "quoteResponse":
      config = quoteResponseStatusConfig[props.status];
      break;
    case "provider":
      config = providerStatusConfig[props.status];
      break;
  }

  return (
    <Badge className={cn(config.className, className)}>
      {customLabel || config.label}
    </Badge>
  );
}

// ============================================
// Helper function for getting status config
// ============================================

export function getBookingStatusConfig(status: BookingStatus) {
  return bookingStatusConfig[status];
}

export function getQuoteRequestStatusConfig(status: QuoteRequestStatus) {
  return quoteRequestStatusConfig[status];
}

export function getQuoteResponseStatusConfig(status: QuoteResponseStatus) {
  return quoteResponseStatusConfig[status];
}
