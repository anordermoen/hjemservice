import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addAddress } from "@/lib/db/users";
import { createBooking, confirmBooking } from "@/lib/db/bookings";
import { PaymentMethod } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Du må være logget inn for å bestille" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      quoteResponseId,
      scheduledDate,
      scheduledTime,
      address,
      recipientName,
      recipientPhone,
      notes,
      paymentMethod,
    } = body;

    // Validate required fields
    if (!quoteResponseId || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: "Mangler påkrevd informasjon" },
        { status: 400 }
      );
    }

    // Get the quote response with related data
    const quoteResponse = await prisma.quoteResponse.findUnique({
      where: { id: quoteResponseId },
      include: {
        quoteRequest: {
          include: {
            address: true,
          },
        },
        provider: true,
      },
    });

    if (!quoteResponse) {
      return NextResponse.json(
        { error: "Tilbud ikke funnet" },
        { status: 404 }
      );
    }

    // Verify the quote belongs to this user
    if (quoteResponse.quoteRequest.customerId !== session.user.id) {
      return NextResponse.json(
        { error: "Du har ikke tilgang til dette tilbudet" },
        { status: 403 }
      );
    }

    // Verify the quote is accepted
    if (quoteResponse.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Dette tilbudet er ikke akseptert" },
        { status: 400 }
      );
    }

    // Create or use address
    let addressId: string;

    if (address && address.street && address.postalCode && address.city) {
      // Use provided address (might be different from quote request address)
      const newAddress = await addAddress(session.user.id, {
        label: `Bestilling - ${quoteResponse.quoteRequest.title}`,
        street: address.street,
        postalCode: address.postalCode,
        city: address.city,
        floor: address.floor,
        entryCode: address.entryCode,
        instructions: address.instructions,
      });
      addressId = newAddress.id;
    } else {
      // Use the original quote request address
      addressId = quoteResponse.quoteRequest.addressId;
    }

    // Parse scheduled date and time
    const [year, month, day] = scheduledDate.split("-").map(Number);
    const [hours, minutes] = scheduledTime.split(":").map(Number);
    const scheduledAt = new Date(year, month - 1, day, hours, minutes);

    // Create the booking
    const booking = await createBooking({
      customerId: session.user.id,
      providerId: quoteResponse.providerId,
      addressId,
      recipientName: recipientName || undefined,
      recipientPhone: recipientPhone || undefined,
      notes: notes || undefined,
      scheduledAt,
      services: [
        {
          serviceId: quoteResponse.id, // Using quote response ID as reference
          name: quoteResponse.quoteRequest.title,
          price: quoteResponse.price,
          duration: quoteResponse.estimatedDuration,
        },
      ],
      paymentMethod: paymentMethod === "vipps" ? PaymentMethod.VIPPS : PaymentMethod.CARD,
    });

    // Auto-confirm for demo (in real app, would wait for payment)
    await confirmBooking(booking.id);

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("Booking from quote error:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette bestilling. Prøv igjen." },
      { status: 500 }
    );
  }
}
