"use server";

import { auth } from "@/lib/auth";
import {
  createBooking as dbCreateBooking,
  confirmBooking as dbConfirmBooking,
  completeBooking as dbCompleteBooking,
  cancelBooking as dbCancelBooking,
  getBookingById,
} from "@/lib/db/bookings";
import { addAddress } from "@/lib/db/users";
import { PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";

// New simplified booking submission for client components
interface SubmitBookingData {
  providerId: string;
  services: Array<{
    serviceId: string;
    name: string;
    price: number;
    duration: number;
  }>;
  scheduledDate: string;
  scheduledTime: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    floor?: string;
    entryCode?: string;
    instructions?: string;
  };
  savedAddressId?: string | null;
  name: string;
  phone: string;
  recipientName?: string;
  recipientPhone?: string;
  notes?: string;
  paymentMethod: "vipps" | "card";
  bookingForOther: boolean;
}

export async function submitBooking(data: SubmitBookingData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Du må være logget inn for å bestille" };
  }

  try {
    // Create or use address
    let addressId = data.savedAddressId;

    if (!addressId) {
      // Create new address
      const newAddress = await addAddress(session.user.id, {
        label: `${data.address.street}, ${data.address.city}`,
        street: data.address.street,
        postalCode: data.address.postalCode,
        city: data.address.city,
        floor: data.address.floor,
        entryCode: data.address.entryCode,
        instructions: data.address.instructions,
      });
      addressId = newAddress.id;
    }

    // Parse scheduled date and time
    const [year, month, day] = data.scheduledDate.split("-").map(Number);
    const [hours, minutes] = data.scheduledTime.split(":").map(Number);
    const scheduledAt = new Date(year, month - 1, day, hours, minutes);

    // Create the booking
    const booking = await dbCreateBooking({
      customerId: session.user.id,
      providerId: data.providerId,
      addressId,
      recipientName: data.bookingForOther ? data.recipientName : data.name,
      recipientPhone: data.bookingForOther ? data.recipientPhone : data.phone,
      notes: data.notes,
      scheduledAt,
      services: data.services,
      paymentMethod: data.paymentMethod === "vipps" ? PaymentMethod.VIPPS : PaymentMethod.CARD,
    });

    // In a real app, we would integrate with payment provider here
    // For demo, auto-confirm the booking
    await dbConfirmBooking(booking.id);

    // Revalidate relevant pages
    revalidatePath("/mine-sider/bestillinger");
    revalidatePath("/leverandor-portal/oppdrag");

    return { success: true, bookingId: booking.id };
  } catch (error) {
    console.error("Booking creation error:", error);
    return { success: false, error: "Kunne ikke opprette bestilling. Prøv igjen." };
  }
}

export async function createBooking(
  prevState: { error?: string; bookingId?: string } | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Du må være logget inn for å bestille" };
  }

  const providerId = formData.get("providerId") as string;
  const addressId = formData.get("addressId") as string;
  const scheduledAt = formData.get("scheduledAt") as string;
  const servicesJson = formData.get("services") as string;
  const paymentMethod = formData.get("paymentMethod") as PaymentMethod;
  const recipientName = formData.get("recipientName") as string;
  const recipientPhone = formData.get("recipientPhone") as string;
  const notes = formData.get("notes") as string;

  if (!providerId || !addressId || !scheduledAt || !servicesJson) {
    return { error: "Mangler påkrevd informasjon" };
  }

  let services;
  try {
    services = JSON.parse(servicesJson);
  } catch {
    return { error: "Ugyldig tjeneste-data" };
  }

  try {
    const booking = await dbCreateBooking({
      customerId: session.user.id,
      providerId,
      addressId,
      scheduledAt: new Date(scheduledAt),
      services,
      paymentMethod: paymentMethod || PaymentMethod.VIPPS,
      recipientName: recipientName || undefined,
      recipientPhone: recipientPhone || undefined,
      notes: notes || undefined,
    });

    revalidatePath("/mine-sider");
    revalidatePath("/leverandor-portal");

    return { bookingId: booking.id };
  } catch (error) {
    console.error("Booking creation error:", error);
    return { error: "Kunne ikke opprette bestilling. Prøv igjen." };
  }
}

export async function confirmBooking(bookingId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Ikke autorisert" };
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    return { error: "Bestilling ikke funnet" };
  }

  // Only provider can confirm
  if (booking.provider.userId !== session.user.id) {
    return { error: "Kun leverandør kan bekrefte bestillinger" };
  }

  try {
    await dbConfirmBooking(bookingId);
    revalidatePath("/mine-sider");
    revalidatePath("/leverandor-portal");
    return { success: true };
  } catch (error) {
    console.error("Confirm booking error:", error);
    return { error: "Kunne ikke bekrefte bestilling" };
  }
}

export async function completeBooking(bookingId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Ikke autorisert" };
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    return { error: "Bestilling ikke funnet" };
  }

  // Only provider can complete
  if (booking.provider.userId !== session.user.id) {
    return { error: "Kun leverandør kan fullføre bestillinger" };
  }

  try {
    await dbCompleteBooking(bookingId);
    revalidatePath("/mine-sider");
    revalidatePath("/leverandor-portal");
    return { success: true };
  } catch (error) {
    console.error("Complete booking error:", error);
    return { error: "Kunne ikke fullføre bestilling" };
  }
}

export async function cancelBooking(
  bookingId: string,
  reason?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Ikke autorisert" };
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    return { error: "Bestilling ikke funnet" };
  }

  // Determine who is cancelling
  let cancelledBy: "customer" | "provider";
  if (booking.customerId === session.user.id) {
    cancelledBy = "customer";
  } else if (booking.provider.userId === session.user.id) {
    cancelledBy = "provider";
  } else {
    return { error: "Du har ikke tilgang til å kansellere denne bestillingen" };
  }

  try {
    const result = await dbCancelBooking(bookingId, cancelledBy, reason);
    revalidatePath("/mine-sider");
    revalidatePath("/leverandor-portal");

    return {
      success: true,
      cancellationFee: result.cancellation?.cancellationFee || 0,
    };
  } catch (error) {
    console.error("Cancel booking error:", error);
    return { error: "Kunne ikke kansellere bestilling" };
  }
}
