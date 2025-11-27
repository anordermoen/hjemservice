import Link from "next/link";
import {
  Clock,
  MapPin,
  MoreHorizontal,
  AlertTriangle,
  Calendar,
  Star,
  Languages,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge, BookingStatus } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { TipList } from "@/components/common/InfoBox";
import { getBookingsByCustomerId, isWithin24Hours } from "@/lib/data/bookings";
import { getProviderById } from "@/lib/data/providers";
import { formatPrice, formatDate, formatTime } from "@/lib/utils";
import { Booking } from "@/types";

export const metadata = {
  title: "Mine bestillinger | HjemService",
  description: "Se og administrer dine bestillinger.",
};

interface BookingCardProps {
  booking: Booking;
  provider: ReturnType<typeof getProviderById>;
  showActions?: boolean;
}

function BookingCard({ booking, provider, showActions = false }: BookingCardProps) {
  if (!provider) return null;

  const initials = `${provider.user.firstName[0]}${provider.user.lastName[0]}`;
  const within24Hours = booking.status === "confirmed" && isWithin24Hours(booking);
  const serviceNames = booking.services.map((s) => s.name).join(", ");
  const fluentLanguages = provider.languages?.filter(
    (l) => l.proficiency === "morsmål" || l.proficiency === "flytende"
  ) || [];

  return (
    <div className="rounded-lg border p-4">
      {/* Header with service name and status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium">{serviceNames}</h3>
          <StatusBadge
            type="booking"
            status={booking.status as BookingStatus}
            customLabel={
              booking.status === "cancelled" &&
              booking.cancellation?.wasWithin24Hours &&
              booking.cancellation.cancellationFee > 0
                ? `Avbestilt (gebyr ${formatPrice(booking.cancellation.cancellationFee)})`
                : undefined
            }
          />
        </div>
        <p className="font-semibold text-primary">{formatPrice(booking.totalPrice)}</p>
      </div>

      {/* Provider info */}
      <div className="flex items-start gap-3 mb-3 p-3 bg-muted/30 rounded-lg">
        <Link href={`/leverandor/${provider.userId}`}>
          <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
            <AvatarImage src={provider.user.avatarUrl} alt="" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/leverandor/${provider.userId}`} className="hover:underline">
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
            {fluentLanguages.length > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Languages className="h-3.5 w-3.5" />
                {fluentLanguages.map((l) => l.name).join(", ")}
              </span>
            )}
          </div>
        </div>
        <Link href={`/leverandor/${provider.userId}`}>
          <Button variant="ghost" size="sm" className="shrink-0">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Booking details */}
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {formatDate(booking.scheduledAt)} kl. {formatTime(booking.scheduledAt)}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {booking.address.street}, {booking.address.postalCode} {booking.address.city}
        </span>
      </div>

      {within24Hours && (
        <div className="mt-3 flex items-center gap-1 text-xs text-amber-600">
          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
          <span>Avbestilling nå medfører 50% gebyr</span>
        </div>
      )}

      {booking.cancellation && booking.cancellation.feeRefunded && (
        <p className="mt-3 text-xs text-green-600">
          Avbestillingsgebyr tilbakeført av leverandør
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t">
        {booking.status === "completed" && (
          <>
            <Button size="sm">Gi vurdering</Button>
            <Link href={`/booking/${booking.providerId}`}>
              <Button variant="outline" size="sm">
                Book igjen
              </Button>
            </Link>
          </>
        )}
        {booking.status === "confirmed" && (
          <>
            <Link href={`/leverandor/${provider.userId}`}>
              <Button variant="outline" size="sm">
                Se profil
              </Button>
            </Link>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Flere valg">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/mine-sider/bestillinger/${booking.id}/kanseller`}
                      className="text-destructive"
                    >
                      Avbestill
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        )}
        {booking.status === "cancelled" && (
          <Link href={`/leverandor/${provider.userId}`}>
            <Button variant="outline" size="sm">
              Se profil
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  // In a real app, this would get the current user's ID from auth
  const currentUserId = "c1";
  const allBookings = getBookingsByCustomerId(currentUserId);

  const upcoming = allBookings.filter(
    (b) => b.status === "confirmed" && b.scheduledAt > new Date()
  );
  const completed = allBookings.filter((b) => b.status === "completed");
  const cancelled = allBookings.filter((b) => b.status === "cancelled");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mine bestillinger</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="upcoming">Kommende ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="completed">Fullførte ({completed.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Avbestilte ({cancelled.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcoming.length > 0 ? (
              upcoming.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  provider={getProviderById(booking.providerId)}
                  showActions
                />
              ))
            ) : (
              <EmptyState
                icon={Calendar}
                title="Du har ingen kommende bestillinger"
                action={
                  <Link href="/tjenester">
                    <Button>Finn tjenester</Button>
                  </Link>
                }
              />
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completed.length > 0 ? (
              completed.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  provider={getProviderById(booking.providerId)}
                />
              ))
            ) : (
              <EmptyState title="Ingen fullførte bestillinger ennå" />
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelled.length > 0 ? (
              cancelled.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  provider={getProviderById(booking.providerId)}
                />
              ))
            ) : (
              <EmptyState title="Ingen avbestilte bestillinger" />
            )}
          </TabsContent>
        </Tabs>

        <TipList
          title="Avbestillingsregler"
          className="mt-6"
          tips={[
            "Gratis avbestilling mer enn 24 timer før avtalt tid",
            "50% gebyr ved avbestilling innen 24 timer",
            "Leverandøren kan velge å refundere gebyret",
          ]}
        />
      </CardContent>
    </Card>
  );
}
