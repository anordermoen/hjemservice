"use server";

import { auth } from "@/lib/auth";
import { createReview as dbCreateReview, getReviewByBookingId } from "@/lib/db/reviews";
import { getBookingById } from "@/lib/db/bookings";
import { revalidatePath } from "next/cache";

// Simpler version for client components
export async function submitReview(
  bookingId: string,
  rating: number,
  comment: string
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Du må være logget inn for å skrive en anmeldelse" };
  }

  if (!bookingId || !rating) {
    return { error: "Mangler påkrevd informasjon" };
  }

  if (rating < 1 || rating > 5) {
    return { error: "Vurdering må være mellom 1 og 5" };
  }

  // Get booking to verify ownership and status
  const booking = await getBookingById(bookingId);
  if (!booking) {
    return { error: "Bestilling ikke funnet" };
  }

  if (booking.customerId !== session.user.id) {
    return { error: "Du kan bare anmelde dine egne bestillinger" };
  }

  if (booking.status !== "COMPLETED") {
    return { error: "Du kan bare anmelde fullførte bestillinger" };
  }

  // Check if review already exists
  const existingReview = await getReviewByBookingId(bookingId);
  if (existingReview) {
    return { error: "Du har allerede anmeldt denne bestillingen" };
  }

  try {
    await dbCreateReview({
      bookingId,
      customerId: session.user.id,
      providerId: booking.providerId,
      rating,
      comment: comment || undefined,
      customerName: session.user.name || "Anonym",
    });

    revalidatePath("/mine-sider");
    revalidatePath(`/leverandor/${booking.providerId}`);

    return { success: true };
  } catch (error) {
    console.error("Review creation error:", error);
    return { error: "Kunne ikke lagre anmeldelsen. Prøv igjen." };
  }
}

// Original FormData-based version
export async function createReview(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Du må være logget inn for å skrive en anmeldelse" };
  }

  const bookingId = formData.get("bookingId") as string;
  const rating = parseInt(formData.get("rating") as string);
  const comment = formData.get("comment") as string;

  if (!bookingId || !rating) {
    return { error: "Mangler påkrevd informasjon" };
  }

  if (rating < 1 || rating > 5) {
    return { error: "Vurdering må være mellom 1 og 5" };
  }

  // Get booking to verify ownership and status
  const booking = await getBookingById(bookingId);
  if (!booking) {
    return { error: "Bestilling ikke funnet" };
  }

  if (booking.customerId !== session.user.id) {
    return { error: "Du kan bare anmelde dine egne bestillinger" };
  }

  if (booking.status !== "COMPLETED") {
    return { error: "Du kan bare anmelde fullførte bestillinger" };
  }

  // Check if review already exists
  const existingReview = await getReviewByBookingId(bookingId);
  if (existingReview) {
    return { error: "Du har allerede anmeldt denne bestillingen" };
  }

  try {
    await dbCreateReview({
      bookingId,
      customerId: session.user.id,
      providerId: booking.providerId,
      rating,
      comment: comment || undefined,
      customerName: session.user.name || "Anonym",
    });

    revalidatePath("/mine-sider");
    revalidatePath(`/leverandor/${booking.providerId}`);

    return { success: true };
  } catch (error) {
    console.error("Review creation error:", error);
    return { error: "Kunne ikke lagre anmeldelsen. Prøv igjen." };
  }
}
