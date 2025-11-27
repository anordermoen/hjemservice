"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProviderCard } from "@/components/common/ProviderCard";
import { ServiceProvider } from "@/types";

interface ProviderListProps {
  providers: ServiceProvider[];
}

export function ProviderList({ providers }: ProviderListProps) {
  const searchParams = useSearchParams();

  const location = searchParams.get("sted")?.toLowerCase() || "";
  const sortBy = searchParams.get("sorter") || "recommended";

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
  }, [providers, location, sortBy]);

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
        <div className="rounded-lg border bg-muted/40 p-8 text-center">
          <p className="text-muted-foreground">
            {location
              ? `Ingen leverandører funnet i "${location}". Prøv et annet sted.`
              : "Ingen leverandører funnet i denne kategorien."}
          </p>
        </div>
      )}
    </>
  );
}
