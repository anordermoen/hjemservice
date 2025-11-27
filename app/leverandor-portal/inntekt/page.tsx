import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Inntekt | Leverandørportal | HjemService",
  description: "Se din inntektsoversikt.",
};

// Mock data
const stats = {
  thisMonth: 24500,
  lastMonth: 21800,
  pendingPayout: 8750,
  nextPayoutDate: "2024-12-15",
};

const transactions = [
  {
    id: "t1",
    date: "2024-12-04",
    customerName: "Kari Nordmann",
    service: "Dameklipp",
    amount: 550,
    fee: 55,
    net: 495,
    status: "completed",
  },
  {
    id: "t2",
    date: "2024-12-03",
    customerName: "Ole Hansen",
    service: "Herreklipp + skjegg",
    amount: 550,
    fee: 55,
    net: 495,
    status: "completed",
  },
  {
    id: "t3",
    date: "2024-12-02",
    customerName: "Lise Pedersen",
    service: "Klipp + farge",
    amount: 1200,
    fee: 120,
    net: 1080,
    status: "completed",
  },
  {
    id: "t4",
    date: "2024-12-01",
    customerName: "Mari Olsen",
    service: "Dameklipp",
    amount: 550,
    fee: 55,
    net: 495,
    status: "pending",
  },
  {
    id: "t5",
    date: "2024-11-30",
    customerName: "Erik Berg",
    service: "Herreklipp",
    amount: 450,
    fee: 45,
    net: 405,
    status: "paid",
  },
];

const payouts = [
  { date: "2024-11-30", amount: 12500, status: "completed" },
  { date: "2024-11-15", amount: 9300, status: "completed" },
  { date: "2024-10-31", amount: 11200, status: "completed" },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

export default function EarningsPage() {
  const changePercent = (
    ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) *
    100
  ).toFixed(1);
  const isPositive = stats.thisMonth >= stats.lastMonth;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Denne måneden</p>
                <p className="text-2xl font-bold">
                  {formatPrice(stats.thisMonth)}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={isPositive ? "text-green-600" : "text-red-600"}
                  >
                    {isPositive ? "+" : ""}
                    {changePercent}%
                  </span>
                  <span className="text-muted-foreground">fra forrige</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Venter på utbetaling</p>
              <p className="text-2xl font-bold">
                {formatPrice(stats.pendingPayout)}
              </p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Neste utbetaling: {formatDate(stats.nextPayoutDate)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Forrige måned</p>
              <p className="text-2xl font-bold">
                {formatPrice(stats.lastMonth)}
              </p>
              <p className="text-sm text-muted-foreground">
                Totalt etter gebyr
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Siste transaksjoner</CardTitle>
            <Button variant="ghost" size="sm">
              Se alle
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{tx.service}</p>
                    <p className="text-sm text-muted-foreground">
                      {tx.customerName} • {formatDate(tx.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(tx.net)}</p>
                    <Badge
                      variant={
                        tx.status === "completed"
                          ? "secondary"
                          : tx.status === "pending"
                          ? "warning"
                          : "success"
                      }
                    >
                      {tx.status === "completed"
                        ? "Fullført"
                        : tx.status === "pending"
                        ? "Venter"
                        : "Utbetalt"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payout history */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Utbetalingshistorikk</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Last ned rapport
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payouts.map((payout, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Utbetaling</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payout.date)}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600">
                    +{formatPrice(payout.amount)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="rounded-lg bg-muted/40 p-4">
              <h4 className="mb-2 font-medium">Om utbetalinger</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Utbetalinger skjer den 15. og siste dag i måneden</li>
                <li>• Plattformgebyr: 10% av totalbeløp</li>
                <li>• Utbetaling til konto: 1-3 virkedager</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
