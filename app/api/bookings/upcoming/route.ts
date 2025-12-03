import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBookingsByCustomerId } from "@/lib/db/bookings";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await getBookingsByCustomerId(session.user.id);

    // Filter to upcoming bookings (not completed or cancelled)
    const now = new Date();
    const upcomingBookings = bookings
      .filter(
        (b) =>
          (b.status === "PENDING" || b.status === "CONFIRMED") &&
          new Date(b.scheduledAt) > now
      )
      .map((booking) => ({
        id: booking.id,
        providerName: `${booking.provider.user.firstName} ${booking.provider.user.lastName}`,
        providerAvatar: booking.provider.user.avatarUrl,
        businessName: booking.provider.businessName,
        serviceName: booking.services.map((s) => s.name).join(", "),
        scheduledAt: booking.scheduledAt.toISOString(),
        address: `${booking.address.street}, ${booking.address.postalCode} ${booking.address.city}`,
        status: booking.status,
      }));

    return NextResponse.json({ bookings: upcomingBookings });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
