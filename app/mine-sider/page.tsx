"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Calendar, ArrowRight, Clock, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Booking {
  id: string;
  providerName: string;
  providerAvatar?: string;
  businessName?: string;
  serviceName: string;
  scheduledAt: string;
  address: string;
  status: string;
}

function formatBookingDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatBookingTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case "CONFIRMED":
      return <Badge variant="success">Bekreftet</Badge>;
    case "PENDING":
      return <Badge variant="warning">Venter</Badge>;
    case "COMPLETED":
      return <Badge variant="secondary">Fullført</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Kansellert</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch("/api/bookings/upcoming");
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.user) {
      fetchBookings();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const firstName = session?.user?.name?.split(" ")[0] || "der";

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-2 text-xl font-semibold">Hei {firstName}! Velkommen tilbake</h2>
          <p className="text-muted-foreground">
            {isLoading
              ? "Laster bestillinger..."
              : bookings.length > 0
              ? `Du har ${bookings.length} kommende bestilling${bookings.length > 1 ? "er" : ""}.`
              : "Du har ingen kommende bestillinger."}
          </p>
        </CardContent>
      </Card>

      {/* Upcoming bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Kommende bestillinger
          </CardTitle>
          <Link href="/mine-sider/bestillinger">
            <Button variant="ghost" size="sm">
              Se alle
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={booking.providerAvatar}
                        alt={booking.providerName}
                      />
                      <AvatarFallback>
                        {booking.providerName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{booking.serviceName}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.providerName}
                        {booking.businessName && ` – ${booking.businessName}`}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatBookingDate(booking.scheduledAt)} kl.{" "}
                          {formatBookingTime(booking.scheduledAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {booking.address}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/mine-sider/bestillinger/${booking.id}`}>
                    <Button variant="outline" size="sm">
                      Vis detaljer
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="mb-4 text-muted-foreground">
                Du har ingen kommende bestillinger
              </p>
              <Link href="/tjenester">
                <Button>Finn tjenester</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-2 font-medium">Finn tjenester</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Søk etter fagfolk i ditt område
            </p>
            <Link href="/tjenester">
              <Button variant="outline" className="w-full">
                Utforsk
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-2 font-medium">Be om tilbud</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Få tilbud fra flere leverandører
            </p>
            <Link href="/tjenester">
              <Button variant="outline" className="w-full">
                Start forespørsel
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-2 font-medium">Innstillinger</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Oppdater profil og preferanser
            </p>
            <Link href="/mine-sider/innstillinger">
              <Button variant="outline" className="w-full">
                Gå til innstillinger
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
