import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserTicketById } from "@/lib/db/support";
import { TicketDetailClient } from "./TicketDetailClient";

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TicketDetailPageProps) {
  const { id } = await params;
  return {
    title: `Henvendelse | HjemService`,
  };
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/logg-inn?callbackUrl=/mine-sider/hjelp/${id}`);
  }

  const ticket = await getUserTicketById(id, session.user.id);

  if (!ticket) {
    notFound();
  }

  const ticketData = {
    id: ticket.id,
    subject: ticket.subject,
    message: ticket.message,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    resolvedAt: ticket.resolvedAt,
    responses: ticket.responses.map((r) => ({
      id: r.id,
      message: r.message,
      isAdmin: r.isAdmin,
      createdAt: r.createdAt,
      userName: r.isAdmin
        ? "Support"
        : `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim() || "Du",
    })),
  };

  return <TicketDetailClient ticket={ticketData} />;
}
