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
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Statistikk | Admin | HjemService",
  description: "Plattformstatistikk og rapporter.",
};

// Mock statistics data
const stats = {
  totalBookings: 3847,
  bookingsChange: 12.5,
  totalRevenue: 1847500,
  revenueChange: 18.2,
  activeUsers: 1284,
  usersChange: 8.3,
  activeProviders: 89,
  providersChange: 15.1,
};

const categoryStats = [
  { name: "Frisør", bookings: 1245, revenue: 687500, providers: 28 },
  { name: "Renhold", bookings: 982, revenue: 491000, providers: 24 },
  { name: "Håndverker", bookings: 756, revenue: 378000, providers: 18 },
  { name: "Elektriker", bookings: 423, revenue: 211500, providers: 9 },
  { name: "Rørlegger", bookings: 287, revenue: 143500, providers: 6 },
  { name: "Hage", bookings: 154, revenue: 77000, providers: 4 },
];

const topProviders = [
  {
    name: "Maria Hansen",
    category: "Frisør",
    bookings: 127,
    revenue: 69850,
    rating: 4.9,
  },
  {
    name: "Rent & Pent AS",
    category: "Renhold",
    bookings: 203,
    revenue: 180670,
    rating: 4.8,
  },
  {
    name: "Per Olsen",
    category: "Håndverker",
    bookings: 312,
    revenue: 202800,
    rating: 4.9,
  },
  {
    name: "Erik Strøm",
    category: "Elektriker",
    bookings: 98,
    revenue: 87220,
    rating: 4.8,
  },
  {
    name: "Kristine Skog",
    category: "Hage",
    bookings: 87,
    revenue: 39150,
    rating: 4.9,
  },
];

const monthlyData = [
  { month: "Jan", bookings: 245, revenue: 122500 },
  { month: "Feb", bookings: 278, revenue: 139000 },
  { month: "Mar", bookings: 312, revenue: 156000 },
  { month: "Apr", bookings: 356, revenue: 178000 },
  { month: "Mai", bookings: 389, revenue: 194500 },
  { month: "Jun", bookings: 412, revenue: 206000 },
  { month: "Jul", bookings: 298, revenue: 149000 },
  { month: "Aug", bookings: 334, revenue: 167000 },
  { month: "Sep", bookings: 378, revenue: 189000 },
  { month: "Okt", bookings: 401, revenue: 200500 },
  { month: "Nov", bookings: 423, revenue: 211500 },
  { month: "Des", bookings: 447, revenue: 223500 },
];

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
                {change}%
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

export default function StatisticsPage() {
  const maxBookings = Math.max(...monthlyData.map((d) => d.bookings));

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
          change={stats.usersChange}
          icon={Users}
        />
        <StatCard
          title="Aktive leverandører"
          value={stats.activeProviders}
          change={stats.providersChange}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly trend - simple bar visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Bestillinger per måned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2" style={{ height: 200 }}>
              {monthlyData.map((data) => (
                <div key={data.month} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-primary transition-all hover:bg-primary/80"
                    style={{
                      height: `${(data.bookings / maxBookings) * 160}px`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Per kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryStats.map((cat) => {
                const percentage = (cat.bookings / stats.totalBookings) * 100;
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
          </CardContent>
        </Card>
      </div>

      {/* Top providers */}
      <Card>
        <CardHeader>
          <CardTitle>Topp leverandører</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <tr key={provider.name} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium">{provider.name}</span>
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
                      <span className="text-yellow-500">★</span> {provider.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
