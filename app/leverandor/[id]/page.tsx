import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Shield,
  Clock,
  MapPin,
  Calendar,
  FileCheck,
  Languages,
  Award,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Rating } from "@/components/common/Rating";
import { getProviderById, getProviders } from "@/lib/db/providers";
import { formatPrice, formatDate } from "@/lib/utils";

interface ProviderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  const providers = await getProviders();
  return providers.map((provider) => ({
    id: provider.id,
  }));
}

export async function generateMetadata({ params }: ProviderPageProps) {
  const { id } = await params;
  const provider = await getProviderById(id);

  if (!provider) {
    return {
      title: "Leverandør ikke funnet | HjemService",
    };
  }

  return {
    title: `${provider.user.firstName} ${provider.user.lastName} | HjemService`,
    description: provider.bio.substring(0, 160),
  };
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const { id } = await params;
  const provider = await getProviderById(id);

  if (!provider) {
    notFound();
  }

  const reviews = provider.reviews || [];
  const initials = `${provider.user.firstName?.[0] || ""}${provider.user.lastName?.[0] || ""}`;

  // Build availability schedule from database format
  const schedule = {
    sunday: provider.availability.filter((a) => a.dayOfWeek === 0).map((a) => ({ start: a.startTime, end: a.endTime })),
    monday: provider.availability.filter((a) => a.dayOfWeek === 1).map((a) => ({ start: a.startTime, end: a.endTime })),
    tuesday: provider.availability.filter((a) => a.dayOfWeek === 2).map((a) => ({ start: a.startTime, end: a.endTime })),
    wednesday: provider.availability.filter((a) => a.dayOfWeek === 3).map((a) => ({ start: a.startTime, end: a.endTime })),
    thursday: provider.availability.filter((a) => a.dayOfWeek === 4).map((a) => ({ start: a.startTime, end: a.endTime })),
    friday: provider.availability.filter((a) => a.dayOfWeek === 5).map((a) => ({ start: a.startTime, end: a.endTime })),
    saturday: provider.availability.filter((a) => a.dayOfWeek === 6).map((a) => ({ start: a.startTime, end: a.endTime })),
  };

  // Generate next 7 available dates
  const availableDates: Date[] = [];
  const getDayName = (date: Date): keyof typeof schedule => {
    const days: (keyof typeof schedule)[] = [
      "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
    ];
    return days[date.getDay()];
  };

  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = getDayName(date);
    if (schedule[dayName]?.length > 0) {
      availableDates.push(date);
      if (availableDates.length >= 7) break;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col items-start gap-6 sm:flex-row">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                  <AvatarImage
                    src={provider.user.avatarUrl || undefined}
                    alt={`${provider.user.firstName} ${provider.user.lastName}`}
                  />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold">
                      {provider.user.firstName} {provider.user.lastName}
                    </h1>
                    {provider.verified && (
                      <Badge variant="secondary">
                        <CheckCircle className="mr-1 h-3 w-3" aria-hidden="true" />
                        Verifisert
                      </Badge>
                    )}
                  </div>

                  {provider.businessName && (
                    <p className="mb-3 text-muted-foreground">
                      {provider.businessName}
                    </p>
                  )}

                  <div className="mb-4">
                    <Rating
                      value={provider.rating}
                      count={provider.reviewCount}
                      size="md"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {provider.policeCheck && (
                      <Badge variant="outline">
                        <FileCheck className="mr-1 h-3 w-3" aria-hidden="true" />
                        Politiattest
                      </Badge>
                    )}
                    {provider.insurance && (
                      <Badge variant="outline">
                        <Shield className="mr-1 h-3 w-3" aria-hidden="true" />
                        Forsikret
                      </Badge>
                    )}
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
                      {provider.yearsExperience} års erfaring
                    </Badge>
                    <Badge variant="outline">
                      <MapPin className="mr-1 h-3 w-3" aria-hidden="true" />
                      {provider.areasServed.join(", ")}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Om meg</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{provider.bio}</p>
            </CardContent>
          </Card>

          {/* Qualifications */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Kvalifikasjoner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Languages */}
              {provider.languages && provider.languages.length > 0 && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-medium">
                    <Languages className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    Språk
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.languages.map((lang) => (
                      <Badge key={lang.code} variant="secondary" className="py-1.5">
                        <span className="font-medium">{lang.name}</span>
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          ({lang.proficiency})
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificates */}
              {provider.certificates && provider.certificates.length > 0 && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-medium">
                    <Award className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    Sertifikater og utdanning
                  </h4>
                  <div className="space-y-2">
                    {provider.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{cert.name}</span>
                            {cert.verified && (
                              <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {cert.issuer} • {cert.year}
                          </p>
                        </div>
                        {cert.verified && (
                          <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                            Verifisert
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Background */}
              {(provider.nationality || provider.education) && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-medium">
                    <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    Bakgrunn
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {provider.nationality && (
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground mb-1">Nasjonalitet</p>
                        <p className="font-medium">{provider.nationality}</p>
                      </div>
                    )}
                    {provider.education && (
                      <div className="rounded-lg border p-3">
                        <p className="text-xs text-muted-foreground mb-1">Utdanning</p>
                        <p className="font-medium">{provider.education}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services & Prices */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tjenester og priser</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {provider.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      {service.description && (
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Ca. {service.duration} min
                      </p>
                    </div>
                    <p className="font-semibold text-primary">
                      {formatPrice(service.price)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vurderinger</CardTitle>
                <div className="flex items-center gap-2">
                  <Rating value={provider.rating} size="sm" showValue={false} />
                  <span className="font-semibold">{provider.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({provider.reviewCount} vurderinger)
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <span className="text-sm font-medium">
                              {review.customerName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {review.customerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Rating
                          value={review.rating}
                          size="sm"
                          showValue={false}
                        />
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Ingen vurderinger ennå
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Booking widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" aria-hidden="true" />
                  Book tid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Neste ledige tider:
                </p>

                <div className="mb-6 space-y-2">
                  {availableDates.slice(0, 5).map((date, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm"
                    >
                      <span>{formatDate(date)}</span>
                      <Badge variant="secondary">Ledig</Badge>
                    </div>
                  ))}
                </div>

                <Link href={`/booking/${provider.id}`}>
                  <Button className="w-full" size="lg">
                    Book nå
                  </Button>
                </Link>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Gratis avbestilling inntil 24 timer før
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile sticky booking button */}
      <div className="fixed bottom-16 left-0 right-0 border-t bg-background p-4 md:hidden">
        <Link href={`/booking/${provider.id}`}>
          <Button className="w-full" size="lg">
            Book nå
          </Button>
        </Link>
      </div>
    </div>
  );
}
