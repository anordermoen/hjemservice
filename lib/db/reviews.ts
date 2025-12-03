import { prisma } from "@/lib/prisma";
import { cache } from "react";

// Get reviews for a provider
export const getReviewsByProviderId = cache(async (providerId: string) => {
  const reviews = await prisma.review.findMany({
    where: { providerId },
    include: {
      customer: true,
      booking: {
        include: {
          services: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return reviews;
});

// Get review by booking ID
export const getReviewByBookingId = cache(async (bookingId: string) => {
  const review = await prisma.review.findUnique({
    where: { bookingId },
  });
  return review;
});

// Create a review
export async function createReview(data: {
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment?: string;
  customerName: string;
}) {
  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Create the review
  const review = await prisma.review.create({
    data: {
      bookingId: data.bookingId,
      customerId: data.customerId,
      providerId: data.providerId,
      rating: data.rating,
      comment: data.comment,
      customerName: data.customerName,
    },
  });

  // Update provider's rating and review count
  const allReviews = await prisma.review.findMany({
    where: { providerId: data.providerId },
    select: { rating: true },
  });

  const averageRating =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await prisma.serviceProvider.update({
    where: { id: data.providerId },
    data: {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: allReviews.length,
    },
  });

  return review;
}

// Get average rating for a provider
export const getProviderRating = cache(async (providerId: string) => {
  const result = await prisma.review.aggregate({
    where: { providerId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    averageRating: result._avg.rating || 0,
    reviewCount: result._count.rating,
  };
});
