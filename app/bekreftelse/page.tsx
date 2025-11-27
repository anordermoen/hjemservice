import Link from "next/link";
import {
  CheckCircle,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  Languages,
  Shield,
  FileCheck,
  ExternalLink,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TipList } from "@/components/common/InfoBox";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Bestilling bekreftet | HjemService",
  description: "Din bestilling er bekreftet.",
};

export default function ConfirmationPage() {
  // In a real app, this would get data from the booking session/API
  const bookingDetails = {
    id: "BK-2024-001",
    provider: {
      id: "p1",
      name: "Maria Hansen",
      businessName: "Marias Mobile Frisør",
      avatarUrl: undefined,
      rating: 4.9,
      reviewCount: 127,
      verified: true,
      policeCheck: true,
      insurance: true,
      languages: ["Norsk", "Engelsk"],
      phone: "+47 912 34 567",
    },
    service: "Dameklipp",
    duration: 45,
    date: "Mandag 2. desember 2024",
    time: "14:00",
    address: {
      street: "Storgata 1",
      postalCode: "0182",
      city: "Oslo",
    },
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

        {/* Provider card */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Link href={`/leverandor/${bookingDetails.provider.id}`}>
                <Avatar className="h-16 w-16 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                  <AvatarImage src={bookingDetails.provider.avatarUrl} />
                  <AvatarFallback className="text-lg">
                    {bookingDetails.provider.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`/leverandor/${bookingDetails.provider.id}`} className="hover:underline">
                    <h3 className="font-semibold">{bookingDetails.provider.name}</h3>
                  </Link>
                  {bookingDetails.provider.verified && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verifisert
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{bookingDetails.provider.businessName}</p>

                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{bookingDetails.provider.rating}</span>
                    <span className="text-muted-foreground">({bookingDetails.provider.reviewCount})</span>
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Languages className="h-4 w-4" />
                    {bookingDetails.provider.languages.join(", ")}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {bookingDetails.provider.policeCheck && (
                    <Badge variant="outline" className="text-xs">
                      <FileCheck className="mr-1 h-3 w-3" />
                      Politiattest
                    </Badge>
                  )}
                  {bookingDetails.provider.insurance && (
                    <Badge variant="outline" className="text-xs">
                      <Shield className="mr-1 h-3 w-3" />
                      Forsikret
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t">
              <Link href={`/leverandor/${bookingDetails.provider.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Se profil
                </Button>
              </Link>
              <a href={`tel:${bookingDetails.provider.phone}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Ring
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Booking details */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Bestillingsdetaljer</h2>
              <span className="text-sm text-muted-foreground">#{bookingDetails.id}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium">{bookingDetails.date}</p>
                  <p className="text-sm text-muted-foreground">kl. {bookingDetails.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium">{bookingDetails.address.street}</p>
                  <p className="text-sm text-muted-foreground">
                    {bookingDetails.address.postalCode} {bookingDetails.address.city}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="font-medium">{bookingDetails.service}</p>
                  <p className="text-sm text-muted-foreground">ca. {bookingDetails.duration} min</p>
                </div>
              </div>
              <p className="text-xl font-bold text-primary">{formatPrice(bookingDetails.price)}</p>
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

        <TipList
          title="Viktig informasjon"
          className="mt-8"
          tips={[
            "Leverandøren vil kontakte deg hvis noe er uklart",
            "Du kan avbestille gratis inntil 24 timer før avtalt tid",
            "Ved spørsmål, kontakt oss på hjelp@hjemservice.no",
          ]}
        />
      </div>
    </div>
  );
}
