import { Booking } from "@/types";

// Mock bookings data - in production this would come from database
export const bookings: Booking[] = [
  {
    id: "bk-001",
    customerId: "c1",
    providerId: "p1",
    recipientName: "Kari Nordmann",
    recipientPhone: "+47 923 45 678",
    services: [
      { serviceId: "s2", name: "Dameklipp", price: 749, duration: 45 },
    ],
    status: "confirmed",
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    address: {
      id: "a1",
      label: "Hjemme",
      street: "Storgata 15",
      postalCode: "0182",
      city: "Oslo",
      floor: "3. etasje",
    },
    totalPrice: 749,
    platformFee: 112,
    providerPayout: 637,
    paymentMethod: "vipps",
    paymentStatus: "paid",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "bk-002",
    customerId: "c1",
    providerId: "p4",
    recipientName: "Kari Nordmann",
    recipientPhone: "+47 923 45 678",
    services: [
      { serviceId: "s14", name: "Ukentlig renhold (2-3 rom)", price: 1199, duration: 120 },
    ],
    status: "confirmed",
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    address: {
      id: "a1",
      label: "Hjemme",
      street: "Storgata 15",
      postalCode: "0182",
      city: "Oslo",
      floor: "3. etasje",
    },
    totalPrice: 1199,
    platformFee: 180,
    providerPayout: 1019,
    paymentMethod: "card",
    paymentStatus: "paid",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "bk-003",
    customerId: "c1",
    providerId: "p6",
    recipientName: "Kari Nordmann",
    recipientPhone: "+47 923 45 678",
    services: [
      { serviceId: "s25", name: "Opphenging av TV", price: 1199, duration: 60 },
    ],
    status: "completed",
    scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    address: {
      id: "a1",
      label: "Hjemme",
      street: "Storgata 15",
      postalCode: "0182",
      city: "Oslo",
    },
    totalPrice: 1199,
    platformFee: 180,
    providerPayout: 1019,
    paymentMethod: "vipps",
    paymentStatus: "paid",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "bk-004",
    customerId: "c1",
    providerId: "p2",
    recipientName: "Kari Nordmann",
    recipientPhone: "+47 923 45 678",
    services: [
      { serviceId: "s6", name: "Herreklipp", price: 499, duration: 30 },
      { serviceId: "s8", name: "Skjeggtrim", price: 299, duration: 20 },
    ],
    status: "cancelled",
    scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    address: {
      id: "a1",
      label: "Hjemme",
      street: "Storgata 15",
      postalCode: "0182",
      city: "Oslo",
    },
    totalPrice: 798,
    platformFee: 120,
    providerPayout: 678,
    paymentMethod: "vipps",
    paymentStatus: "refunded",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    cancellation: {
      cancelledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      cancelledBy: "customer",
      reason: "Fikk forhindring",
      wasWithin24Hours: false,
      cancellationFee: 0,
      feeRefunded: false,
    },
  },
  {
    id: "bk-005",
    customerId: "c2",
    providerId: "p1",
    recipientName: "Ole Hansen",
    recipientPhone: "+47 912 34 567",
    services: [
      { serviceId: "s4", name: "Klipp + farge", price: 1899, duration: 120 },
    ],
    status: "cancelled",
    scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    address: {
      id: "a2",
      label: "Jobb",
      street: "Kongens gate 10",
      postalCode: "0153",
      city: "Oslo",
    },
    totalPrice: 1899,
    platformFee: 285,
    providerPayout: 1614,
    paymentMethod: "card",
    paymentStatus: "partially_refunded",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    cancellation: {
      cancelledAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      cancelledBy: "customer",
      reason: "Måtte reise bort",
      wasWithin24Hours: true,
      cancellationFee: 950, // 50% of total
      feeRefunded: false,
    },
  },
];

// Helper functions
export function getBookingById(id: string): Booking | undefined {
  return bookings.find((b) => b.id === id);
}

export function getBookingsByCustomerId(customerId: string): Booking[] {
  return bookings.filter((b) => b.customerId === customerId);
}

export function getBookingsByProviderId(providerId: string): Booking[] {
  return bookings.filter((b) => b.providerId === providerId);
}

export function getUpcomingBookings(providerId: string): Booking[] {
  const now = new Date();
  return bookings
    .filter((b) => b.providerId === providerId && b.status === "confirmed" && b.scheduledAt > now)
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
}

export function getCancelledBookingsWithFees(providerId: string): Booking[] {
  return bookings.filter(
    (b) =>
      b.providerId === providerId &&
      b.status === "cancelled" &&
      b.cancellation?.wasWithin24Hours &&
      b.cancellation.cancellationFee > 0 &&
      !b.cancellation.feeRefunded
  );
}

// Calculate cancellation fee (50% if within 24 hours)
export function calculateCancellationFee(booking: Booking): number {
  const now = new Date();
  const hoursUntilBooking = (booking.scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilBooking < 24) {
    return Math.round(booking.totalPrice * 0.5);
  }
  return 0;
}

// Check if cancellation is within 24 hours
export function isWithin24Hours(booking: Booking): boolean {
  const now = new Date();
  const hoursUntilBooking = (booking.scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilBooking < 24;
}
