import Link from "next/link";
import {
  Calendar,
  Clock,
  TrendingUp,
  Star,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Leverandørportal | HjemService",
  description: "Administrer din virksomhet på HjemService.",
};

// Mock data
const stats = {
  todayAppointments: 3,
  pendingRequests: 2,
  monthlyEarnings: 24500,
  rating: 4.9,
  reviewCount: 127,
};

const todaysAppointments = [
  {
    id: "a1",
    customerName: "Kari Nordmann",
    service: "Dameklipp",
    time: "10:00",
    address: "Storgata 1, 0182 Oslo",
  },
  {
    id: "a2",
    customerName: "Ole Hansen",
    service: "Herreklipp + skjegg",
    time: "12:00",
    address: "Parkveien 15, 0350 Oslo",
  },
  {
    id: "a3",
    customerName: "Lise Pedersen",
    service: "Klipp + farge",
    time: "14:30",
    address: "Bygdøy allé 10, 0262 Oslo",
  },
];

const pendingRequests = [
  {
    id: "r1",
    customerName: "Erik Berg",
    service: "Herreklipp",
    date: "2024-12-08",
    time: "11:00",
    address: "Grensen 5, 0159 Oslo",
  },
  {
    id: "r2",
    customerName: "Anne Vik",
    service: "Dameklipp",
    date: "2024-12-09",
    time: "15:00",
    address: "Karl Johans gate 20, 0159 Oslo",
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function ProviderDashboardPage() {
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
                <p className="text-2xl font-bold">{stats.pendingRequests}</p>
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
                <p className="text-2xl font-bold">{stats.rating}</p>
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
          {todaysAppointments.length > 0 ? (
            <div className="space-y-3">
              {todaysAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <span className="text-sm font-semibold">
                        {appointment.time}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{appointment.service}</h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.address}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Detaljer
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              Ingen avtaler i dag
            </p>
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
          <Link href="/leverandor-portal/oppdrag">
            <Button variant="ghost" size="sm">
              Se alle
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{request.service}</h3>
                      <Badge variant="warning">Venter</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.customerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(request.date)} kl. {request.time}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.address}
                    </p>
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
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              Ingen ventende forespørsler
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
