"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Clock, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/lib/data/categories";
import { formatPrice } from "@/lib/utils";

// Service data per category with price ranges
const categoryData: Record<string, {
  minPrice: number;
  maxPrice: number;
  minDuration: number;
  maxDuration: number;
  defaultDuration: number;
  examples: string[];
}> = {
  frisor: {
    minPrice: 399,
    maxPrice: 1899,
    minDuration: 20,
    maxDuration: 120,
    defaultDuration: 45,
    examples: ["Herreklipp 549 kr", "Dameklipp 749 kr", "Klipp + farge 1899 kr"],
  },
  renhold: {
    minPrice: 999,
    maxPrice: 6499,
    minDuration: 60,
    maxDuration: 300,
    defaultDuration: 150,
    examples: ["Standard 999 kr", "Ukentlig 1199 kr", "Flyttevask 4999 kr"],
  },
  handverker: {
    minPrice: 599,
    maxPrice: 3499,
    minDuration: 30,
    maxDuration: 240,
    defaultDuration: 90,
    examples: ["IKEA-montering 599 kr", "TV-opphenging 1199 kr", "Maling 3499 kr"],
  },
  elektriker: {
    minPrice: 1299,
    maxPrice: 14999,
    minDuration: 30,
    maxDuration: 480,
    defaultDuration: 120,
    examples: ["Taklampe 1299 kr", "Stikkontakt 1899 kr", "Elbil-lader 8999 kr"],
  },
  rorlegger: {
    minPrice: 1499,
    maxPrice: 2499,
    minDuration: 30,
    maxDuration: 180,
    defaultDuration: 60,
    examples: ["Bytte kran 1499 kr", "Lekkasje 1899 kr", "Akutt 2499 kr"],
  },
  hage: {
    minPrice: 549,
    maxPrice: 3499,
    minDuration: 30,
    maxDuration: 240,
    defaultDuration: 90,
    examples: ["Plenklipping 599 kr", "Hekklipping 649 kr", "Vårklargjøring 3499 kr"],
  },
};

// Platform fee percentage
const PLATFORM_FEE = 0.15;

