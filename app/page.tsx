import Link from "next/link";
import { CheckCircle, Shield, Star, ArrowRight, FileCheck, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ServiceCard } from "@/components/common/ServiceCard";
import { Rating } from "@/components/common/Rating";
import { IncomeCalculator } from "@/components/landing/IncomeCalculator";
import { SearchForm } from "@/components/home/SearchForm";
import { getCategories } from "@/lib/db/categories";
import { getFeaturedProviders } from "@/lib/db/providers";
import { formatPrice } from "@/lib/utils";

export default async function HomePage() {
  const [categories, featuredProviders] = await Promise.all([
    getCategories(),
    getFeaturedProviders(4),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
              Tjenester som kommer hjem til deg
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Book frisør, renhold, håndverker og mer – enkelt og trygt
            </p>

            <SearchForm />
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16" aria-labelledby="services-heading">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 id="services-heading" className="mb-2 text-2xl font-bold md:text-3xl">
              Våre tjenester
            </h2>
            <p className="text-muted-foreground">
              Finn fagfolk som kommer hjem til deg
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <ServiceCard
                key={category.id}
                category={category}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/40 py-16" aria-labelledby="how-it-works-heading">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 id="how-it-works-heading" className="mb-2 text-2xl font-bold md:text-3xl">
              Slik fungerer det
            </h2>
            <p className="text-muted-foreground">
              Tre enkle steg til tjenester hjemme
            </p>
          </div>

          <ol className="grid gap-8 md:grid-cols-3" role="list">
            {[
              {
                step: "1",
                title: "Finn tjeneste",
                description: "Søk og sammenlign fagfolk i ditt område",
              },
              {
                step: "2",
                title: "Book tid",
                description: "Velg dato og klokkeslett som passer deg",
              },
              {
                step: "3",
                title: "Betal enkelt",
                description: "Betal trygt med Vipps eller kort",
              },
            ].map((item) => (
              <li key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground" aria-hidden="true">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16" aria-labelledby="trust-heading">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 id="trust-heading" className="mb-2 text-2xl font-bold md:text-3xl">
              Trygt og enkelt
            </h2>
            <p className="text-muted-foreground">
              Vi sikrer kvalitet i alle ledd
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-green-100 p-3" aria-hidden="true">
                  <FileCheck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mb-2 font-semibold">Verifiserte fagfolk</h3>
                <p className="text-sm text-muted-foreground">
                  Alle leverandører har politiattest og nødvendige
                  sertifiseringer
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-blue-100 p-3" aria-hidden="true">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-2 font-semibold">Trygg betaling</h3>
                <p className="text-sm text-muted-foreground">
                  All betaling skjer sikkert via plattformen
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-yellow-100 p-3" aria-hidden="true">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="mb-2 font-semibold">Kvalitetsgaranti</h3>
                <p className="text-sm text-muted-foreground">
                  Les vurderinger fra ekte kunder før du booker
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="bg-muted/40 py-16" aria-labelledby="providers-heading">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 id="providers-heading" className="mb-2 text-2xl font-bold md:text-3xl">
                Populære leverandører
              </h2>
              <p className="text-muted-foreground">
                Høyt rangerte fagfolk i Oslo-området
              </p>
            </div>
            <Link href="/tjenester" className="hidden md:block">
              <Button variant="outline">
                Se alle
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProviders.map((provider) => {
              const minPrice = provider.services.length > 0
                ? Math.min(...provider.services.map((s) => s.price))
                : 0;
              const initials = `${provider.user.firstName?.[0] || ""}${provider.user.lastName?.[0] || ""}`;
              const fluentLanguages = provider.languages?.filter(
                (l) => l.proficiency === "morsmål" || l.proficiency === "flytende"
              ) || [];

              return (
                <Link
                  key={provider.id}
                  href={`/leverandor/${provider.id}`}
                >
                  <Card className="h-full transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={provider.user.avatarUrl || undefined}
                            alt=""
                          />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold">
                            {provider.user.firstName} {provider.user.lastName}
                          </h3>
                          <p className="truncate text-sm text-muted-foreground">
                            {provider.businessName}
                          </p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <Rating
                          value={provider.rating}
                          count={provider.reviewCount}
                          size="sm"
                        />
                      </div>
                      {fluentLanguages.length > 0 && (
                        <p className="mb-2 text-xs text-muted-foreground flex items-center gap-1">
                          <Languages className="h-3 w-3" aria-hidden="true" />
                          {fluentLanguages.map((l) => l.name).join(", ")}
                        </p>
                      )}
                      <div className="mb-3 flex flex-wrap gap-1">
                        {provider.policeCheck && (
                          <Badge variant="secondary" className="text-xs">
                            <FileCheck className="mr-1 h-3 w-3" aria-hidden="true" />
                            Politiattest
                          </Badge>
                        )}
                        {provider.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="mr-1 h-3 w-3" aria-hidden="true" />
                            Verifisert
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-primary">
                          Fra {formatPrice(minPrice)}
                        </span>
                        <span className="text-muted-foreground">
                          {provider.areasServed[0]}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 text-center md:hidden">
            <Link href="/tjenester">
              <Button variant="outline">
                Se alle leverandører
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Income Calculator */}
      <IncomeCalculator />

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center p-8 text-center md:p-12">
              <h2 className="mb-4 text-2xl font-bold md:text-3xl">
                Er du fagperson?
              </h2>
              <p className="mb-6 max-w-xl text-primary-foreground/80">
                Bli leverandør på HjemService og få tilgang til tusenvis av
                kunder i ditt område. Bestem selv priser og arbeidstider.
              </p>
              <Link href="/bli-leverandor">
                <Button
                  size="lg"
                  variant="secondary"
                  className="font-semibold"
                >
                  Bli leverandør
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
