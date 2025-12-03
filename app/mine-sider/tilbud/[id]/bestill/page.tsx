import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getQuoteRequestById } from "@/lib/db/quotes";
import { getCategoryById } from "@/lib/db/categories";
import { getCustomerProfile } from "@/lib/db/users";
import { BookQuoteClient } from "./BookQuoteClient";

interface BookingCompletionPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Fullfør bestilling | HjemService",
  description: "Fullfør bestillingen av akseptert tilbud.",
};

export default async function BookingCompletionPage({ params }: BookingCompletionPageProps) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) {
    redirect(`/logg-inn?callbackUrl=/mine-sider/tilbud/${id}/bestill`);
  }

  const quoteRequest = await getQuoteRequestById(id);

  // Check if quote request exists and belongs to user
  if (!quoteRequest) {
    notFound();
  }

  if (quoteRequest.customerId !== session.user.id) {
    redirect("/mine-sider/tilbud");
  }

  // Find the accepted response
  const acceptedResponse = quoteRequest.responses.find((r) => r.status === "ACCEPTED");

  if (!acceptedResponse || quoteRequest.status !== "ACCEPTED") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-bold mb-2">Tilbud ikke funnet</h1>
            <p className="text-muted-foreground mb-4">
              Dette tilbudet finnes ikke eller har ikke blitt akseptert ennå.
            </p>
            <Link href="/mine-sider/tilbud">
              <Button>Tilbake til mine tilbud</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const provider = acceptedResponse.provider;
  const [category, customerProfile] = await Promise.all([
    getCategoryById(quoteRequest.categoryId),
    getCustomerProfile(session.user.id),
  ]);

  if (!category) {
    notFound();
  }

  // Transform user profile for client
  const userProfile = customerProfile
    ? {
        firstName: customerProfile.user.firstName,
        lastName: customerProfile.user.lastName,
        phone: customerProfile.user.phone,
        email: customerProfile.user.email,
        addresses: customerProfile.addresses.map((a) => ({
          id: a.id,
          label: a.label,
          street: a.street,
          postalCode: a.postalCode,
          city: a.city,
          floor: a.floor,
          entryCode: a.entryCode,
          instructions: a.instructions,
        })),
      }
    : null;

  // Transform data for client component
  const clientQuoteRequest = {
    id: quoteRequest.id,
    title: quoteRequest.title,
    address: {
      street: quoteRequest.address.street,
      postalCode: quoteRequest.address.postalCode,
      city: quoteRequest.address.city,
    },
  };

  const clientAcceptedResponse = {
    id: acceptedResponse.id,
    price: acceptedResponse.price,
    estimatedDuration: acceptedResponse.estimatedDuration,
    materialsIncluded: acceptedResponse.materialsIncluded,
  };

  const clientProvider = {
    id: provider.id,
    userId: provider.userId,
    businessName: provider.businessName,
    rating: provider.rating,
    reviewCount: provider.reviewCount,
    verified: provider.verified,
    policeCheck: provider.policeCheck,
    insurance: provider.insurance,
    user: {
      firstName: provider.user.firstName,
      lastName: provider.user.lastName,
      avatarUrl: provider.user.avatarUrl,
    },
    languages: provider.languages?.map((l) => ({
      name: l.name,
      proficiency: l.proficiency,
    })) || [],
  };

  const clientCategory = {
    id: category.id,
    slug: category.slug,
    name: category.name,
    icon: category.icon,
  };

  return (
    <BookQuoteClient
      quoteRequest={clientQuoteRequest}
      acceptedResponse={clientAcceptedResponse}
      provider={clientProvider}
      category={clientCategory}
      userProfile={userProfile}
    />
  );
}
