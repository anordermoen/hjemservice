"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchForm() {
  const router = useRouter();
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) {
      params.set("sted", location.trim());
    }
    router.push(`/tjenester${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form onSubmit={handleSearch} className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="text"
          placeholder="Skriv inn postnummer eller sted"
          className="h-12 pl-10"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          aria-label="Søk etter sted eller postnummer"
        />
      </div>
      <Button type="submit" size="lg" className="h-12 w-full sm:w-auto">
        <Search className="mr-2 h-5 w-5" aria-hidden="true" />
        Finn tjenester
      </Button>
    </form>
  );
}
