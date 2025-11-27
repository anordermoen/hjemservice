import Link from "next/link";
import { Clock, MapPin, MoreHorizontal, AlertTriangle } from "lucide-react";
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
import { getBookingsByCustomerId, isWithin24Hours } from "@/lib/data/bookings";
import { getProviderById } from "@/lib/data/providers";
import { formatPrice, formatDate } from "@/lib/utils";
import { Booking } from "@/types";

export const metadata = {
  title: "Mine bestillinger | HjemService",
  description: "Se og administrer dine bestillinger.",
};

function getStatusBadge(status: string, cancellation?: Booking["cancellation"]) {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Bekreftet</Badge>;
    case "completed":
      return <Badge variant="secondary">Fullført</Badge>;
    case "cancelled":
      if (cancellation?.wasWithin24Hours && cancellation.cancellationFee > 0) {
        return (
          <Badge variant="destructive">
            Avbestilt (gebyr {formatPrice(cancellation.cancellationFee)})
          </Badge>
        );
      }
      return <Badge variant="destructive">Avbestilt</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

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

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={provider.user.avatarUrl} alt="" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium">{serviceNames}</h3>
            {getStatusBadge(booking.status, booking.cancellation)}
          </div>
          <p className="text-sm text-muted-foreground">
            {provider.user.firstName} {provider.user.lastName} – {provider.businessName}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {formatDate(booking.scheduledAt)} kl.{" "}
              {booking.scheduledAt.toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {booking.address.street}, {booking.address.postalCode} {booking.address.city}
            </span>
          </div>
          <p className="mt-2 font-medium">{formatPrice(booking.totalPrice)}</p>

          {within24Hours && (
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              <span>Avbestilling nå medfører 50% gebyr</span>
            </div>
          )}

          {booking.cancellation && booking.cancellation.feeRefunded && (
            <p className="mt-2 text-xs text-green-600">
              Avbestillingsgebyr tilbakeført av leverandør
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
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
        {showActions && booking.status === "confirmed" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Flere valg">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/leverandor/${booking.providerId}`}>Se leverandør</Link>
              </DropdownMenuItem>
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
              <div className="py-8 text-center">
                <p className="mb-4 text-muted-foreground">Du har ingen kommende bestillinger</p>
                <Link href="/tjenester">
                  <Button>Finn tjenester</Button>
                </Link>
              </div>
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
              <p className="py-8 text-center text-muted-foreground">
                Ingen fullførte bestillinger ennå
              </p>
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
              <p className="py-8 text-center text-muted-foreground">Ingen avbestilte bestillinger</p>
            )}
          </TabsContent>
        </Tabs>

        {/* Cancellation policy info */}
        <div className="mt-6 rounded-lg bg-muted/40 p-4">
          <h3 className="font-medium mb-2">Avbestillingsregler</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Gratis avbestilling mer enn 24 timer før avtalt tid</li>
            <li>• 50% gebyr ved avbestilling innen 24 timer</li>
            <li>• Leverandøren kan velge å refundere gebyret</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
