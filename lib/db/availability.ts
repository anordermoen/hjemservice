import { prisma } from "@/lib/prisma";
import { cache } from "react";

// Get provider's schedule (working hours)
export const getProviderSchedule = cache(async (providerId: string) => {
  const schedule = await prisma.providerSchedule.findMany({
    where: { providerId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return schedule;
});

// Get provider's blocked dates
export const getProviderBlockedDates = cache(async (providerId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const blockedDates = await prisma.blockedDate.findMany({
    where: {
      providerId,
      date: { gte: today },
    },
    orderBy: { date: "asc" },
  });
  return blockedDates;
});

// Update provider's schedule for a specific day
export async function updateProviderSchedule(
  providerId: string,
  dayOfWeek: number,
  slots: Array<{ startTime: string; endTime: string; isActive: boolean }>
) {
  // Delete existing slots for this day
  await prisma.providerSchedule.deleteMany({
    where: { providerId, dayOfWeek },
  });

  // Create new slots
  if (slots.length > 0) {
    await prisma.providerSchedule.createMany({
      data: slots.map((slot) => ({
        providerId,
        dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: slot.isActive,
      })),
    });
  }
}

// Add a blocked date
export async function addBlockedDate(
  providerId: string,
  date: Date,
  reason?: string
) {
  return prisma.blockedDate.upsert({
    where: {
      providerId_date: {
        providerId,
        date,
      },
    },
    update: { reason },
    create: {
      providerId,
      date,
      reason,
    },
  });
}

// Remove a blocked date
export async function removeBlockedDate(providerId: string, date: Date) {
  return prisma.blockedDate.delete({
    where: {
      providerId_date: {
        providerId,
        date,
      },
    },
  });
}

// Check if provider is available at a specific time
export async function checkProviderAvailability(
  providerId: string,
  dateTime: Date
): Promise<{ available: boolean; reason?: string }> {
  const date = new Date(dateTime);
  date.setHours(0, 0, 0, 0);

  // Check if date is blocked
  const blockedDate = await prisma.blockedDate.findUnique({
    where: {
      providerId_date: {
        providerId,
        date,
      },
    },
  });

  if (blockedDate) {
    return {
      available: false,
      reason: blockedDate.reason || "Leverandøren er ikke tilgjengelig denne dagen",
    };
  }

  // Check if provider works on this day
  const dayOfWeek = dateTime.getDay();
  const timeStr = dateTime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const scheduleSlot = await prisma.providerSchedule.findFirst({
    where: {
      providerId,
      dayOfWeek,
      isActive: true,
      startTime: { lte: timeStr },
      endTime: { gt: timeStr },
    },
  });

  if (!scheduleSlot) {
    return {
      available: false,
      reason: "Leverandøren jobber ikke på dette tidspunktet",
    };
  }

  // Check for existing bookings at this time
  const existingBooking = await prisma.booking.findFirst({
    where: {
      providerId,
      scheduledAt: dateTime,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  if (existingBooking) {
    return {
      available: false,
      reason: "Tidspunktet er allerede booket",
    };
  }

  return { available: true };
}

// Get available time slots for a provider on a specific date
export async function getAvailableSlots(
  providerId: string,
  date: Date
): Promise<string[]> {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  // Check if date is blocked
  const blockedDate = await prisma.blockedDate.findUnique({
    where: {
      providerId_date: {
        providerId,
        date: dateOnly,
      },
    },
  });

  if (blockedDate) {
    return [];
  }

  // Get schedule for this day
  const dayOfWeek = date.getDay();
  const scheduleSlots = await prisma.providerSchedule.findMany({
    where: {
      providerId,
      dayOfWeek,
      isActive: true,
    },
    orderBy: { startTime: "asc" },
  });

  if (scheduleSlots.length === 0) {
    return [];
  }

  // Get existing bookings for this date
  const nextDay = new Date(dateOnly);
  nextDay.setDate(nextDay.getDate() + 1);

  const existingBookings = await prisma.booking.findMany({
    where: {
      providerId,
      scheduledAt: {
        gte: dateOnly,
        lt: nextDay,
      },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { scheduledAt: true },
  });

  const bookedTimes = new Set(
    existingBookings.map((b) =>
      b.scheduledAt.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  );

  // Generate available slots (30-minute intervals)
  const availableSlots: string[] = [];

  for (const slot of scheduleSlots) {
    const [startHour, startMin] = slot.startTime.split(":").map(Number);
    const [endHour, endMin] = slot.endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const timeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;

      if (!bookedTimes.has(timeStr)) {
        // Check if this time is in the past for today
        const now = new Date();
        const slotDate = new Date(dateOnly);
        slotDate.setHours(currentHour, currentMin, 0, 0);

        if (slotDate > now) {
          availableSlots.push(timeStr);
        }
      }

      // Move to next 30-minute slot
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }
  }

  return availableSlots;
}
