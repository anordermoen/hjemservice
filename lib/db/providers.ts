import { prisma } from "@/lib/prisma";
import { cache } from "react";

// Get all providers with their related data
export const getProviders = cache(async () => {
  const providers = await prisma.serviceProvider.findMany({
    where: { approvedAt: { not: null } },
    include: {
      user: true,
      categories: true,
      services: true,
      languages: true,
      certificates: true,
      availability: true,
    },
    orderBy: { rating: "desc" },
  });
  return providers;
});

// Get provider by ID with full details
export const getProviderById = cache(async (id: string) => {
  const provider = await prisma.serviceProvider.findUnique({
    where: { id },
    include: {
      user: true,
      categories: true,
      services: {
        include: { category: true },
      },
      languages: true,
      certificates: true,
      availability: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
  return provider;
});

// Get provider by user ID
export const getProviderByUserId = cache(async (userId: string) => {
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId },
    include: {
      user: true,
      categories: true,
      services: true,
      languages: true,
      certificates: true,
      availability: true,
    },
  });
  return provider;
});

// Get providers by category slug
export const getProvidersByCategory = cache(async (categorySlug: string) => {
  const providers = await prisma.serviceProvider.findMany({
    where: {
      approvedAt: { not: null },
      categories: {
        some: { slug: categorySlug },
      },
    },
    include: {
      user: true,
      categories: true,
      services: {
        where: {
          category: { slug: categorySlug },
        },
      },
      languages: true,
      certificates: true,
      availability: true,
    },
    orderBy: { rating: "desc" },
  });
  return providers;
});

// Get featured providers (high rating)
export const getFeaturedProviders = cache(async (limit: number = 4) => {
  const providers = await prisma.serviceProvider.findMany({
    where: {
      approvedAt: { not: null },
      rating: { gte: 4.5 },
    },
    include: {
      user: true,
      categories: true,
      services: true,
      languages: true,
    },
    orderBy: { rating: "desc" },
    take: limit,
  });
  return providers;
});

// Get reviews for a provider
export const getReviewsByProviderId = cache(async (providerId: string) => {
  const reviews = await prisma.review.findMany({
    where: { providerId },
    orderBy: { createdAt: "desc" },
  });
  return reviews;
});

// Search providers by area and category
export const searchProviders = cache(
  async (options: {
    categorySlug?: string;
    area?: string;
    minRating?: number;
  }) => {
    const providers = await prisma.serviceProvider.findMany({
      where: {
        approvedAt: { not: null },
        ...(options.categorySlug && {
          categories: { some: { slug: options.categorySlug } },
        }),
        ...(options.area && {
          areasServed: { has: options.area },
        }),
        ...(options.minRating && {
          rating: { gte: options.minRating },
        }),
      },
      include: {
        user: true,
        categories: true,
        services: true,
        languages: true,
      },
      orderBy: { rating: "desc" },
    });
    return providers;
  }
);
