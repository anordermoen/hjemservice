"use client";

import Link from "next/link";
import {
  Clock,
  MapPin,
  Star,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ReviewDialog } from "@/components/common/ReviewDialog";
import { formatPrice, formatDate, formatTime } from "@/lib/utils";
import { submitReview } from "@/app/actions/review";

interface BookingData {
  id: string;
  status: string;
  totalPrice: number;
  scheduledAt: string;
  providerId: string;
  hasReview: boolean;
  provider: {
    id: string;
    businessName: string | null;
    rating: number;
    reviewCount: number;
    verified: boolean;
    user: {
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    };
  };
  address: {
    street: string;
    postalCode: string;
    city: string;
  } | null;
  services: Array<{ name: string }>;
  cancellation?: {
    wasWithin24Hours: boolean;
    cancellationFee: number;
    feeRefunded: boolean;
  } | null;
}

interface CompletedBookingCardProps {
  booking: BookingData;
}

export function CompletedBookingCard({ booking }: CompletedBookingCardProps) {
  const provider = booking.provider;
  const initials = `${provider.user.firstName?.[0] || ""}${provider.user.lastName?.[0] || ""}`;
  const serviceNames = booking.services.map((s) => s.name).join(", ");
  const scheduledAt = new Date(booking.scheduledAt);

  return (
    <div className="rounded-lg border p-4">
      {/* Header with service name and status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium">{serviceNames}</h3>
          <StatusBadge type="booking" status="completed" />
        </div>
        <p className="font-semibold text-primary">{formatPrice(booking.totalPrice)}</p>
      </div>

      {/* Provider info */}
      <div className="flex items-start gap-3 mb-3 p-3 bg-muted/30 rounded-lg">
        <Link href={`/leverandor/${provider.id}`}>
          <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
            <AvatarImage src={provider.user.avatarUrl || undefined} alt="" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/leverandor/${provider.id}`} className="hover:underline">
              <span className="font-medium">
                {provider.user.firstName} {provider.user.lastName}
              </span>
            </Link>
            {provider.verified && (
              <CheckCircle className="h-4 w-4 text-primary" aria-label="Verifisert" />
            )}
          </div>
          {provider.businessName && (
            <p className="text-sm text-muted-foreground">{provider.businessName}</p>
          )}
          <div className="flex items-center gap-3 mt-1 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{provider.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({provider.reviewCount})</span>
            </span>
          </div>
        </div>
        <Link href={`/leverandor/${provider.id}`}>
          <Button variant="ghost" size="sm" className="shrink-0">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Booking details */}
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {formatDate(scheduledAt)} kl. {formatTime(scheduledAt)}
        </span>
        {booking.address && (
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {booking.address.street}, {booking.address.postalCode} {booking.address.city}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t">
        {booking.hasReview ? (
          <Button size="sm" variant="outline" disabled>
            <CheckCircle className="mr-2 h-4 w-4" />
            Vurdering sendt
          </Button>
        ) : (
          <ReviewDialog
            bookingId={booking.id}
            providerName={`${provider.user.firstName} ${provider.user.lastName}`}
            serviceName={serviceNames}
            onSubmit={submitReview}
          />
        )}
        <Link href={`/booking/${booking.providerId}`}>
          <Button variant="outline" size="sm">
            Book igjen
          </Button>
        </Link>
      </div>
    </div>
  );
}
