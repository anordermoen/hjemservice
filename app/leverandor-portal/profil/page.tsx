import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/db/providers";
import { ProviderProfileClient } from "./ProviderProfileClient";

export const metadata = {
  title: "Min profil | Leverandørportal | HjemService",
  description: "Administrer din leverandørprofil.",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/logg-inn?callbackUrl=/leverandor-portal/profil");
  }

  const provider = await getProviderByUserId(session.user.id);

  if (!provider) {
    redirect("/bli-leverandor");
  }

  const providerData = {
    id: provider.id,
    firstName: provider.user.firstName || "",
    lastName: provider.user.lastName || "",
    email: provider.user.email,
    phone: provider.user.phone || "",
    avatarUrl: provider.user.avatarUrl,
    businessName: provider.businessName,
    bio: provider.bio,
    areasServed: provider.areasServed,
    services: provider.services.map((s) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration,
    })),
  };

  return <ProviderProfileClient provider={providerData} />;
}
