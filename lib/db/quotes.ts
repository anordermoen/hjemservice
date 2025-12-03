import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { QuoteRequestStatus, QuoteResponseStatus, Prisma } from "@prisma/client";

// Get quote request by ID
export const getQuoteRequestById = cache(async (id: string) => {
  const request = await prisma.quoteRequest.findUnique({
    where: { id },
    include: {
      customer: true,
      category: true,
      address: true,
      responses: {
        include: {
          provider: {
            include: { user: true, languages: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return request;
});

// Get quote requests by customer
export const getQuoteRequestsByCustomerId = cache(async (customerId: string) => {
  const requests = await prisma.quoteRequest.findMany({
    where: { customerId },
    include: {
      category: true,
      address: true,
      responses: {
        include: {
          provider: {
            include: { user: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return requests;
});

// Get open quote requests for a category (for providers to see)
export const getOpenQuoteRequestsByCategory = cache(
  async (categorySlug: string) => {
    const requests = await prisma.quoteRequest.findMany({
      where: {
        category: { slug: categorySlug },
        status: { in: [QuoteRequestStatus.OPEN, QuoteRequestStatus.QUOTED] },
        expiresAt: { gt: new Date() },
      },
      include: {
        customer: true,
        category: true,
        address: true,
        responses: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return requests;
  }
);

// Get open quote requests for a provider's categories
export const getOpenQuoteRequestsForProvider = cache(
  async (providerId: string) => {
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      include: { categories: true },
    });

    if (!provider) return [];

    const categoryIds = provider.categories.map((c) => c.id);

    const requests = await prisma.quoteRequest.findMany({
      where: {
        categoryId: { in: categoryIds },
        status: { in: [QuoteRequestStatus.OPEN, QuoteRequestStatus.QUOTED] },
        expiresAt: { gt: new Date() },
      },
      include: {
        customer: true,
        category: true,
        address: true,
        responses: {
          where: { providerId },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests;
  }
);

// Get quote responses by provider
export const getQuoteResponsesByProviderId = cache(
  async (providerId: string) => {
    const responses = await prisma.quoteResponse.findMany({
      where: { providerId },
      include: {
        quoteRequest: {
          include: {
            customer: true,
            category: true,
            address: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return responses;
  }
);

// Create a quote request
export async function createQuoteRequest(data: {
  customerId: string;
  categoryId: string;
  addressId: string;
  title: string;
  description: string;
  answers: Array<{ questionId: string; answer: string | number | string[] }>;
  photos?: string[];
  preferredDates?: string[];
  expiresInDays?: number;
}) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 7));

  const request = await prisma.quoteRequest.create({
    data: {
      customerId: data.customerId,
      categoryId: data.categoryId,
      addressId: data.addressId,
      title: data.title,
      description: data.description,
      answers: data.answers as unknown as Prisma.InputJsonValue,
      photos: data.photos || [],
      preferredDates: data.preferredDates || [],
      expiresAt,
    },
    include: {
      category: true,
      address: true,
    },
  });

  return request;
}

// Create a quote response (provider responds to request)
export async function createQuoteResponse(data: {
  quoteRequestId: string;
  providerId: string;
  price: number;
  estimatedDuration: number;
  materialsIncluded: boolean;
  materialsEstimate?: number;
  message: string;
  validForDays?: number;
}) {
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + (data.validForDays || 5));

  // Update quote request status to QUOTED if it was OPEN
  await prisma.quoteRequest.updateMany({
    where: {
      id: data.quoteRequestId,
      status: QuoteRequestStatus.OPEN,
    },
    data: {
      status: QuoteRequestStatus.QUOTED,
    },
  });

  const response = await prisma.quoteResponse.create({
    data: {
      quoteRequestId: data.quoteRequestId,
      providerId: data.providerId,
      price: data.price,
      estimatedDuration: data.estimatedDuration,
      materialsIncluded: data.materialsIncluded,
      materialsEstimate: data.materialsEstimate,
      message: data.message,
      validUntil,
    },
    include: {
      provider: {
        include: { user: true },
      },
    },
  });

  return response;
}

// Accept a quote response
export async function acceptQuoteResponse(responseId: string) {
  const response = await prisma.quoteResponse.update({
    where: { id: responseId },
    data: {
      status: QuoteResponseStatus.ACCEPTED,
      quoteRequest: {
        update: {
          status: QuoteRequestStatus.ACCEPTED,
        },
      },
    },
    include: {
      quoteRequest: true,
      provider: true,
    },
  });

  // Reject all other responses for this request
  await prisma.quoteResponse.updateMany({
    where: {
      quoteRequestId: response.quoteRequestId,
      id: { not: responseId },
      status: QuoteResponseStatus.PENDING,
    },
    data: {
      status: QuoteResponseStatus.REJECTED,
    },
  });

  return response;
}

// Cancel a quote request
export async function cancelQuoteRequest(requestId: string) {
  const request = await prisma.quoteRequest.update({
    where: { id: requestId },
    data: {
      status: QuoteRequestStatus.CANCELLED,
    },
  });

  // Expire all pending responses
  await prisma.quoteResponse.updateMany({
    where: {
      quoteRequestId: requestId,
      status: QuoteResponseStatus.PENDING,
    },
    data: {
      status: QuoteResponseStatus.EXPIRED,
    },
  });

  return request;
}
