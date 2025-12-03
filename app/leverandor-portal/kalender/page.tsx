import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/db/providers";
import { getBookingsByProviderId } from "@/lib/db/bookings";
import { ProviderCalendarClient } from "./ProviderCalendarClient";
import { formatTime } from "@/lib/utils";

export const metadata = {
  title: "Kalender | Leverandørportal | HjemService",
  description: "Se og administrer dine avtaler.",
};

export default async function CalendarPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/logg-inn?callbackUrl=/leverandor-portal/kalender");
  }

  const provider = await getProviderByUserId(session.user.id);

  if (!provider) {
    redirect("/bli-leverandor");
  }

  const bookings = await getBookingsByProviderId(provider.id);

  // Transform bookings into calendar format
  const bookingsByDate: Record<string, Array<{
    id: string;
    time: string;
    customerName: string;
    service: string;
    address: string;
    status: "confirmed" | "pending";
  }>> = {};

  for (const booking of bookings) {
    // Only show confirmed and pending bookings
    if (booking.status !== "CONFIRMED" && booking.status !== "PENDING") {
      continue;
    }

    const dateKey = booking.scheduledAt.toISOString().split("T")[0];

    if (!bookingsByDate[dateKey]) {
      bookingsByDate[dateKey] = [];
    }

    const customerName = booking.recipientName ||
      `${booking.customer.firstName} ${booking.customer.lastName}`;

    const address = booking.address
      ? `${booking.address.street}, ${booking.address.postalCode} ${booking.address.city}`
      : "Ingen adresse";

    bookingsByDate[dateKey].push({
      id: booking.id,
      time: formatTime(booking.scheduledAt),
      customerName,
      service: booking.services.map((s) => s.name).join(", "),
      address,
      status: booking.status === "CONFIRMED" ? "confirmed" : "pending",
    });
  }

  // Sort appointments by time for each day
  for (const dateKey in bookingsByDate) {
    bookingsByDate[dateKey].sort((a, b) => a.time.localeCompare(b.time));
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <ProviderCalendarClient
      bookings={bookingsByDate}
      initialDate={today}
    />
  );
}
