import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { SupportTicketStatus, SupportCategory, SupportPriority } from "@prisma/client";

// Get all support tickets for admin
export const getAllSupportTickets = cache(async () => {
  const tickets = await prisma.supportTicket.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
        },
      },
      responses: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [
      { status: "asc" },
      { priority: "desc" },
      { createdAt: "desc" },
    ],
  });
  return tickets;
});

// Get ticket by ID
export async function getSupportTicketById(ticketId: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
        },
      },
      responses: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return ticket;
}

// Get tickets by user
export const getSupportTicketsByUser = cache(async (userId: string) => {
  const tickets = await prisma.supportTicket.findMany({
    where: { userId },
    include: {
      responses: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          isAdmin: true,
          createdAt: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  return tickets;
});

// Get single ticket with all responses for user view
export async function getUserTicketById(ticketId: string, userId: string) {
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, userId },
    include: {
      responses: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return ticket;
}

// Create a support ticket
export async function createSupportTicket(data: {
  userId: string;
  subject: string;
  message: string;
  category: SupportCategory;
  priority?: SupportPriority;
}) {
  const ticket = await prisma.supportTicket.create({
    data: {
      userId: data.userId,
      subject: data.subject,
      message: data.message,
      category: data.category,
      priority: data.priority || "MEDIUM",
    },
  });
  return ticket;
}

// Add a response to a ticket
export async function addTicketResponse(data: {
  ticketId: string;
  userId: string;
  message: string;
  isAdmin: boolean;
}) {
  const response = await prisma.supportTicketResponse.create({
    data: {
      ticketId: data.ticketId,
      userId: data.userId,
      message: data.message,
      isAdmin: data.isAdmin,
    },
  });

  // Update ticket's updatedAt
  await prisma.supportTicket.update({
    where: { id: data.ticketId },
    data: { updatedAt: new Date() },
  });

  return response;
}

// Update ticket status
export async function updateTicketStatus(
  ticketId: string,
  status: SupportTicketStatus,
  assignedTo?: string
) {
  const updateData: {
    status: SupportTicketStatus;
    assignedTo?: string;
    resolvedAt?: Date | null;
  } = { status };

  if (assignedTo !== undefined) {
    updateData.assignedTo = assignedTo;
  }

  if (status === "RESOLVED") {
    updateData.resolvedAt = new Date();
  } else {
    updateData.resolvedAt = null;
  }

  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: updateData,
  });
  return ticket;
}

// Get support stats for admin dashboard
export const getSupportStats = cache(async () => {
  const [open, inProgress, resolved, highPriority] = await Promise.all([
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.supportTicket.count({ where: { status: "RESOLVED" } }),
    prisma.supportTicket.count({
      where: { priority: "HIGH", status: { not: "RESOLVED" } },
    }),
  ]);

  return { open, inProgress, resolved, highPriority };
});