export function IncomeCalculator() {
  const [selectedCategory, setSelectedCategory] = useState("frisor");
  const [jobsPerWeek, setJobsPerWeek] = useState(12);
  const [avgPriceLevel, setAvgPriceLevel] = useState(50); // 0-100 slider for price range
  const [avgDuration, setAvgDuration] = useState(categoryData.frisor.defaultDuration);

  // Reset duration when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setAvgDuration(categoryData[category]?.defaultDuration || 60);
  };

  const calculations = useMemo(() => {
    const data = categoryData[selectedCategory];
    if (!data) return null;

    // Calculate average price based on price level slider
    const priceRange = data.maxPrice - data.minPrice;
    const avgPrice = Math.round(data.minPrice + (priceRange * avgPriceLevel / 100));

    // Calculate hours needed
    const hoursPerWeek = (jobsPerWeek * avgDuration) / 60;
    const hoursPerDay = hoursPerWeek / 5; // Assuming 5-day work week

    // Revenue calculations
    const weeklyGross = jobsPerWeek * avgPrice;
    const weeklyFee = weeklyGross * PLATFORM_FEE;
    const weeklyNet = weeklyGross - weeklyFee;

    const monthlyNet = weeklyNet * 4;
    const yearlyNet = monthlyNet * 12;

    // Hourly rate
    const hourlyRate = hoursPerWeek > 0 ? weeklyNet / hoursPerWeek : 0;

    return {
      avgPrice,
      hoursPerWeek: Math.round(hoursPerWeek * 10) / 10,
      hoursPerDay: Math.round(hoursPerDay * 10) / 10,
      weeklyGross,
      weeklyFee,
      weeklyNet,
      monthlyNet,
      yearlyNet,
      hourlyRate: Math.round(hourlyRate),
      avgDuration,
    };
  }, [selectedCategory, jobsPerWeek, avgPriceLevel, avgDuration]);

  const selectedCategoryData = categoryData[selectedCategory];
  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.name || "";

  return (
    <section className="py-16 bg-gradient-to-b from-primary/5 to-background" aria-labelledby="calculator-heading">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 id="calculator-heading" className="mb-2 text-2xl font-bold md:text-3xl">
              Hva kan du tjene?
            </h2>
            <p className="text-muted-foreground">
              Beregn din potensielle inntekt som leverandør på HjemService
            </p>
          </div>

          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Controls */}
                <div className="space-y-6">
                  {/* Category selector */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Hva tilbyr du?</Label>
                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue placeholder="Velg kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Jobs per week */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="jobs">Oppdrag per uke</Label>
                      <span className="text-lg font-semibold text-primary">
                        {jobsPerWeek} oppdrag
                      </span>
                    </div>
                    <Slider
                      id="jobs"
                      value={[jobsPerWeek]}
                      onValueChange={(value) => setJobsPerWeek(value[0])}
                      min={1}
                      max={30}
                      step={1}
                      className="w-full"
                      aria-label="Antall oppdrag per uke"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 oppdrag</span>
                      <span>30 oppdrag</span>
                    </div>
                  </div>

                  {/* Average price level */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="price">Gjennomsnittlig pris</Label>
                      <span className="text-lg font-semibold text-primary">
                        {formatPrice(calculations?.avgPrice || 0)}
                      </span>
                    </div>
                    <Slider
                      id="price"
                      value={[avgPriceLevel]}
                      onValueChange={(value) => setAvgPriceLevel(value[0])}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                      aria-label="Gjennomsnittlig pris per oppdrag"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatPrice(selectedCategoryData?.minPrice || 0)}</span>
                      <span>{formatPrice(selectedCategoryData?.maxPrice || 0)}</span>
                    </div>
                  </div>

                  {/* Average duration */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="duration">Tid per oppdrag</Label>
                      <span className="text-lg font-semibold text-primary">
                        {avgDuration >= 60
                          ? `${Math.floor(avgDuration / 60)}t ${avgDuration % 60 > 0 ? `${avgDuration % 60}min` : ''}`
                          : `${avgDuration} min`
                        }
                      </span>
                    </div>
                    <Slider
                      id="duration"
                      value={[avgDuration]}
                      onValueChange={(value) => setAvgDuration(value[0])}
                      min={selectedCategoryData?.minDuration || 20}
                      max={selectedCategoryData?.maxDuration || 120}
                      step={5}
                      className="w-full"
                      aria-label="Gjennomsnittlig tid per oppdrag"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{selectedCategoryData?.minDuration || 20} min</span>
                      <span>{(selectedCategoryData?.maxDuration || 120) >= 60
                        ? `${Math.floor((selectedCategoryData?.maxDuration || 120) / 60)}t ${(selectedCategoryData?.maxDuration || 120) % 60 > 0 ? `${(selectedCategoryData?.maxDuration || 120) % 60}min` : ''}`
                        : `${selectedCategoryData?.maxDuration || 120} min`
                      }</span>
                    </div>
                  </div>

                  {/* Price examples */}
                  <div className="rounded-lg bg-muted/60 p-4">
                    <p className="text-sm font-medium mb-2">Eksempelpriser for {selectedCategoryName.toLowerCase()}:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedCategoryData?.examples.map((example, i) => (
                        <li key={i}>• {example}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Time commitment info */}
                  <div className="flex items-center gap-4 p-3 rounded-lg border bg-background">
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <div className="text-sm">
                      <p className="font-medium">
                        {jobsPerWeek} oppdrag × {avgDuration} min = {calculations?.hoursPerWeek} timer/uke
                      </p>
                      <p className="text-muted-foreground">
                        ~{calculations?.hoursPerDay} timer per dag (5 dager)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-6">
                  {/* Monthly highlight */}
                  <div className="rounded-xl bg-primary p-6 text-primary-foreground">
                    <p className="text-sm opacity-90 mb-1">Estimert månedsinntekt</p>
                    <p className="text-4xl font-bold">
                      {formatPrice(calculations?.monthlyNet || 0)}
                    </p>
                    <p className="text-sm opacity-75 mt-2">
                      Utbetalt etter 15% plattformgebyr
                    </p>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-sm">{jobsPerWeek} oppdrag × {formatPrice(calculations?.avgPrice || 0)}</span>
                      </div>
                      <span className="font-medium">{formatPrice(calculations?.weeklyGross || 0)}/uke</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Plattformgebyr (15%)</span>
                      <span className="text-muted-foreground">-{formatPrice(calculations?.weeklyFee || 0)}</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-medium">Utbetalt per uke</span>
                      <span className="font-semibold text-primary">{formatPrice(calculations?.weeklyNet || 0)}</span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" aria-hidden="true" />
                        <span className="text-sm">Årlig utbetaling</span>
                      </div>
                      <span className="font-semibold text-green-600">
                        {formatPrice(calculations?.yearlyNet || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Hourly rate */}
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-800">Effektiv timepris</span>
                      <span className="text-xl font-bold text-green-700">
                        {formatPrice(calculations?.hourlyRate || 0)}/time
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Basert på {calculations?.hoursPerWeek} timer arbeid per uke
                    </p>
                  </div>

                  {/* Tax notice */}
                  <p className="text-xs text-muted-foreground text-center bg-muted/50 rounded-lg p-3">
                    * Alle beløp er før skatt. Du er selv ansvarlig for å betale skatt av inntekten din.
                  </p>

                  {/* CTA */}
                  <Link href="/bli-leverandor" className="block">
                    <Button size="lg" className="w-full">
                      Bli leverandør i dag
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Button>
                  </Link>

                  <p className="text-xs text-center text-muted-foreground">
                    Gratis å registrere seg. Du betaler kun når du får oppdrag.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
