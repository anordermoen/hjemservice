import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileQuestion, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryById, categories } from "@/lib/data/categories";
import { getProvidersByCategory } from "@/lib/data/providers";
import { ProviderFilters } from "@/components/providers/ProviderFilters";
import { ProviderList } from "@/components/providers/ProviderList";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    category: category.id,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category: categoryId } = await params;
  const category = getCategoryById(categoryId);

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
  const { category: categoryId } = await params;
  const category = getCategoryById(categoryId);

  if (!category) {
    notFound();
  }

  const providers = getProvidersByCategory(categoryId);

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
            <Link href={`/tilbud/${categoryId}`}>
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
        <ProviderFilters categoryId={categoryId} />
      </Suspense>

      {/* Provider list */}
      <Suspense fallback={<div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />)}</div>}>
        <ProviderList providers={providers} />
      </Suspense>
    </div>
  );
}
