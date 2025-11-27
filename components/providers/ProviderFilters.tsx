"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProviderFiltersProps {
  categoryId: string;
}

export function ProviderFilters({ categoryId }: ProviderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentLocation = searchParams.get("sted") || "";
  const currentSort = searchParams.get("sorter") || "recommended";

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "recommended") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/tjenester/${categoryId}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Debounce the location search
    const value = e.target.value;
    if (value.length === 0 || value.length >= 2) {
      updateParams("sted", value);
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center">
      <div className="flex flex-1 flex-col gap-4 md:flex-row">
        <Input
          placeholder="Sted eller postnummer"
          className="md:max-w-[200px]"
          defaultValue={currentLocation}
          onChange={handleLocationChange}
          aria-label="Filtrer på sted eller postnummer"
        />
        <Select
          defaultValue={currentSort}
          onValueChange={(value) => updateParams("sorter", value)}
        >
          <SelectTrigger className="md:w-[180px]" aria-label="Sorter leverandører">
            <SelectValue placeholder="Sorter etter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Anbefalt</SelectItem>
            <SelectItem value="rating">Best vurdert</SelectItem>
            <SelectItem value="price-low">Pris lav-høy</SelectItem>
            <SelectItem value="price-high">Pris høy-lav</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" className="md:hidden" aria-label="Vis flere filtre">
        <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
        Flere filtre
      </Button>
      <Button variant="outline" className="hidden md:flex" aria-label="Vis flere filtre">
        <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
        Flere filtre
      </Button>
    </div>
  );
}
