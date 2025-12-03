"use server";

import { auth } from "@/lib/auth";
import {
  createSupportTicket as dbCreateTicket,
  addTicketResponse as dbAddResponse,
  updateTicketStatus as dbUpdateStatus,
  getSupportTicketById,
} from "@/lib/db/support";
import { revalidatePath } from "next/cache";
import { SupportCategory, SupportPriority, SupportTicketStatus } from "@prisma/client";

// Create a new support ticket (for customers/providers)
export async function createSupportTicket(data: {
  subject: string;
  message: string;
  category: SupportCategory;
  priority?: SupportPriority;
}): Promise<{ success?: boolean; error?: string; ticketId?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn for å sende en henvendelse" };
  }

  try {
    const ticket = await dbCreateTicket({
      userId: session.user.id,
      subject: data.subject,
      message: data.message,
      category: data.category,
      priority: data.priority,
    });

    revalidatePath("/admin/support");
    revalidatePath("/mine-sider/hjelp");

    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error("Create ticket error:", error);
    return { error: "Kunne ikke opprette henvendelsen" };
  }
}

// Add a response to a ticket (for both admin and users)
export async function addSupportResponse(
  ticketId: string,
  message: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  // Get ticket to verify access
  const ticket = await getSupportTicketById(ticketId);
  if (!ticket) {
    return { error: "Henvendelse ikke funnet" };
  }

  // Only allow ticket owner or admin to respond
  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && ticket.userId !== session.user.id) {
    return { error: "Du har ikke tilgang til denne henvendelsen" };
  }

  try {
    await dbAddResponse({
      ticketId,
      userId: session.user.id,
      message,
      isAdmin,
    });

    revalidatePath("/admin/support");
    revalidatePath("/mine-sider/hjelp");

    return { success: true };
  } catch (error) {
    console.error("Add response error:", error);
    return { error: "Kunne ikke legge til svar" };
  }
}

// Update ticket status (admin only)
export async function updateSupportTicketStatus(
  ticketId: string,
  status: SupportTicketStatus
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  if (session.user.role !== "ADMIN") {
    return { error: "Kun administratorer kan endre status" };
  }

  try {
    await dbUpdateStatus(ticketId, status, session.user.id);

    revalidatePath("/admin/support");

    return { success: true };
  } catch (error) {
    console.error("Update status error:", error);
    return { error: "Kunne ikke oppdatere status" };
  }
}

// Take ticket (admin assigns themselves)
export async function takeTicket(
  ticketId: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  if (session.user.role !== "ADMIN") {
    return { error: "Kun administratorer kan ta saker" };
  }

  try {
    await dbUpdateStatus(ticketId, "IN_PROGRESS", session.user.id);

    revalidatePath("/admin/support");

    return { success: true };
  } catch (error) {
    console.error("Take ticket error:", error);
    return { error: "Kunne ikke ta saken" };
  }
}

// Close ticket (user closes their own ticket)
export async function closeTicket(
  ticketId: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  // Get ticket to verify ownership
  const ticket = await getSupportTicketById(ticketId);
  if (!ticket) {
    return { error: "Henvendelse ikke funnet" };
  }

  // Allow if user owns the ticket OR is admin
  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && ticket.userId !== session.user.id) {
    return { error: "Du har ikke tilgang til denne henvendelsen" };
  }

  try {
    await dbUpdateStatus(ticketId, "RESOLVED");

    revalidatePath("/admin/support");
    revalidatePath("/mine-sider/hjelp");

    return { success: true };
  } catch (error) {
    console.error("Close ticket error:", error);
    return { error: "Kunne ikke lukke saken" };
  }
}

// Reopen ticket (admin only)
export async function reopenTicket(
  ticketId: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  if (session.user.role !== "ADMIN") {
    return { error: "Kun administratorer kan gjenåpne saker" };
  }

  try {
    await dbUpdateStatus(ticketId, "OPEN");

    revalidatePath("/admin/support");
    revalidatePath("/mine-sider/hjelp");

    return { success: true };
  } catch (error) {
    console.error("Reopen ticket error:", error);
    return { error: "Kunne ikke gjenåpne saken" };
  }
}
