import Link from "next/link";
import { CheckCircle, Shield, FileCheck, Languages, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Rating } from "@/components/common/Rating";
import { ServiceProvider } from "@/types";
import { formatPrice } from "@/lib/utils";

interface ProviderCardProps {
  provider: ServiceProvider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const minPrice = Math.min(...provider.services.map((s) => s.price));
  const initials = `${provider.user.firstName[0]}${provider.user.lastName[0]}`;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Avatar section */}
          <div className="flex items-center justify-center bg-muted p-6 sm:w-32">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={provider.user.avatarUrl}
                alt={`${provider.user.firstName} ${provider.user.lastName}`}
              />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
          </div>

          {/* Content section */}
          <div className="flex flex-1 flex-col p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {provider.user.firstName} {provider.user.lastName}
                  </h3>
                  {provider.verified && (
                    <CheckCircle className="h-4 w-4 text-primary" aria-label="Verifisert" />
                  )}
                </div>
                {provider.businessName && (
                  <p className="text-sm text-muted-foreground">
                    {provider.businessName}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Fra</p>
                <p className="font-semibold text-primary">
                  {formatPrice(minPrice)}
                </p>
              </div>
            </div>

            <div className="mb-3">
              <Rating
                value={provider.rating}
                count={provider.reviewCount}
                size="sm"
              />
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {provider.verified && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="mr-1 h-3 w-3" aria-hidden="true" />
                  Verifisert
                </Badge>
              )}
              {provider.policeCheck && (
                <Badge variant="secondary" className="text-xs">
                  <FileCheck className="mr-1 h-3 w-3" aria-hidden="true" />
                  Politiattest
                </Badge>
              )}
              {provider.insurance && (
                <Badge variant="secondary" className="text-xs">
                  <Shield className="mr-1 h-3 w-3" aria-hidden="true" />
                  Forsikret
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {provider.yearsExperience} års erfaring
              </Badge>
            </div>

            {/* Languages and certificates compact display */}
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {provider.languages && provider.languages.length > 0 && (
                <span className="flex items-center gap-1">
                  <Languages className="h-3 w-3" aria-hidden="true" />
                  {provider.languages
                    .filter((l) => l.proficiency === "morsmål" || l.proficiency === "flytende")
                    .map((l) => l.name)
                    .join(", ") || provider.languages[0].name}
                </span>
              )}
              {provider.certificates && provider.certificates.filter((c) => c.verified).length > 0 && (
                <span className="flex items-center gap-1">
                  <Award className="h-3 w-3" aria-hidden="true" />
                  {provider.certificates.filter((c) => c.verified).length} verifiserte sertifikater
                </span>
              )}
            </div>

            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
              {provider.bio}
            </p>

            <div className="mt-auto flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {provider.areasServed.slice(0, 3).join(", ")}
                {provider.areasServed.length > 3 && " +"}
              </p>
              <Link href={`/leverandor/${(provider as { id?: string }).id || provider.userId}`}>
                <Button size="sm">Se profil</Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
