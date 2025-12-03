import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBookingById, calculateCancellationFee } from "@/lib/db/bookings";
import { CancelBookingClient } from "./CancelBookingClient";

interface CancelBookingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CancelBookingPage({ params }: CancelBookingPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/logg-inn?callbackUrl=/mine-sider/bestillinger");
  }

  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) {
    notFound();
  }

  // Check if user owns this booking
  if (booking.customerId !== session.user.id) {
    notFound();
  }

  if (booking.status !== "CONFIRMED") {
    redirect("/mine-sider/bestillinger");
  }

  const now = new Date();
  const hoursUntilBooking =
    (booking.scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  const within24Hours = hoursUntilBooking < 24;
  const cancellationFee = calculateCancellationFee(booking.scheduledAt, booking.totalPrice);

  // Transform for client component
  const clientBooking = {
    id: booking.id,
    totalPrice: booking.totalPrice,
    scheduledAt: booking.scheduledAt,
    paymentMethod: booking.paymentMethod,
    services: booking.services.map((s) => ({
      name: s.name,
      price: s.price,
    })),
    address: booking.address
      ? {
          street: booking.address.street,
          postalCode: booking.address.postalCode,
          city: booking.address.city,
        }
      : null,
    provider: {
      id: booking.provider.id,
      businessName: booking.provider.businessName,
      rating: booking.provider.rating,
      reviewCount: booking.provider.reviewCount,
      verified: booking.provider.verified,
      user: {
        firstName: booking.provider.user.firstName,
        lastName: booking.provider.user.lastName,
        avatarUrl: booking.provider.user.avatarUrl,
      },
    },
  };

  return (
    <CancelBookingClient
      booking={clientBooking}
      cancellationFee={cancellationFee}
      within24Hours={within24Hours}
    />
  );
}
