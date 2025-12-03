import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSupportTicketsByUser } from "@/lib/db/support";
import { CustomerSupportClient } from "./CustomerSupportClient";

export const metadata = {
  title: "Hjelp og support | HjemService",
  description: "Kontakt oss eller se dine supporthenvendelser.",
};

export default async function CustomerSupportPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/logg-inn?callbackUrl=/mine-sider/hjelp");
  }

  const tickets = await getSupportTicketsByUser(session.user.id);

  const ticketData = tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    message: t.message,
    category: t.category,
    priority: t.priority,
    status: t.status,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    hasNewResponse: t.responses.length > 0 && t.responses[0].isAdmin,
  }));

  return <CustomerSupportClient tickets={ticketData} />;
}
