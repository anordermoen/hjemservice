import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderCard } from "@/components/common/ProviderCard";
import { providers } from "@/lib/data/providers";

export const metadata = {
  title: "Favoritter | HjemService",
  description: "Se dine lagrede leverandører.",
};

export default function FavoritesPage() {
  // Mock: first 2 providers are favorites
  const favoriteProviders = providers.slice(0, 2);

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
