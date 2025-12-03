import Link from "next/link";
import {
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { getAdminStats, getPendingProviders } from "@/lib/db/admin";
import { getPendingChangeRequestsCount } from "@/lib/db/provider-changes";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Admin Dashboard | HjemService",
  description: "Administrer HjemService-plattformen.",
};

export default async function AdminDashboardPage() {
  const [stats, pendingProviders, pendingChanges] = await Promise.all([
    getAdminStats(),
    getPendingProviders(),
    getPendingChangeRequestsCount(),
  ]);

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
      {stats.pendingApprovals > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">
                {stats.pendingApprovals} leverandørsøknad{stats.pendingApprovals > 1 ? "er" : ""} venter
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
      )}

      {pendingChanges > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center gap-4 p-4">
            <FileCheck className="h-8 w-8 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-blue-800">
                {pendingChanges} leverandørendring{pendingChanges > 1 ? "er" : ""} venter på godkjenning
              </p>
              <p className="text-sm text-blue-600">
                Sertifikater, språk og andre profilendringer
              </p>
            </div>
            <Link href="/admin/endringer">
              <Button size="sm" variant="outline">
                Se alle
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

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
          {pendingProviders.length > 0 ? (
            <div className="space-y-3">
              {pendingProviders.slice(0, 5).map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {provider.user.firstName} {provider.user.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {provider.categories.map((c) => c.name).join(", ")} •{" "}
                      {provider.yearsExperience} års erfaring
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
          ) : (
            <EmptyState
              icon={UserCheck}
              title="Ingen ventende godkjenninger"
              description="Nye leverandørsøknader vil vises her"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
