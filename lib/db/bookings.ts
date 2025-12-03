import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { BookingStatus, PaymentStatus, PaymentMethod } from "@prisma/client";

// Get booking by ID
export const getBookingById = cache(async (id: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      provider: {
        include: { user: true },
      },
      address: true,
      services: true,
      cancellation: true,
      review: true,
    },
  });
  return booking;
});

// Get bookings for a customer
export const getBookingsByCustomerId = cache(async (customerId: string) => {
  const bookings = await prisma.booking.findMany({
    where: { customerId },
    include: {
      provider: {
        include: { user: true },
      },
      address: true,
      services: true,
      cancellation: true,
      review: true,
    },
    orderBy: { scheduledAt: "desc" },
  });
  return bookings;
});

// Get bookings for a provider
export const getBookingsByProviderId = cache(async (providerId: string) => {
  const bookings = await prisma.booking.findMany({
    where: { providerId },
    include: {
      customer: true,
      address: true,
      services: true,
      cancellation: true,
    },
    orderBy: { scheduledAt: "desc" },
  });
  return bookings;
});

// Get upcoming bookings for a provider
export const getUpcomingBookings = cache(async (providerId: string) => {
  const now = new Date();
  const bookings = await prisma.booking.findMany({
    where: {
      providerId,
      status: BookingStatus.CONFIRMED,
      scheduledAt: { gt: now },
    },
    include: {
      customer: true,
      address: true,
      services: true,
    },
    orderBy: { scheduledAt: "asc" },
  });
  return bookings;
});

// Get today's bookings for a provider
export const getTodaysBookings = cache(async (providerId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      providerId,
      status: BookingStatus.CONFIRMED,
      scheduledAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      customer: true,
      address: true,
      services: true,
    },
    orderBy: { scheduledAt: "asc" },
  });
  return bookings;
});

// Get pending bookings for a provider (awaiting confirmation)
export const getPendingBookings = cache(async (providerId: string) => {
  const bookings = await prisma.booking.findMany({
    where: {
      providerId,
      status: BookingStatus.PENDING,
    },
    include: {
      customer: true,
      address: true,
      services: true,
    },
    orderBy: { scheduledAt: "asc" },
  });
  return bookings;
});

// Get provider stats for dashboard
export const getProviderStats = cache(async (providerId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todayCount, pendingCount, monthlyEarnings, provider] = await Promise.all([
    prisma.booking.count({
      where: {
        providerId,
        status: BookingStatus.CONFIRMED,
        scheduledAt: { gte: today, lt: tomorrow },
      },
    }),
    prisma.booking.count({
      where: {
        providerId,
        status: BookingStatus.PENDING,
      },
    }),
    prisma.booking.aggregate({
      where: {
        providerId,
        status: BookingStatus.COMPLETED,
        completedAt: { gte: firstOfMonth },
      },
      _sum: { providerPayout: true },
    }),
    prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { rating: true, reviewCount: true },
    }),
  ]);

  return {
    todayAppointments: todayCount,
    pendingRequests: pendingCount,
    monthlyEarnings: monthlyEarnings._sum.providerPayout || 0,
    rating: provider?.rating || 0,
    reviewCount: provider?.reviewCount || 0,
  };
});

// Get cancelled bookings with fees (for provider refund management)
export const getCancelledBookingsWithFees = cache(
  async (providerId: string) => {
    const bookings = await prisma.booking.findMany({
      where: {
        providerId,
        status: BookingStatus.CANCELLED,
        cancellation: {
          wasWithin24Hours: true,
          cancellationFee: { gt: 0 },
          feeRefunded: false,
        },
      },
      include: {
        customer: true,
        cancellation: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return bookings;
  }
);

// Create a new booking
export async function createBooking(data: {
  customerId: string;
  providerId: string;
  addressId: string;
  recipientName?: string;
  recipientPhone?: string;
  notes?: string;
  scheduledAt: Date;
  services: Array<{
    serviceId: string;
    name: string;
    price: number;
    duration: number;
  }>;
  paymentMethod: PaymentMethod;
}) {
  const totalPrice = data.services.reduce((sum, s) => sum + s.price, 0);
  const platformFee = Math.round(totalPrice * 0.15); // 15% platform fee
  const providerPayout = totalPrice - platformFee;

  const booking = await prisma.booking.create({
    data: {
      customerId: data.customerId,
      providerId: data.providerId,
      addressId: data.addressId,
      recipientName: data.recipientName,
      recipientPhone: data.recipientPhone,
      notes: data.notes,
      scheduledAt: data.scheduledAt,
      totalPrice,
      platformFee,
      providerPayout,
      paymentMethod: data.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      status: BookingStatus.PENDING,
      services: {
        create: data.services.map((s) => ({
          serviceId: s.serviceId,
          name: s.name,
          price: s.price,
          duration: s.duration,
        })),
      },
    },
    include: {
      services: true,
      address: true,
    },
  });

  return booking;
}

// Confirm a booking
export async function confirmBooking(bookingId: string) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
    },
  });
  return booking;
}

// Complete a booking
export async function completeBooking(bookingId: string) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.COMPLETED,
      completedAt: new Date(),
    },
  });
  return booking;
}

// Cancel a booking
export async function cancelBooking(
  bookingId: string,
  cancelledBy: "customer" | "provider",
  reason?: string
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking not found");

  const now = new Date();
  const hoursUntilBooking =
    (booking.scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  const wasWithin24Hours = hoursUntilBooking < 24;
  const cancellationFee = wasWithin24Hours
    ? Math.round(booking.totalPrice * 0.5)
    : 0;

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CANCELLED,
      paymentStatus: wasWithin24Hours
        ? PaymentStatus.PARTIALLY_REFUNDED
        : PaymentStatus.REFUNDED,
      cancellation: {
        create: {
          cancelledBy,
          reason,
          wasWithin24Hours,
          cancellationFee,
        },
      },
    },
    include: {
      cancellation: true,
    },
  });

  return updatedBooking;
}

// Calculate cancellation fee
export function calculateCancellationFee(
  scheduledAt: Date,
  totalPrice: number
): number {
  const now = new Date();
  const hoursUntilBooking =
    (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilBooking < 24) {
    return Math.round(totalPrice * 0.5);
  }
  return 0;
}
