import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderCard } from "@/components/common/ProviderCard";
import { auth } from "@/lib/auth";
import { getFavoriteProviders } from "@/lib/db/users";
import { ServiceProvider } from "@/types";

export const metadata = {
  title: "Favoritter | HjemService",
  description: "Se dine lagrede leverandører.",
};

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/logg-inn?callbackUrl=/mine-sider/favoritter");
  }

  const dbProviders = await getFavoriteProviders(session.user.id);

  // Transform to ServiceProvider format for ProviderCard
  const favoriteProviders: ServiceProvider[] = dbProviders.map((p) => ({
    userId: p.id, // Use provider id for compatibility with ProviderCard link
    businessName: p.businessName || undefined,
    bio: p.bio,
    categories: p.categories.map((c) => c.slug),
    services: p.services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration,
      category: s.categoryId,
      description: s.description || undefined,
    })),
    areasServed: p.areasServed,
    rating: p.rating,
    reviewCount: p.reviewCount,
    verified: p.verified,
    insurance: p.insurance,
    policeCheck: p.policeCheck,
    yearsExperience: p.yearsExperience,
    availability: {
      schedule: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      },
      blockedDates: [],
      leadTime: p.leadTime,
    },
    createdAt: p.createdAt,
    approvedAt: p.approvedAt || undefined,
    user: {
      id: p.user.id,
      email: p.user.email,
      phone: p.user.phone || "",
      firstName: p.user.firstName || "",
      lastName: p.user.lastName || "",
      role: "provider" as const,
      createdAt: p.user.createdAt,
      avatarUrl: p.user.avatarUrl || undefined,
    },
    languages: p.languages.map((l) => ({
      code: l.code,
      name: l.name,
      proficiency: l.proficiency as "morsmål" | "flytende" | "god" | "grunnleggende",
    })),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Mine favoritter
        </CardTitle>
      </CardHeader>
      <CardContent>
        {favoriteProviders.length > 0 ? (
          <div className="space-y-4">
            {favoriteProviders.map((provider) => (
              <ProviderCard key={provider.userId} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-medium">Ingen favoritter ennå</h3>
            <p className="mb-4 text-muted-foreground">
              Legg til leverandører som favoritter for rask tilgang
            </p>
            <Link href="/tjenester">
              <Button>Finn leverandører</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
