"use server";

import { auth } from "@/lib/auth";
import {
  createQuoteRequest as dbCreateQuoteRequest,
  createQuoteResponse as dbCreateQuoteResponse,
  acceptQuoteResponse as dbAcceptQuoteResponse,
  cancelQuoteRequest as dbCancelQuoteRequest,
  getQuoteRequestById,
} from "@/lib/db/quotes";
import { getProviderByUserId } from "@/lib/db/providers";
import { revalidatePath } from "next/cache";

export async function createQuoteRequest(
  prevState: { error?: string; requestId?: string } | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Du må være logget inn for å sende en prisforespørsel" };
  }

  const categoryId = formData.get("categoryId") as string;
  const addressId = formData.get("addressId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const answersJson = formData.get("answers") as string;
  const photosJson = formData.get("photos") as string;
  const preferredDatesJson = formData.get("preferredDates") as string;

  if (!categoryId || !addressId || !title || !description) {
    return { error: "Mangler påkrevd informasjon" };
  }

  let answers = [];
  let photos: string[] = [];
  let preferredDates: string[] = [];

  try {
    if (answersJson) answers = JSON.parse(answersJson);
    if (photosJson) photos = JSON.parse(photosJson);
    if (preferredDatesJson) preferredDates = JSON.parse(preferredDatesJson);
  } catch {
    return { error: "Ugyldig data-format" };
  }

  try {
    const request = await dbCreateQuoteRequest({
      customerId: session.user.id,
      categoryId,
      addressId,
      title,
      description,
      answers,
      photos,
      preferredDates,
    });

    revalidatePath("/mine-sider");
    revalidatePath("/leverandor-portal");

    return { requestId: request.id };
  } catch (error) {
    console.error("Quote request creation error:", error);
    return { error: "Kunne ikke opprette prisforespørsel. Prøv igjen." };
  }
}

export async function respondToQuote(
  prevState: { error?: string; responseId?: string } | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Du må være logget inn som leverandør" };
  }

  // Get provider profile
  const provider = await getProviderByUserId(session.user.id);
  if (!provider) {
    return { error: "Du må være registrert som leverandør" };
  }

  const quoteRequestId = formData.get("quoteRequestId") as string;
  const price = parseInt(formData.get("price") as string);
  const estimatedDuration = parseInt(formData.get("estimatedDuration") as string);
  const materialsIncluded = formData.get("materialsIncluded") === "true";
  const materialsEstimate = formData.get("materialsEstimate")
    ? parseInt(formData.get("materialsEstimate") as string)
    : undefined;
  const message = formData.get("message") as string;

  if (!quoteRequestId || !price || !estimatedDuration || !message) {
    return { error: "Mangler påkrevd informasjon" };
  }

  if (price <= 0) {
    return { error: "Prisen må være større enn 0" };
  }

  try {
    const response = await dbCreateQuoteResponse({
      quoteRequestId,
      providerId: provider.id,
      price,
      estimatedDuration,
      materialsIncluded,
      materialsEstimate,
      message,
    });

    revalidatePath("/mine-sider");
    revalidatePath("/leverandor-portal");

    return { responseId: response.id };
  } catch (error) {
    console.error("Quote response creation error:", error);
    return { error: "Kunne ikke sende tilbud. Prøv igjen." };
  }
}

export async function acceptQuote(responseId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Ikke autorisert" };
  }

  try {
    const response = await dbAcceptQuoteResponse(responseId);

    // Verify user owns the quote request
    const request = await getQuoteRequestById(response.quoteRequestId);
    if (request?.customerId !== session.user.id) {
      return { error: "Du har ikke tilgang til denne forespørselen" };
    }

    revalidatePath("/mine-sider");
    return { success: true };
  } catch (error) {
    console.error("Accept quote error:", error);
    return { error: "Kunne ikke akseptere tilbudet" };
  }
}

export async function cancelQuote(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Ikke autorisert" };
  }

  const request = await getQuoteRequestById(requestId);
  if (!request) {
    return { error: "Forespørsel ikke funnet" };
  }

  if (request.customerId !== session.user.id) {
    return { error: "Du har ikke tilgang til denne forespørselen" };
  }

  try {
    await dbCancelQuoteRequest(requestId);
    revalidatePath("/mine-sider");
    return { success: true };
  } catch (error) {
    console.error("Cancel quote error:", error);
    return { error: "Kunne ikke kansellere forespørselen" };
  }
}

export async function submitQuoteResponse(data: {
  quoteRequestId: string;
  providerId: string;
  price: number;
  estimatedDuration: number;
  materialsIncluded: boolean;
  message: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Du må være logget inn som leverandør" };
  }

  // Get provider profile and verify it matches
  const provider = await getProviderByUserId(session.user.id);
  if (!provider || provider.id !== data.providerId) {
    return { success: false, error: "Du har ikke tilgang til denne handlingen" };
  }

  if (data.price <= 0) {
    return { success: false, error: "Prisen må være større enn 0" };
  }

  if (!data.message.trim()) {
    return { success: false, error: "Melding er påkrevd" };
  }

  try {
    const response = await dbCreateQuoteResponse({
      quoteRequestId: data.quoteRequestId,
      providerId: data.providerId,
      price: data.price,
      estimatedDuration: data.estimatedDuration,
      materialsIncluded: data.materialsIncluded,
      message: data.message,
    });

    revalidatePath("/mine-sider");
    revalidatePath("/leverandor-portal");

    return { success: true, responseId: response.id };
  } catch (error) {
    console.error("Quote response creation error:", error);
    return { success: false, error: "Kunne ikke sende tilbud. Prøv igjen." };
  }
}
