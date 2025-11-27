import Link from "next/link";
import {
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Admin Dashboard | HjemService",
  description: "Administrer HjemService-plattformen.",
};

// Mock admin stats
const stats = {
  totalUsers: 1284,
  totalProviders: 89,
  bookingsToday: 47,
  revenueToday: 58500,
  pendingApprovals: 5,
  openTickets: 3,
};

const recentActivity = [
  {
    id: "1",
    type: "new_provider",
    message: "Ny leverandørsøknad fra Erik Berg",
    time: "5 min siden",
  },
  {
    id: "2",
    type: "booking",
    message: "Ny bestilling: Dameklipp hos Maria Hansen",
    time: "12 min siden",
  },
  {
    id: "3",
    type: "review",
    message: "Ny vurdering (5 stjerner) for Rent & Pent AS",
    time: "28 min siden",
  },
  {
    id: "4",
    type: "support",
    message: "Ny supporthenvendelse fra Jonas Nilsen",
    time: "1 time siden",
  },
  {
    id: "5",
    type: "booking",
    message: "Avbestilling: Herreklipp hos Thomas Nilsen",
    time: "2 timer siden",
  },
];

const pendingProviders = [
  {
    id: "p1",
    name: "Erik Berg",
    category: "Håndverker",
    applied: "2024-12-04",
    experience: "8 år",
  },
  {
    id: "p2",
    name: "Anna Larsen",
    category: "Renhold",
    applied: "2024-12-03",
    experience: "5 år",
  },
  {
    id: "p3",
    name: "Thomas Vik",
    category: "Elektriker",
    applied: "2024-12-02",
    experience: "12 år",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Brukere</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leverandører</p>
                <p className="text-2xl font-bold">{stats.totalProviders}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bestillinger i dag</p>
                <p className="text-2xl font-bold">{stats.bookingsToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Omsetning i dag</p>
                <p className="text-2xl font-bold">
                  {formatPrice(stats.revenueToday)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">
                {stats.pendingApprovals} leverandørsøknader venter
              </p>
              <p className="text-sm text-yellow-600">
                Klikk for å se og godkjenne
              </p>
            </div>
            <Link href="/admin/godkjenning">
              <Button size="sm" variant="outline">
                Se alle
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertCircle className="h-8 w-8 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-blue-800">
                {stats.openTickets} åpne supporthenvendelser
              </p>
              <p className="text-sm text-blue-600">Trenger oppfølging</p>
            </div>
            <Button size="sm" variant="outline">
              Se alle
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ventende godkjenninger</CardTitle>
            <Link href="/admin/godkjenning">
              <Button variant="ghost" size="sm">
                Se alle
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {provider.category} • {provider.experience} erfaring
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Avslå
                    </Button>
                    <Button size="sm">Godkjenn</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Siste aktivitet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <Badge
                    variant={
                      activity.type === "new_provider"
                        ? "default"
                        : activity.type === "support"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {activity.type === "new_provider"
                      ? "Ny søknad"
                      : activity.type === "booking"
                      ? "Bestilling"
                      : activity.type === "review"
                      ? "Vurdering"
                      : "Support"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
