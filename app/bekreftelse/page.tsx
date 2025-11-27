import Link from "next/link";
import { CheckCircle, Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Bestilling bekreftet | HjemService",
  description: "Din bestilling er bekreftet.",
};

export default function ConfirmationPage() {
  // In a real app, this would get data from the booking session/API
  const bookingDetails = {
    id: "BK-2024-001",
    providerName: "Maria Hansen",
    businessName: "Marias Mobile Frisør",
    service: "Dameklipp",
    date: "Mandag 2. desember 2024",
    time: "14:00",
    address: "Storgata 1, 0182 Oslo",
    price: 749,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Success message */}
        <div className="mb-8 text-center" role="status" aria-live="polite">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100" aria-hidden="true">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Bestillingen er bekreftet!</h1>
          <p className="text-muted-foreground">
            Du vil motta en bekreftelse på SMS og e-post.
          </p>
        </div>

        {/* Booking details */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Bestillingsdetaljer</h2>
              <span className="text-sm text-muted-foreground">
                #{bookingDetails.id}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-medium">{bookingDetails.providerName}</p>
                <p className="text-sm text-muted-foreground">
                  {bookingDetails.businessName}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="font-medium">{bookingDetails.date}</p>
                    <p className="text-sm text-muted-foreground">
                      kl. {bookingDetails.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="font-medium">{bookingDetails.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="font-medium">{bookingDetails.service}</p>
                    <p className="text-sm text-muted-foreground">
                      kr {bookingDetails.price}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button className="w-full" size="lg" asChild>
            <Link href="/mine-sider/bestillinger">
              Se mine bestillinger
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>

          <Button variant="outline" className="w-full" size="lg" asChild>
            <Link href="/">Tilbake til forsiden</Link>
          </Button>
        </div>

        {/* Info */}
        <div className="mt-8 rounded-lg bg-muted/40 p-4">
          <h3 className="mb-2 font-medium">Viktig informasjon</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Leverandøren vil kontakte deg hvis noe er uklart</li>
            <li>• Du kan avbestille gratis inntil 24 timer før avtalt tid</li>
            <li>
              • Ved spørsmål, kontakt oss på{" "}
              <a href="mailto:hjelp@hjemservice.no" className="text-primary">
                hjelp@hjemservice.no
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
