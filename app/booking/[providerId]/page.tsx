import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProviderById, getProviders } from "@/lib/db/providers";
import { getCustomerProfile } from "@/lib/db/users";
import { getProviderBlockedDates } from "@/lib/db/availability";
import { BookingClient } from "./BookingClient";

interface BookingPageProps {
  params: Promise<{
    providerId: string;
  }>;
}

export async function generateStaticParams() {
  const providers = await getProviders();
  return providers.map((provider) => ({
    providerId: provider.id,
  }));
}

export async function generateMetadata({ params }: BookingPageProps) {
  const { providerId } = await params;
  const provider = await getProviderById(providerId);

  if (!provider) {
    return {
      title: "Booking | HjemService",
    };
  }

  return {
    title: `Book ${provider.user.firstName} ${provider.user.lastName} | HjemService`,
    description: `Book tid hos ${provider.user.firstName} ${provider.user.lastName}`,
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { providerId } = await params;
  const [provider, session, blockedDates] = await Promise.all([
    getProviderById(providerId),
    auth(),
    getProviderBlockedDates(providerId),
  ]);

  if (!provider) {
    notFound();
  }

  // Fetch user profile if logged in
  const customerProfile = session?.user?.id
    ? await getCustomerProfile(session.user.id)
    : null;

  // Transform blocked dates to date strings
  const blockedDateStrings = blockedDates.map((bd) =>
    bd.date.toISOString().split("T")[0]
  );

  // Transform to the shape expected by BookingClient
  const clientProvider = {
    id: provider.id,
    businessName: provider.businessName,
    rating: provider.rating,
    reviewCount: provider.reviewCount,
    verified: provider.verified,
    insurance: provider.insurance,
    policeCheck: provider.policeCheck,
    user: {
      firstName: provider.user.firstName,
      lastName: provider.user.lastName,
      avatarUrl: provider.user.avatarUrl,
    },
    services: provider.services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.price,
      duration: s.duration,
    })),
    languages: provider.languages.map((l) => ({
      code: l.code,
      name: l.name,
      proficiency: l.proficiency,
    })),
    availability: provider.availability.map((a) => ({
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
    })),
  };

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

  return (
    <BookingClient
      provider={clientProvider}
      userProfile={userProfile}
      blockedDates={blockedDateStrings}
    />
  );
}
