import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getCategoryBySlug } from "@/lib/db/categories";
import { getProvidersByCategory } from "@/lib/db/providers";
import { getQuestionsForCategory } from "@/lib/data/quote-questions";
import { QuoteRequestClient } from "./QuoteRequestClient";

interface QuoteRequestPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: QuoteRequestPageProps) {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    return { title: "Kategori ikke funnet | HjemService" };
  }

  return {
    title: `Be om tilbud - ${category.name} | HjemService`,
    description: `Send en prisforespørsel til ${category.name.toLowerCase()}-leverandører og motta tilbud.`,
  };
}

export default async function QuoteRequestPage({ params }: QuoteRequestPageProps) {
  const { category: categorySlug } = await params;

  const [category, session] = await Promise.all([
    getCategoryBySlug(categorySlug),
    auth(),
  ]);

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Kategori ikke funnet</h1>
        <Link href="/tjenester">
          <Button>Tilbake til tjenester</Button>
        </Link>
      </div>
    );
  }

  const providers = await getProvidersByCategory(categorySlug);
  const questions = getQuestionsForCategory(category.id);

  // Transform providers for client component
  const clientProviders = providers.map((p) => ({
    id: p.id,
    userId: p.userId,
    businessName: p.businessName,
    rating: p.rating,
    reviewCount: p.reviewCount,
    yearsExperience: p.yearsExperience,
    verified: p.verified,
    policeCheck: p.policeCheck,
    insurance: p.insurance,
    user: {
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      avatarUrl: p.user.avatarUrl,
    },
    languages: p.languages.map((l) => ({
      name: l.name,
      proficiency: l.proficiency,
    })),
  }));

  const clientCategory = {
    id: category.id,
    slug: category.slug,
    name: category.name,
    icon: category.icon,
  };

  return (
    <QuoteRequestClient
      category={clientCategory}
      providers={clientProviders}
      questions={questions}
      isLoggedIn={!!session?.user}
    />
  );
}
