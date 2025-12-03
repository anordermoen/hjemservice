import { getAllSupportTickets, getSupportStats } from "@/lib/db/support";
import { SupportClient } from "./SupportClient";

export const metadata = {
  title: "Support | Admin | HjemService",
  description: "Håndter supporthenvendelser fra kunder og leverandører.",
};

export default async function AdminSupportPage() {
  const [tickets, stats] = await Promise.all([
    getAllSupportTickets(),
    getSupportStats(),
  ]);

  // Transform tickets to the shape expected by the client
  const ticketData = tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    message: t.message,
    category: t.category,
    priority: t.priority,
    status: t.status,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    resolvedAt: t.resolvedAt,
    assignedTo: t.assignedTo,
    user: {
      id: t.user.id,
      email: t.user.email,
      firstName: t.user.firstName,
      lastName: t.user.lastName,
      phone: t.user.phone,
      role: t.user.role,
    },
    responses: t.responses.map((r) => ({
      id: r.id,
      message: r.message,
      isAdmin: r.isAdmin,
      createdAt: r.createdAt,
      user: {
        firstName: r.user.firstName,
        lastName: r.user.lastName,
        role: r.user.role,
      },
    })),
  }));

  return <SupportClient tickets={ticketData} stats={stats} />;
}
