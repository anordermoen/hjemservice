import Link from "next/link";
import { Calendar, ArrowRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata = {
  title: "Mine sider | HjemService",
  description: "Administrer dine bestillinger og innstillinger.",
};

// Mock upcoming bookings
const upcomingBookings = [
  {
    id: "b1",
    providerName: "Maria Hansen",
    providerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    businessName: "Marias Mobile Frisør",
    service: "Dameklipp",
    date: "2024-12-05",
    time: "14:00",
    address: "Storgata 1, 0182 Oslo",
    status: "confirmed",
  },
  {
    id: "b2",
    providerName: "Elena Kowalski",
    providerAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
    businessName: "Rent & Pent AS",
    service: "Ukentlig renhold",
    date: "2024-12-07",
    time: "09:00",
    address: "Storgata 1, 0182 Oslo",
    status: "confirmed",
  },
];

function formatBookingDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-2 text-xl font-semibold">Hei! Velkommen tilbake</h2>
          <p className="text-muted-foreground">
            Du har {upcomingBookings.length} kommende bestillinger.
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
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
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
                        <h3 className="font-medium">{booking.service}</h3>
                        <Badge variant="success">Bekreftet</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.providerName} – {booking.businessName}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatBookingDate(booking.date)} kl. {booking.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {booking.address}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Vis detaljer
                  </Button>
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
            <h3 className="mb-2 font-medium">Legg til familiemedlem</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Book tjenester på vegne av familie
            </p>
            <Link href="/mine-sider/familie">
              <Button variant="outline" className="w-full">
                Legg til
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
