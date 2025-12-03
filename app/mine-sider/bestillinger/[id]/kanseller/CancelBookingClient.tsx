"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Star,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice, formatDate } from "@/lib/utils";
import { cancelBooking } from "@/app/actions/booking";

interface BookingService {
  name: string;
  price: number;
}

interface BookingAddress {
  street: string;
  postalCode: string;
  city: string;
}

interface Provider {
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
}

interface Booking {
  id: string;
  totalPrice: number;
  scheduledAt: Date;
  paymentMethod: string;
  services: BookingService[];
  address: BookingAddress | null;
  provider: Provider;
}

interface CancelBookingClientProps {
  booking: Booking;
  cancellationFee: number;
  within24Hours: boolean;
}

export function CancelBookingClient({ booking, cancellationFee, within24Hours }: CancelBookingClientProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const provider = booking.provider;
  const refundAmount = booking.totalPrice - cancellationFee;
  const initials = `${provider.user.firstName?.[0] || ""}${provider.user.lastName?.[0] || ""}`;

  const handleCancel = async () => {
    setIsSubmitting(true);

    try {
      await cancelBooking(booking.id, reason || undefined);
      router.push(`/mine-sider/bestillinger/${booking.id}/kansellert`);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Back button */}
        <Link
          href="/mine-sider/bestillinger"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Tilbake til bestillinger
        </Link>

        <h1 className="mb-6 text-2xl font-bold">Kanseller bestilling</h1>

        {/* Booking details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Bestillingsdetaljer</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Provider info */}
            <div className="flex items-start gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
              <Link href={`/leverandor/${provider.id}`}>
                <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                  <AvatarImage src={provider.user.avatarUrl || undefined} alt="" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <Link href={`/leverandor/${provider.id}`} className="hover:underline">
                    <p className="font-medium">
                      {provider.user.firstName} {provider.user.lastName}
                    </p>
                  </Link>
                  {provider.verified && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </div>
                {provider.businessName && (
                  <p className="text-sm text-muted-foreground">
                    {provider.businessName}
                  </p>
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
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{formatDate(booking.scheduledAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>
                  {new Date(booking.scheduledAt).toLocaleTimeString("nb-NO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {booking.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>
                    {booking.address.street}, {booking.address.postalCode} {booking.address.city}
                  </span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              {booking.services.map((service, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{service.name}</span>
                  <span>{formatPrice(service.price)}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Totalt betalt</span>
                <span>{formatPrice(booking.totalPrice)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation warning */}
        {within24Hours ? (
          <Card className="mb-6 border-amber-500">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-amber-700">
                    Avbestilling innen 24 timer
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Siden det er mindre enn 24 timer til avtalt tid, vil du bli belastet et avbestillingsgebyr på 50% av totalbeløpet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-green-500">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <p className="font-medium text-green-700">
                    Gratis avbestilling
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Du kan avbestille uten gebyr siden det er mer enn 24 timer til avtalt tid.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Refund summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Refusjon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Betalt beløp</span>
                <span>{formatPrice(booking.totalPrice)}</span>
              </div>
              {cancellationFee > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Avbestillingsgebyr (50%)</span>
                  <span>-{formatPrice(cancellationFee)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-medium text-base">
                <span>Du får tilbake</span>
                <span className="text-green-600">{formatPrice(refundAmount)}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Refusjonen vil bli tilbakeført til {booking.paymentMethod === "VIPPS" ? "Vipps" : "kortet ditt"} innen 3-5 virkedager.
            </p>
          </CardContent>
        </Card>

        {/* Reason */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Årsak til avbestilling (valgfritt)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Fortell oss gjerne hvorfor du avbestiller..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Avbryt
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Avbestiller..." : "Bekreft avbestilling"}
          </Button>
        </div>

        {within24Hours && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Ved å bekrefte godtar du at {formatPrice(cancellationFee)} trekkes som avbestillingsgebyr.
          </p>
        )}
      </div>
    </div>
  );
}
