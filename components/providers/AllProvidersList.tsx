"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProviderCard } from "@/components/common/ProviderCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ServiceProvider } from "@/types";
import { Search } from "lucide-react";

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface AllProvidersListProps {
  providers: ServiceProvider[];
  categories: Category[];
}

export function AllProvidersList({ providers, categories }: AllProvidersListProps) {
  const searchParams = useSearchParams();

  const location = searchParams.get("sted")?.toLowerCase() || "";
  const sortBy = searchParams.get("sorter") || "recommended";
  const selectedCategory = searchParams.get("kategori") || "";
  const requiredLanguages = searchParams.get("sprak")?.split(",").filter(Boolean) || [];
  const requireCertificates = searchParams.get("sertifikater") === "true";
  const requirePoliceCheck = searchParams.get("politiattest") === "true";
  const minPrice = searchParams.get("minPris") ? parseInt(searchParams.get("minPris")!) : undefined;
  const maxPrice = searchParams.get("maksPris") ? parseInt(searchParams.get("maksPris")!) : undefined;
  const minRating = searchParams.get("minVurdering") ? parseFloat(searchParams.get("minVurdering")!) : undefined;
  const availableDays = searchParams.get("dager")?.split(",").filter(Boolean).map(Number) || [];

  const filteredAndSortedProviders = useMemo(() => {
    let result = [...providers];

    // Filter by category
    if (selectedCategory) {
      result = result.filter((provider) =>
        provider.categories.includes(selectedCategory)
      );
    }

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

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      result = result.filter((provider) => {
        const providerMinPrice = Math.min(...provider.services.map((s) => s.price));
        if (minPrice !== undefined && providerMinPrice < minPrice) return false;
        if (maxPrice !== undefined && providerMinPrice > maxPrice) return false;
        return true;
      });
    }

    // Filter by minimum rating
    if (minRating !== undefined) {
      result = result.filter((provider) => provider.rating >= minRating);
    }

    // Filter by available days
    if (availableDays.length > 0) {
      result = result.filter((provider) => {
        if (!provider.availability?.schedule) return false;
        const schedule = provider.availability.schedule;
        const dayMap: Record<number, keyof typeof schedule> = {
          0: "sunday",
          1: "monday",
          2: "tuesday",
          3: "wednesday",
          4: "thursday",
          5: "friday",
          6: "saturday",
        };
        // Provider must work on ALL selected days
        return availableDays.every((day) => {
          const dayKey = dayMap[day];
          const daySlots = schedule[dayKey];
          return daySlots && daySlots.length > 0;
        });
      });
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
  }, [providers, selectedCategory, location, sortBy, requiredLanguages, requireCertificates, requirePoliceCheck, minPrice, maxPrice, minRating, availableDays]);

  const hasFilters = selectedCategory || location || requiredLanguages.length > 0 || requireCertificates || requirePoliceCheck || minPrice !== undefined || maxPrice !== undefined || minRating !== undefined || availableDays.length > 0;

  const categoryName = selectedCategory
    ? categories.find((c) => c.slug === selectedCategory)?.name
    : null;

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
        {filteredAndSortedProviders.length} leverandør{filteredAndSortedProviders.length !== 1 ? "er" : ""} funnet
        {categoryName && ` innen ${categoryName}`}
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
              : "Det er ingen leverandører registrert ennå."
          }
        />
      )}
    </>
  );
}
