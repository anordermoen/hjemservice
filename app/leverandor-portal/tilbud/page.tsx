import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/db/providers";
import { getOpenQuoteRequestsForProvider } from "@/lib/db/quotes";
import { getCategories } from "@/lib/db/categories";
import { ProviderQuotesClient } from "./ProviderQuotesClient";

export const metadata = {
  title: "Tilbudsforespørsler | Leverandørportalen | HjemService",
  description: "Se og svar på tilbudsforespørsler fra kunder.",
};

export default async function ProviderQuotesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/logg-inn?callbackUrl=/leverandor-portal/tilbud");
  }

  const provider = await getProviderByUserId(session.user.id);

  if (!provider) {
    redirect("/bli-leverandor");
  }

  const [requests, categories] = await Promise.all([
    getOpenQuoteRequestsForProvider(provider.id),
    getCategories(),
  ]);

  // Transform requests for client component
  const clientRequests = requests.map((r) => {
    const myResponse = r.responses.find((resp) => resp.providerId === provider.id);
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      categoryId: r.categoryId,
      createdAt: r.createdAt.toISOString(),
      expiresAt: r.expiresAt.toISOString(),
      photos: r.photos,
      preferredDates: r.preferredDates,
      answers: r.answers as Array<{ questionId: string; answer: string | number | string[] }>,
      address: {
        street: r.address.street,
        postalCode: r.address.postalCode,
        city: r.address.city,
      },
      hasResponded: !!myResponse,
      myResponse: myResponse
        ? {
            price: myResponse.price,
            status: myResponse.status,
            validUntil: myResponse.validUntil.toISOString(),
          }
        : null,
    };
  });

  const clientCategories = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    icon: c.icon,
  }));

  const providerCategoryNames = provider.categories.map((c) => c.name);

  return (
    <ProviderQuotesClient
      requests={clientRequests}
      categories={clientCategories}
      providerCategoryNames={providerCategoryNames}
      providerId={provider.id}
    />
  );
}
