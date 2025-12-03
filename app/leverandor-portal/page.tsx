import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar,
  Clock,
  TrendingUp,
  Star,
  ArrowRight,
  CheckCircle,
  XCircle,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { auth } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/db/providers";
import {
  getTodaysBookings,
  getPendingBookings,
  getProviderStats,
} from "@/lib/db/bookings";
import { getOpenQuoteRequestsForProvider } from "@/lib/db/quotes";
import { formatPrice, formatTime } from "@/lib/utils";

export const metadata = {
  title: "Leverandørportal | HjemService",
  description: "Administrer din virksomhet på HjemService.",
};

export default async function ProviderDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/logg-inn?callbackUrl=/leverandor-portal");
  }

  const provider = await getProviderByUserId(session.user.id);

  if (!provider) {
    redirect("/bli-leverandor");
  }

  const [stats, todaysBookings, pendingBookings, quoteRequests] = await Promise.all([
    getProviderStats(provider.id),
    getTodaysBookings(provider.id),
    getPendingBookings(provider.id),
    getOpenQuoteRequestsForProvider(provider.id),
  ]);

  // Count quote requests that haven't been responded to yet
  const unansweredQuotes = quoteRequests.filter(
    (r) => !r.responses.some((resp) => resp.providerId === provider.id)
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">I dag</p>
                <p className="text-2xl font-bold">{stats.todayAppointments}</p>
                <p className="text-xs text-muted-foreground">avtaler</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ventende</p>
                <p className="text-2xl font-bold">{stats.pendingRequests + unansweredQuotes}</p>
                <p className="text-xs text-muted-foreground">forespørsler</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Denne måneden</p>
                <p className="text-2xl font-bold">
                  {formatPrice(stats.monthlyEarnings)}
                </p>
                <p className="text-xs text-muted-foreground">inntekt</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vurdering</p>
                <p className="text-2xl font-bold">{stats.rating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.reviewCount} vurderinger
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dagens avtaler
          </CardTitle>
          <Link href="/leverandor-portal/kalender">
            <Button variant="ghost" size="sm">
              Se kalender
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {todaysBookings.length > 0 ? (
            <div className="space-y-3">
              {todaysBookings.map((booking) => {
                const serviceNames = booking.services.map((s) => s.name).join(", ");
                const customerName = booking.recipientName ||
                  `${booking.customer.firstName} ${booking.customer.lastName}`;

                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <span className="text-sm font-semibold">
                          {formatTime(booking.scheduledAt)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{serviceNames}</h3>
                        <p className="text-sm text-muted-foreground">
                          {customerName}
                        </p>
                        {booking.address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.address.street}, {booking.address.postalCode} {booking.address.city}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link href="/leverandor-portal/oppdrag">
                      <Button variant="outline" size="sm">
                        Detaljer
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="Ingen avtaler i dag"
              description="Dine kommende avtaler vil vises her"
            />
          )}
        </CardContent>
      </Card>

      {/* Pending requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Ventende forespørsler
          </CardTitle>
          <div className="flex gap-2">
            {unansweredQuotes > 0 && (
              <Link href="/leverandor-portal/tilbud">
                <Button variant="outline" size="sm">
                  {unansweredQuotes} tilbudsforespørsler
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link href="/leverandor-portal/oppdrag">
              <Button variant="ghost" size="sm">
                Se alle
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {pendingBookings.length > 0 ? (
            <div className="space-y-3">
              {pendingBookings.slice(0, 5).map((booking) => {
                const serviceNames = booking.services.map((s) => s.name).join(", ");
                const customerName = booking.recipientName ||
                  `${booking.customer.firstName} ${booking.customer.lastName}`;

                return (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{serviceNames}</h3>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Venter
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {customerName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.scheduledAt.toLocaleDateString("nb-NO", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        kl. {formatTime(booking.scheduledAt)}
                      </p>
                      {booking.address && (
                        <p className="text-xs text-muted-foreground">
                          {booking.address.street}, {booking.address.postalCode} {booking.address.city}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <XCircle className="mr-2 h-4 w-4" />
                        Avslå
                      </Button>
                      <Button size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Godta
                      </Button>
                    </div>
                  </div>
                );
              })}
              {pendingBookings.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{pendingBookings.length - 5} flere ventende forespørsler
                </p>
              )}
            </div>
          ) : unansweredQuotes > 0 ? (
            <div className="py-4 text-center">
              <p className="text-muted-foreground mb-3">
                Du har {unansweredQuotes} tilbudsforespørsler som venter på svar
              </p>
              <Link href="/leverandor-portal/tilbud">
                <Button>Se tilbudsforespørsler</Button>
              </Link>
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="Ingen ventende forespørsler"
              description="Nye bestillinger og tilbudsforespørsler vil vises her"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
