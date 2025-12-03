import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFamilyMembers } from "@/lib/db/family";
import { FamilyClient } from "./FamilyClient";

export const metadata = {
  title: "Familie | HjemService",
  description: "Administrer familiemedlemmer for å bestille tjenester på deres vegne.",
};

export default async function FamilyPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/logg-inn?callbackUrl=/mine-sider/familie");
  }

  const familyMembers = await getFamilyMembers(session.user.id);

  const membersData = familyMembers.map((member) => ({
    id: member.id,
    name: member.name,
    phone: member.phone,
    relationship: member.relationship,
    street: member.street,
    postalCode: member.postalCode,
    city: member.city,
  }));

  return <FamilyClient initialMembers={membersData} />;
}
