"use server";

import { auth } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/db/providers";
import {
  updateProviderSchedule as dbUpdateSchedule,
  addBlockedDate as dbAddBlockedDate,
  removeBlockedDate as dbRemoveBlockedDate,
} from "@/lib/db/availability";
import { revalidatePath } from "next/cache";

export async function updateSchedule(
  dayOfWeek: number,
  slots: Array<{ startTime: string; endTime: string; isActive: boolean }>
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Ikke autorisert" };
  }

  const provider = await getProviderByUserId(session.user.id);
  if (!provider) {
    return { error: "Leverandørprofil ikke funnet" };
  }

  try {
    await dbUpdateSchedule(provider.id, dayOfWeek, slots);
    revalidatePath("/leverandor-portal/kalender");
    revalidatePath("/leverandor-portal/profil");
    return { success: true };
  } catch (error) {
    console.error("Update schedule error:", error);
    return { error: "Kunne ikke oppdatere timeplanen" };
  }
}

export async function addBlockedDate(dateStr: string, reason?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Ikke autorisert" };
  }

  const provider = await getProviderByUserId(session.user.id);
  if (!provider) {
    return { error: "Leverandørprofil ikke funnet" };
  }

  try {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    await dbAddBlockedDate(provider.id, date, reason);
    revalidatePath("/leverandor-portal/kalender");
    return { success: true };
  } catch (error) {
    console.error("Add blocked date error:", error);
    return { error: "Kunne ikke blokkere datoen" };
  }
}

export async function removeBlockedDate(dateStr: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Ikke autorisert" };
  }

  const provider = await getProviderByUserId(session.user.id);
  if (!provider) {
    return { error: "Leverandørprofil ikke funnet" };
  }

  try {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    await dbRemoveBlockedDate(provider.id, date);
    revalidatePath("/leverandor-portal/kalender");
    return { success: true };
  } catch (error) {
    console.error("Remove blocked date error:", error);
    return { error: "Kunne ikke fjerne blokkeringen" };
  }
}

export async function addBlockedDateRange(
  fromDateStr: string,
  toDateStr: string,
  reason?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Ikke autorisert" };
  }

  const provider = await getProviderByUserId(session.user.id);
  if (!provider) {
    return { error: "Leverandørprofil ikke funnet" };
  }

  try {
    const fromDate = new Date(fromDateStr);
    const toDate = new Date(toDateStr);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(0, 0, 0, 0);

    // Block each day in the range
    for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      await dbAddBlockedDate(provider.id, new Date(d), reason);
    }

    revalidatePath("/leverandor-portal/kalender");
    return { success: true };
  } catch (error) {
    console.error("Add blocked date range error:", error);
    return { error: "Kunne ikke blokkere perioden" };
  }
}

// Public action: Get available slots for a provider on a specific date
export async function getAvailableSlotsForDate(
  providerId: string,
  dateStr: string
): Promise<{ slots: string[]; error?: string }> {
  try {
    const { getAvailableSlots } = await import("@/lib/db/availability");
    const date = new Date(dateStr);
    const slots = await getAvailableSlots(providerId, date);
    return { slots };
  } catch (error) {
    console.error("Get available slots error:", error);
    return { slots: [], error: "Kunne ikke hente ledige tider" };
  }
}
