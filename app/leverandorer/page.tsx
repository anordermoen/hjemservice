import { Suspense } from "react";
import { getProviders } from "@/lib/db/providers";
import { getCategories } from "@/lib/db/categories";
import { AllProvidersFilters } from "@/components/providers/AllProvidersFilters";
import { AllProvidersList } from "@/components/providers/AllProvidersList";

export const metadata = {
  title: "Alle leverandører | HjemService",
  description: "Finn og sammenlign alle verifiserte leverandører av hjemmetjenester i Norge.",
};

export default async function LeverandorerPage() {
  const [dbProviders, categories] = await Promise.all([
    getProviders(),
    getCategories(),
  ]);

  // Transform providers to match expected format
  const providers = dbProviders.map((p) => ({
    userId: p.id,
    businessName: p.businessName,
    bio: p.bio,
    categories: p.categories.map((c) => c.slug),
    services: p.services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration,
      category: s.categoryId,
      description: s.description || undefined,
    })),
    areasServed: p.areasServed,
    rating: p.rating,
    reviewCount: p.reviewCount,
    verified: p.verified,
    insurance: p.insurance,
    policeCheck: p.policeCheck,
    yearsExperience: p.yearsExperience,
    availability: {
      schedule: {
        monday: p.availability.filter((a) => a.dayOfWeek === 1).map((a) => ({ start: a.startTime, end: a.endTime })),
        tuesday: p.availability.filter((a) => a.dayOfWeek === 2).map((a) => ({ start: a.startTime, end: a.endTime })),
        wednesday: p.availability.filter((a) => a.dayOfWeek === 3).map((a) => ({ start: a.startTime, end: a.endTime })),
        thursday: p.availability.filter((a) => a.dayOfWeek === 4).map((a) => ({ start: a.startTime, end: a.endTime })),
        friday: p.availability.filter((a) => a.dayOfWeek === 5).map((a) => ({ start: a.startTime, end: a.endTime })),
        saturday: p.availability.filter((a) => a.dayOfWeek === 6).map((a) => ({ start: a.startTime, end: a.endTime })),
        sunday: p.availability.filter((a) => a.dayOfWeek === 0).map((a) => ({ start: a.startTime, end: a.endTime })),
      },
      blockedDates: p.blockedDates,
      leadTime: p.leadTime,
    },
    createdAt: p.createdAt,
    approvedAt: p.approvedAt || undefined,
    user: {
      id: p.user.id,
      email: p.user.email,
      phone: p.user.phone || "",
      firstName: p.user.firstName || "",
      lastName: p.user.lastName || "",
      role: "provider" as const,
      createdAt: p.user.createdAt,
      avatarUrl: p.user.avatarUrl || undefined,
    },
    languages: p.languages.map((l) => ({
      code: l.code,
      name: l.name,
      proficiency: l.proficiency as "morsmål" | "flytende" | "god" | "grunnleggende",
    })),
    certificates: p.certificates?.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      year: c.year,
      verified: c.verified,
      expiresAt: c.expiresAt || undefined,
    })),
    nationality: p.nationality || undefined,
    education: p.education || undefined,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Alle leverandører</h1>
        <p className="text-muted-foreground">
          Finn verifiserte fagfolk for hjemmetjenester i ditt område
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="mb-6 h-16 animate-pulse rounded-lg bg-muted" />}>
        <AllProvidersFilters categories={categories} />
      </Suspense>

      {/* Provider list */}
      <Suspense fallback={<div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />)}</div>}>
        <AllProvidersList providers={providers} categories={categories} />
      </Suspense>
    </div>
  );
}
