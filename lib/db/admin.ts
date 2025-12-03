import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { BookingStatus } from "@prisma/client";

// Get admin dashboard stats
export const getAdminStats = cache(async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalUsers,
    totalProviders,
    bookingsToday,
    revenueToday,
    pendingApprovals,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.serviceProvider.count({ where: { approvedAt: { not: null } } }),
    prisma.booking.count({
      where: {
        createdAt: { gte: today, lt: tomorrow },
      },
    }),
    prisma.booking.aggregate({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
      },
      _sum: { totalPrice: true },
    }),
    prisma.serviceProvider.count({ where: { approvedAt: null } }),
  ]);

  return {
    totalUsers,
    totalProviders,
    bookingsToday,
    revenueToday: revenueToday._sum.totalPrice || 0,
    pendingApprovals,
  };
});

// Get pending provider applications
export const getPendingProviders = cache(async () => {
  const providers = await prisma.serviceProvider.findMany({
    where: { approvedAt: null },
    include: {
      user: true,
      categories: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return providers;
});

// Get platform statistics
export const getPlatformStats = cache(async () => {
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const lastMonth = new Date(thisMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const [
    totalBookings,
    totalRevenue,
    activeUsers,
    activeProviders,
    lastMonthBookings,
    lastMonthRevenue,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.aggregate({
      where: { status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] } },
      _sum: { totalPrice: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.serviceProvider.count({ where: { approvedAt: { not: null } } }),
    prisma.booking.count({
      where: {
        createdAt: { gte: lastMonth, lt: thisMonth },
      },
    }),
    prisma.booking.aggregate({
      where: {
        createdAt: { gte: lastMonth, lt: thisMonth },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
      },
      _sum: { totalPrice: true },
    }),
  ]);

  const totalRevenueValue = totalRevenue._sum.totalPrice || 0;
  const lastMonthRevenueValue = lastMonthRevenue._sum.totalPrice || 0;

  return {
    totalBookings,
    totalRevenue: totalRevenueValue,
    activeUsers,
    activeProviders,
    bookingsChange: lastMonthBookings > 0
      ? ((totalBookings - lastMonthBookings) / lastMonthBookings) * 100
      : 0,
    revenueChange: lastMonthRevenueValue > 0
      ? ((totalRevenueValue - lastMonthRevenueValue) / lastMonthRevenueValue) * 100
      : 0,
  };
});

// Get category statistics
export const getCategoryStats = cache(async () => {
  const categories = await prisma.serviceCategory.findMany({
    include: {
      providers: {
        where: { approvedAt: { not: null } },
      },
    },
  });

  const stats = await Promise.all(
    categories.map(async (cat) => {
      const bookings = await prisma.booking.count({
        where: {
          provider: {
            categories: { some: { id: cat.id } },
          },
        },
      });

      const revenue = await prisma.booking.aggregate({
        where: {
          provider: {
            categories: { some: { id: cat.id } },
          },
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
        },
        _sum: { totalPrice: true },
      });

      return {
        name: cat.name,
        bookings,
        revenue: revenue._sum.totalPrice || 0,
        providers: cat.providers.length,
      };
    })
  );

  return stats.sort((a, b) => b.bookings - a.bookings);
});

// Get top providers
export const getTopProviders = cache(async (limit = 5) => {
  const providers = await prisma.serviceProvider.findMany({
    where: { approvedAt: { not: null } },
    include: {
      user: true,
      categories: true,
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: { reviewCount: "desc" },
    take: limit,
  });

  const providersWithRevenue = await Promise.all(
    providers.map(async (p) => {
      const revenue = await prisma.booking.aggregate({
        where: {
          providerId: p.id,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
        },
        _sum: { totalPrice: true },
      });

      return {
        id: p.id,
        name: `${p.user.firstName} ${p.user.lastName}`,
        businessName: p.businessName,
        category: p.categories[0]?.name || "Ukjent",
        bookings: p._count.bookings,
        revenue: revenue._sum.totalPrice || 0,
        rating: p.rating,
      };
    })
  );

  return providersWithRevenue;
});
