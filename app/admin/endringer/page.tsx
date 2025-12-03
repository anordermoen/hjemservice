import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPendingChangeRequests } from "@/lib/db/provider-changes";
import { ChangeRequestsClient } from "./ChangeRequestsClient";

export const metadata = {
  title: "Godkjenn endringer | Admin | HjemService",
  description: "Godkjenn eller avvis leverandørendringer.",
};

export default async function ChangeRequestsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/logg-inn?callbackUrl=/admin/endringer");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const requests = await getPendingChangeRequests();

  const requestsData = requests.map((req) => ({
    id: req.id,
    changeType: req.changeType,
    data: req.data as Record<string, unknown>,
    message: req.message,
    createdAt: req.createdAt,
    provider: {
      id: req.provider.id,
      businessName: req.provider.businessName,
      userName: `${req.provider.user.firstName || ""} ${req.provider.user.lastName || ""}`.trim(),
      email: req.provider.user.email,
    },
  }));

  return <ChangeRequestsClient requests={requestsData} />;
}
