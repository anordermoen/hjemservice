"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, SlidersHorizontal, X, Star } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface AllProvidersFiltersProps {
  categories: Category[];
}

const AVAILABLE_LANGUAGES = [
  { code: "no", name: "Norsk" },
  { code: "en", name: "Engelsk" },
  { code: "pl", name: "Polsk" },
  { code: "sv", name: "Svensk" },
  { code: "da", name: "Dansk" },
  { code: "lt", name: "Litauisk" },
];

const DAYS_OF_WEEK = [
  { value: 1, label: "Man", fullName: "Mandag" },
  { value: 2, label: "Tir", fullName: "Tirsdag" },
  { value: 3, label: "Ons", fullName: "Onsdag" },
  { value: 4, label: "Tor", fullName: "Torsdag" },
  { value: 5, label: "Fre", fullName: "Fredag" },
  { value: 6, label: "Lør", fullName: "Lørdag" },
  { value: 0, label: "Søn", fullName: "Søndag" },
];

export function AllProvidersFilters({ categories }: AllProvidersFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const currentLocation = searchParams.get("sted") || "";
  const currentSort = searchParams.get("sorter") || "recommended";
  const currentCategory = searchParams.get("kategori") || "";
  const currentLanguages = searchParams.get("sprak")?.split(",").filter(Boolean) || [];
  const requireCertificates = searchParams.get("sertifikater") === "true";
  const requirePoliceCheck = searchParams.get("politiattest") === "true";
  const minPrice = searchParams.get("minPris") ? parseInt(searchParams.get("minPris")!) : undefined;
  const maxPrice = searchParams.get("maksPris") ? parseInt(searchParams.get("maksPris")!) : undefined;
  const minRating = searchParams.get("minVurdering") ? parseFloat(searchParams.get("minVurdering")!) : undefined;
  const availableDays = searchParams.get("dager")?.split(",").filter(Boolean).map(Number) || [];

  const activeFilterCount =
    currentLanguages.length +
    (requireCertificates ? 1 : 0) +
    (requirePoliceCheck ? 1 : 0) +
    (minPrice !== undefined ? 1 : 0) +
    (maxPrice !== undefined ? 1 : 0) +
    (minRating !== undefined ? 1 : 0) +
    availableDays.length;

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "recommended") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/leverandorer${params.toString() ? `?${params.toString()}` : ""}`);
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
    router.push(`/leverandorer${params.toString() ? `?${params.toString()}` : ""}`);
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

  const toggleDay = (day: number) => {
    const newDays = availableDays.includes(day)
      ? availableDays.filter((d) => d !== day)
      : [...availableDays, day];
    updateParams("dager", newDays.join(","));
  };

  const clearFilters = () => {
    updateMultipleParams({
      sprak: null,
      sertifikater: null,
      politiattest: null,
      minPris: null,
      maksPris: null,
      minVurdering: null,
      dager: null,
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

        <div className="py-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Price range filter */}
          <div>
            <h4 className="font-medium mb-3">Prisklasse</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Filtrer på pris per time
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="minPrice" className="text-xs text-muted-foreground">
                  Min (kr)
                </Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={minPrice ?? ""}
                  onChange={(e) => updateParams("minPris", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
                  Maks (kr)
                </Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="5000"
                  value={maxPrice ?? ""}
                  onChange={(e) => updateParams("maksPris", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Rating filter */}
          <div>
            <h4 className="font-medium mb-3">Minimum vurdering</h4>
            <div className="flex items-center gap-2">
              {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                <button
                  key={rating}
                  onClick={() =>
                    updateParams("minVurdering", minRating === rating ? "" : rating.toString())
                  }
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    minRating === rating
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:border-primary/50"
                  )}
                >
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {rating}+
                </button>
              ))}
            </div>
          </div>

          {/* Availability filter */}
          <div>
            <h4 className="font-medium mb-3">Tilgjengelig på</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Velg hvilke dager leverandøren må jobbe
            </p>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition-colors",
                    availableDays.includes(day.value)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:border-primary/50"
                  )}
                  title={day.fullName}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

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
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:flex-wrap">
          <Select
            value={currentCategory || "all"}
            onValueChange={(value) => updateParams("kategori", value)}
          >
            <SelectTrigger className="md:w-[180px]" aria-label="Velg kategori">
              <SelectValue placeholder="Alle kategorier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle kategorier</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.slug} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      {(activeFilterCount > 0 || currentCategory) && (
        <div className="flex flex-wrap gap-2">
          {currentCategory && (
            <Badge variant="secondary" className="gap-1">
              {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
              <button
                onClick={() => updateParams("kategori", "")}
                className="ml-1 hover:text-destructive"
                aria-label="Fjern kategori-filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {minPrice !== undefined && (
            <Badge variant="secondary" className="gap-1">
              Min {minPrice} kr
              <button
                onClick={() => updateParams("minPris", "")}
                className="ml-1 hover:text-destructive"
                aria-label="Fjern minimum pris filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {maxPrice !== undefined && (
            <Badge variant="secondary" className="gap-1">
              Maks {maxPrice} kr
              <button
                onClick={() => updateParams("maksPris", "")}
                className="ml-1 hover:text-destructive"
                aria-label="Fjern maksimum pris filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {minRating !== undefined && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 fill-current" />
              {minRating}+
              <button
                onClick={() => updateParams("minVurdering", "")}
                className="ml-1 hover:text-destructive"
                aria-label="Fjern vurdering filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {availableDays.map((day) => {
            const dayInfo = DAYS_OF_WEEK.find((d) => d.value === day);
            return dayInfo ? (
              <Badge key={day} variant="secondary" className="gap-1">
                {dayInfo.fullName}
                <button
                  onClick={() => toggleDay(day)}
                  className="ml-1 hover:text-destructive"
                  aria-label={`Fjern ${dayInfo.fullName} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}
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
          {(activeFilterCount > 0 || currentCategory) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearFilters();
                updateParams("kategori", "");
              }}
              className="h-6 text-xs"
            >
              Fjern alle
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
