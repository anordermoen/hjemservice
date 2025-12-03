import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Clock,
  MapPin,
  MoreHorizontal,
  AlertTriangle,
  Calendar,
  Star,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { auth } from "@/lib/auth";
import { getBookingsByCustomerId } from "@/lib/db/bookings";
import { formatPrice, formatDate, formatTime } from "@/lib/utils";
import { CompletedBookingCard } from "./BookingCardClient";

export const metadata = {
  title: "Mine bestillinger | HjemService",
  description: "Se og administrer dine bestillinger.",
};

type BookingWithProvider = Awaited<ReturnType<typeof getBookingsByCustomerId>>[0];

interface BookingCardProps {
  booking: BookingWithProvider;
  showActions?: boolean;
}

function isWithin24Hours(booking: BookingWithProvider): boolean {
  const now = new Date();
  const hoursUntilBooking =
    (booking.scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilBooking < 24;
}

function BookingCard({ booking, showActions = false }: BookingCardProps) {
  const provider = booking.provider;
  if (!provider) return null;

  const initials = `${provider.user.firstName?.[0] || ""}${provider.user.lastName?.[0] || ""}`;
  const within24Hours = booking.status === "CONFIRMED" && isWithin24Hours(booking);
  const serviceNames = booking.services.map((s) => s.name).join(", ");

  // Map database status to component status
  const statusMap: Record<string, BookingStatus> = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  };
  const displayStatus = statusMap[booking.status] || "pending";

  return (
    <div className="rounded-lg border p-4">
      {/* Header with service name and status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium">{serviceNames}</h3>
          <StatusBadge
            type="booking"
            status={displayStatus}
            customLabel={
              booking.status === "CANCELLED" &&
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
          {formatDate(booking.scheduledAt)} kl. {formatTime(booking.scheduledAt)}
        </span>
        {booking.address && (
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {booking.address.street}, {booking.address.postalCode} {booking.address.city}
          </span>
        )}
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
        {booking.status === "COMPLETED" && (
          <>
            <Button size="sm">Gi vurdering</Button>
            <Link href={`/booking/${booking.providerId}`}>
              <Button variant="outline" size="sm">
                Book igjen
              </Button>
            </Link>
          </>
        )}
        {booking.status === "CONFIRMED" && (
          <>
            <Link href={`/leverandor/${provider.id}`}>
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
        {booking.status === "CANCELLED" && (
          <Link href={`/leverandor/${provider.id}`}>
            <Button variant="outline" size="sm">
              Se profil
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function BookingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/logg-inn?callbackUrl=/mine-sider/bestillinger");
  }

  const allBookings = await getBookingsByCustomerId(session.user.id);

  const upcoming = allBookings.filter(
    (b) => b.status === "CONFIRMED" && b.scheduledAt > new Date()
  );
  const completed = allBookings.filter((b) => b.status === "COMPLETED");
  const cancelled = allBookings.filter((b) => b.status === "CANCELLED");

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
                <CompletedBookingCard
                  key={booking.id}
                  booking={{
                    id: booking.id,
                    status: booking.status,
                    totalPrice: booking.totalPrice,
                    scheduledAt: booking.scheduledAt.toISOString(),
                    providerId: booking.providerId,
                    hasReview: !!booking.review,
                    provider: {
                      id: booking.provider.id,
                      businessName: booking.provider.businessName,
                      rating: booking.provider.rating,
                      reviewCount: booking.provider.reviewCount,
                      verified: booking.provider.verified,
                      user: {
                        firstName: booking.provider.user.firstName,
                        lastName: booking.provider.user.lastName,
                        avatarUrl: booking.provider.user.avatarUrl,
                      },
                    },
                    address: booking.address,
                    services: booking.services.map((s) => ({ name: s.name })),
                  }}
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
