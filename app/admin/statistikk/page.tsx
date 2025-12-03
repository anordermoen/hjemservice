import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPlatformStats, getCategoryStats, getTopProviders } from "@/lib/db/admin";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Statistikk | Admin | HjemService",
  description: "Plattformstatistikk og rapporter.",
};

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  format = "number",
}: {
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
  format?: "number" | "currency";
}) {
  const isPositive = change >= 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {format === "currency" ? formatPrice(value) : value.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 text-sm">
              {isPositive ? (
                <ArrowUp className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500" />
              )}
              <span className={isPositive ? "text-green-600" : "text-red-600"}>
                {isPositive ? "+" : ""}
                {change.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">fra forrige måned</span>
            </div>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

export default async function StatisticsPage() {
  const [stats, categoryStats, topProviders] = await Promise.all([
    getPlatformStats(),
    getCategoryStats(),
    getTopProviders(5),
  ]);

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Totale bestillinger"
          value={stats.totalBookings}
          change={stats.bookingsChange}
          icon={Calendar}
        />
        <StatCard
          title="Total omsetning"
          value={stats.totalRevenue}
          change={stats.revenueChange}
          icon={DollarSign}
          format="currency"
        />
        <StatCard
          title="Aktive brukere"
          value={stats.activeUsers}
          change={0}
          icon={Users}
        />
        <StatCard
          title="Aktive leverandører"
          value={stats.activeProviders}
          change={0}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Per kategori</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryStats.length > 0 ? (
              <div className="space-y-3">
                {categoryStats.map((cat) => {
                  const percentage = stats.totalBookings > 0
                    ? (cat.bookings / stats.totalBookings) * 100
                    : 0;
                  return (
                    <div key={cat.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-muted-foreground">
                          {cat.bookings} bestillinger
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                        <span>{formatPrice(cat.revenue)}</span>
                        <span>{cat.providers} leverandører</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                Ingen data tilgjengelig
              </p>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Oppsummering</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Gjennomsnittlig bestillingsverdi</p>
                <p className="text-2xl font-bold">
                  {stats.totalBookings > 0
                    ? formatPrice(Math.round(stats.totalRevenue / stats.totalBookings))
                    : formatPrice(0)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Bestillinger per leverandør</p>
                <p className="text-2xl font-bold">
                  {stats.activeProviders > 0
                    ? (stats.totalBookings / stats.activeProviders).toFixed(1)
                    : "0"}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Plattformgebyr (15%)</p>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(Math.round(stats.totalRevenue * 0.15))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top providers */}
      <Card>
        <CardHeader>
          <CardTitle>Topp leverandører</CardTitle>
        </CardHeader>
        <CardContent>
          {topProviders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Leverandør</th>
                    <th className="pb-3 font-medium">Kategori</th>
                    <th className="pb-3 text-right font-medium">Bestillinger</th>
                    <th className="pb-3 text-right font-medium">Omsetning</th>
                    <th className="pb-3 text-right font-medium">Vurdering</th>
                  </tr>
                </thead>
                <tbody>
                  {topProviders.map((provider, index) => (
                    <tr key={provider.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium">
                            {provider.businessName || provider.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant="secondary">{provider.category}</Badge>
                      </td>
                      <td className="py-3 text-right">{provider.bookings}</td>
                      <td className="py-3 text-right">
                        {formatPrice(provider.revenue)}
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-yellow-500">★</span> {provider.rating.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              Ingen leverandører ennå
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
