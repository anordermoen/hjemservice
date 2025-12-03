import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileQuestion, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryBySlug, getCategories } from "@/lib/db/categories";
import { getProvidersByCategory } from "@/lib/db/providers";
import { ProviderFilters } from "@/components/providers/ProviderFilters";
import { ProviderList } from "@/components/providers/ProviderList";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({
    category: category.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: "Kategori ikke funnet | HjemService",
    };
  }

  return {
    title: `${category.name} | HjemService`,
    description: `Finn ${category.name.toLowerCase()} som kommer hjem til deg. ${category.description}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const dbProviders = await getProvidersByCategory(categorySlug);

  // Transform to match ProviderList expected format
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
      category: categorySlug,
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
        <h1 className="mb-2 text-3xl font-bold">{category.name}</h1>
        <p className="text-muted-foreground">{category.description}</p>
      </div>

      {/* Request quote CTA */}
      <Card className="mb-8 bg-primary/5 border-primary/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <FileQuestion className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Trenger du et tilbud først?</h3>
                <p className="text-sm text-muted-foreground">
                  Beskriv jobben og motta tilbud fra flere leverandører
                </p>
              </div>
            </div>
            <Link href={`/tilbud/${categorySlug}`}>
              <Button>
                Be om tilbud
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Suspense fallback={<div className="mb-6 h-16 animate-pulse rounded-lg bg-muted" />}>
        <ProviderFilters categoryId={categorySlug} />
      </Suspense>

      {/* Provider list */}
      <Suspense fallback={<div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />)}</div>}>
        <ProviderList providers={providers} />
      </Suspense>
    </div>
  );
}
