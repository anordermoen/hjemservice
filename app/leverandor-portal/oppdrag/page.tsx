import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/db/providers";
import { getBookingsByProviderId } from "@/lib/db/bookings";
import { ProviderBookingsClient } from "./ProviderBookingsClient";

export const metadata = {
  title: "Oppdrag | Leverandørportalen | HjemService",
  description: "Administrer dine oppdrag og bestillinger.",
};

export default async function ProviderBookingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/logg-inn?callbackUrl=/leverandor-portal/oppdrag");
  }

  const provider = await getProviderByUserId(session.user.id);

  if (!provider) {
    redirect("/bli-leverandor");
  }

  const bookings = await getBookingsByProviderId(provider.id);

  // Transform for client component
  const clientBookings = bookings.map((b) => ({
    id: b.id,
    status: b.status,
    scheduledAt: b.scheduledAt.toISOString(),
    totalPrice: b.totalPrice,
    providerPayout: b.providerPayout,
    recipientName: b.recipientName,
    recipientPhone: b.recipientPhone,
    notes: b.notes,
    services: b.services.map((s) => ({
      name: s.name,
      price: s.price,
      duration: s.duration,
    })),
    address: b.address
      ? {
          street: b.address.street,
          postalCode: b.address.postalCode,
          city: b.address.city,
          floor: b.address.floor,
          entryCode: b.address.entryCode,
          instructions: b.address.instructions,
        }
      : null,
    cancellation: b.cancellation
      ? {
          cancelledBy: b.cancellation.cancelledBy,
          reason: b.cancellation.reason,
          wasWithin24Hours: b.cancellation.wasWithin24Hours,
          cancellationFee: b.cancellation.cancellationFee,
          feeRefunded: b.cancellation.feeRefunded,
        }
      : null,
  }));

  return <ProviderBookingsClient bookings={clientBookings} />;
}
