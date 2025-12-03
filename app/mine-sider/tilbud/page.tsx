import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getQuoteRequestsByCustomerId } from "@/lib/db/quotes";
import { getCategories } from "@/lib/db/categories";
import { CustomerQuotesClient } from "./CustomerQuotesClient";

export const metadata = {
  title: "Mine tilbudsforespørsler | HjemService",
  description: "Se og administrer dine tilbudsforespørsler.",
};

export default async function CustomerQuotesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/logg-inn?callbackUrl=/mine-sider/tilbud");
  }

  const [requests, categories] = await Promise.all([
    getQuoteRequestsByCustomerId(session.user.id),
    getCategories(),
  ]);

  // Transform for client component
  const clientRequests = requests.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    expiresAt: r.expiresAt.toISOString(),
    categoryId: r.categoryId,
    categoryName: r.category.name,
    categoryIcon: r.category.icon,
    categorySlug: r.category.slug,
    address: r.address
      ? {
          city: r.address.city,
          street: r.address.street,
          postalCode: r.address.postalCode,
        }
      : null,
    answers: r.answers as Array<{ questionId: string; answer: string | number | string[] }>,
    responses: r.responses.map((resp) => ({
      id: resp.id,
      price: resp.price,
      estimatedDuration: resp.estimatedDuration,
      message: resp.message,
      status: resp.status,
      materialsIncluded: resp.materialsIncluded,
      validUntil: resp.validUntil.toISOString(),
      createdAt: resp.createdAt.toISOString(),
      provider: resp.provider
        ? {
            id: resp.provider.id,
            businessName: resp.provider.businessName,
            rating: resp.provider.rating,
            reviewCount: resp.provider.reviewCount,
            verified: resp.provider.verified,
            insurance: resp.provider.insurance,
            policeCheck: resp.provider.policeCheck,
            yearsExperience: resp.provider.yearsExperience,
            user: {
              firstName: resp.provider.user.firstName,
              lastName: resp.provider.user.lastName,
              avatarUrl: resp.provider.user.avatarUrl,
            },
          }
        : null,
    })),
  }));

  const clientCategories = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    icon: c.icon,
  }));

  return (
    <CustomerQuotesClient
      requests={clientRequests}
      categories={clientCategories}
    />
  );
}
