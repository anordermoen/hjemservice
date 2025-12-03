import { redirect } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/common/EmptyState";
import { auth } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/db/providers";
import { getProviderEarnings } from "@/lib/db/bookings";
import { formatPrice, formatDateShort } from "@/lib/utils";

export const metadata = {
  title: "Inntekt | Leverandørportal | HjemService",
  description: "Se din inntektsoversikt.",
};

export default async function EarningsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/logg-inn?callbackUrl=/leverandor-portal/inntekt");
  }

  const provider = await getProviderByUserId(session.user.id);

  if (!provider) {
    redirect("/bli-leverandor");
  }

  const earnings = await getProviderEarnings(provider.id);

  const changePercent = earnings.lastMonth > 0
    ? ((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth * 100).toFixed(1)
    : "0";
  const isPositive = earnings.thisMonth >= earnings.lastMonth;

  // Calculate next payout date (15th or last day of month)
  const today = new Date();
  let nextPayoutDate: Date;
  if (today.getDate() < 15) {
    nextPayoutDate = new Date(today.getFullYear(), today.getMonth(), 15);
  } else {
    nextPayoutDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }

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
                  {formatPrice(earnings.thisMonth)}
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
                {formatPrice(earnings.pendingPayout)}
              </p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Neste utbetaling: {formatDateShort(nextPayoutDate)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Forrige måned</p>
              <p className="text-2xl font-bold">
                {formatPrice(earnings.lastMonth)}
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
            {earnings.transactions.length > 0 ? (
              <div className="space-y-3">
                {earnings.transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{tx.service}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.customerName} • {formatDateShort(new Date(tx.date))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(tx.net)}</p>
                      <Badge
                        variant={
                          tx.status === "completed"
                            ? "secondary"
                            : "warning"
                        }
                        className={tx.status === "completed" ? "bg-green-100 text-green-800" : ""}
                      >
                        {tx.status === "completed" ? "Fullført" : "Venter"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="Ingen transaksjoner ennå"
                description="Dine fullførte oppdrag vil vises her"
              />
            )}
          </CardContent>
        </Card>

        {/* Payout info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Utbetalinger</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Last ned rapport
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/40 p-4">
              <h4 className="mb-2 font-medium">Om utbetalinger</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Utbetalinger skjer den 15. og siste dag i måneden</li>
                <li>• Plattformgebyr: 15% av totalbeløp</li>
                <li>• Utbetaling til konto: 1-3 virkedager</li>
              </ul>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Totalt opptjent</span>
                <span className="font-medium">
                  {formatPrice(earnings.thisMonth + earnings.lastMonth)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plattformgebyr (15%)</span>
                <span className="font-medium text-muted-foreground">
                  -{formatPrice(Math.round((earnings.thisMonth + earnings.lastMonth) * 0.15 / 0.85))}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium pt-2 border-t">
                <span>Netto inntekt</span>
                <span className="text-primary">
                  {formatPrice(earnings.thisMonth + earnings.lastMonth)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
