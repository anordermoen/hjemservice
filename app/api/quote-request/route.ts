import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createQuoteRequest } from "@/lib/db/quotes";
import { addAddress } from "@/lib/db/users";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Du må være logget inn for å sende en forespørsel" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      categoryId,
      title,
      description,
      answers,
      address,
      preferredDate,
      selectedProviderIds,
    } = body;

    // Validate required fields
    if (!categoryId || !title || !address?.street || !address?.postalCode || !address?.city) {
      return NextResponse.json(
        { error: "Mangler påkrevd informasjon" },
        { status: 400 }
      );
    }

    // Create address for this quote request
    const newAddress = await addAddress(session.user.id, {
      label: `Tilbudsforespørsel - ${title}`,
      street: address.street,
      postalCode: address.postalCode,
      city: address.city,
    });

    // Build preferred dates array
    const preferredDates: string[] = [];
    if (preferredDate) {
      preferredDates.push(preferredDate);
    }

    // Create the quote request
    const quoteRequest = await createQuoteRequest({
      customerId: session.user.id,
      categoryId,
      addressId: newAddress.id,
      title,
      description: description || "",
      answers: answers || [],
      preferredDates,
    });

    // TODO: In a real app, we would notify selected providers here
    // For now, the quote request is visible to all providers in the category
    console.log(`Quote request created. Selected providers: ${selectedProviderIds?.length || 0}`);

    return NextResponse.json({
      success: true,
      quoteRequestId: quoteRequest.id,
    });
  } catch (error) {
    console.error("Quote request creation error:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette forespørsel. Prøv igjen." },
      { status: 500 }
    );
  }
}
