"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";

// Available languages for filtering
const AVAILABLE_LANGUAGES = [
  { code: "no", name: "Norsk" },
  { code: "en", name: "Engelsk" },
  { code: "pl", name: "Polsk" },
  { code: "sv", name: "Svensk" },
  { code: "da", name: "Dansk" },
  { code: "lt", name: "Litauisk" },
];

interface ProviderFiltersProps {
  categoryId: string;
}

export function ProviderFilters({ categoryId }: ProviderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const currentLocation = searchParams.get("sted") || "";
  const currentSort = searchParams.get("sorter") || "recommended";
  const currentLanguages = searchParams.get("sprak")?.split(",").filter(Boolean) || [];
  const requireCertificates = searchParams.get("sertifikater") === "true";
  const requirePoliceCheck = searchParams.get("politiattest") === "true";

  const activeFilterCount = currentLanguages.length + (requireCertificates ? 1 : 0) + (requirePoliceCheck ? 1 : 0);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "recommended") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/tjenester/${categoryId}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const updateMultipleParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/tjenester/${categoryId}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length === 0 || value.length >= 2) {
      updateParams("sted", value);
    }
  };

  const toggleLanguage = (code: string) => {
    const newLanguages = currentLanguages.includes(code)
      ? currentLanguages.filter((l) => l !== code)
      : [...currentLanguages, code];
    updateParams("sprak", newLanguages.join(","));
  };

  const clearFilters = () => {
    updateMultipleParams({
      sprak: null,
      sertifikater: null,
      politiattest: null,
    });
  };

  const FilterSheet = (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="mr-2 h-4 w-4 md:block hidden" aria-hidden="true" />
          <SlidersHorizontal className="mr-2 h-4 w-4 md:hidden" aria-hidden="true" />
          Flere filtre
          {activeFilterCount > 0 && (
            <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtrer leverandører</SheetTitle>
          <SheetDescription>
            Finn leverandører som matcher dine preferanser
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Language filters */}
          <div>
            <h4 className="font-medium mb-3">Språk</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Velg språk leverandøren må kunne (flytende eller morsmål)
            </p>
            <div className="space-y-2">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <div key={lang.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${lang.code}`}
                    checked={currentLanguages.includes(lang.code)}
                    onCheckedChange={() => toggleLanguage(lang.code)}
                  />
                  <Label htmlFor={`lang-${lang.code}`} className="text-sm font-normal">
                    {lang.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Qualification filters */}
          <div>
            <h4 className="font-medium mb-3">Kvalifikasjoner</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="certificates"
                  checked={requireCertificates}
                  onCheckedChange={(checked) =>
                    updateParams("sertifikater", checked ? "true" : "")
                  }
                />
                <Label htmlFor="certificates" className="text-sm font-normal">
                  Har verifiserte sertifikater
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="policecheck"
                  checked={requirePoliceCheck}
                  onCheckedChange={(checked) =>
                    updateParams("politiattest", checked ? "true" : "")
                  }
                />
                <Label htmlFor="policecheck" className="text-sm font-normal">
                  Har politiattest
                </Label>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter>
          {activeFilterCount > 0 && (
            <Button variant="outline" onClick={clearFilters}>
              Nullstill filtre
            </Button>
          )}
          <Button onClick={() => setSheetOpen(false)}>Bruk filtre</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center">
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
        {FilterSheet}
      </div>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentLanguages.map((code) => {
            const lang = AVAILABLE_LANGUAGES.find((l) => l.code === code);
            return lang ? (
              <Badge key={code} variant="secondary" className="gap-1">
                {lang.name}
                <button
                  onClick={() => toggleLanguage(code)}
                  className="ml-1 hover:text-destructive"
                  aria-label={`Fjern ${lang.name} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}
          {requireCertificates && (
            <Badge variant="secondary" className="gap-1">
              Verifiserte sertifikater
              <button
                onClick={() => updateParams("sertifikater", "")}
                className="ml-1 hover:text-destructive"
                aria-label="Fjern sertifikat-filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {requirePoliceCheck && (
            <Badge variant="secondary" className="gap-1">
              Politiattest
              <button
                onClick={() => updateParams("politiattest", "")}
                className="ml-1 hover:text-destructive"
                aria-label="Fjern politiattest-filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
            Fjern alle
          </Button>
        </div>
      )}
    </div>
  );
}
