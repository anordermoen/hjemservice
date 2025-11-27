"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProviderCard } from "@/components/common/ProviderCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ServiceProvider } from "@/types";
import { Search } from "lucide-react";

interface ProviderListProps {
  providers: ServiceProvider[];
}

export function ProviderList({ providers }: ProviderListProps) {
  const searchParams = useSearchParams();

  const location = searchParams.get("sted")?.toLowerCase() || "";
  const sortBy = searchParams.get("sorter") || "recommended";
  const requiredLanguages = searchParams.get("sprak")?.split(",").filter(Boolean) || [];
  const requireCertificates = searchParams.get("sertifikater") === "true";
  const requirePoliceCheck = searchParams.get("politiattest") === "true";

  const filteredAndSortedProviders = useMemo(() => {
    let result = [...providers];

    // Filter by location
    if (location) {
      result = result.filter((provider) =>
        provider.areasServed.some((area) =>
          area.toLowerCase().includes(location)
        )
      );
    }

    // Filter by languages (provider must speak all selected languages fluently or natively)
    if (requiredLanguages.length > 0) {
      result = result.filter((provider) => {
        if (!provider.languages) return false;
        return requiredLanguages.every((langCode) =>
          provider.languages.some(
            (l) =>
              l.code === langCode &&
              (l.proficiency === "morsmål" || l.proficiency === "flytende")
          )
        );
      });
    }

    // Filter by verified certificates
    if (requireCertificates) {
      result = result.filter(
        (provider) =>
          provider.certificates &&
          provider.certificates.some((c) => c.verified)
      );
    }

    // Filter by police check
    if (requirePoliceCheck) {
      result = result.filter((provider) => provider.policeCheck);
    }

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        result.sort((a, b) => {
          const minA = Math.min(...a.services.map((s) => s.price));
          const minB = Math.min(...b.services.map((s) => s.price));
          return minA - minB;
        });
        break;
      case "price-high":
        result.sort((a, b) => {
          const minA = Math.min(...a.services.map((s) => s.price));
          const minB = Math.min(...b.services.map((s) => s.price));
          return minB - minA;
        });
        break;
      case "recommended":
      default:
        // Default sorting: verified first, then by rating
        result.sort((a, b) => {
          if (a.verified !== b.verified) return b.verified ? 1 : -1;
          return b.rating - a.rating;
        });
        break;
    }

    return result;
  }, [providers, location, sortBy, requiredLanguages, requireCertificates, requirePoliceCheck]);

  const hasFilters = location || requiredLanguages.length > 0 || requireCertificates || requirePoliceCheck;

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
        {filteredAndSortedProviders.length} leverandør{filteredAndSortedProviders.length !== 1 ? "er" : ""} funnet
        {location && ` i "${location}"`}
      </p>

      {filteredAndSortedProviders.length > 0 ? (
        <div className="space-y-4">
          {filteredAndSortedProviders.map((provider) => (
            <ProviderCard key={provider.userId} provider={provider} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="Ingen leverandører funnet"
          description={
            hasFilters
              ? "Prøv å justere filtrene dine for å se flere leverandører."
              : "Det er ingen leverandører i denne kategorien ennå."
          }
        />
      )}
    </>
  );
}
