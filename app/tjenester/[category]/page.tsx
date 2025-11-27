import { Suspense } from "react";
import { notFound } from "next/navigation";
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
