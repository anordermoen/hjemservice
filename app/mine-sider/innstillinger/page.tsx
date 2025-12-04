import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserById, getCustomerProfile } from "@/lib/db/users";
import { SettingsClient } from "./SettingsClient";

export const metadata = {
  title: "Innstillinger | Mine sider | HjemService",
  description: "Administrer din profil og innstillinger.",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/logg-inn?callbackUrl=/mine-sider/innstillinger");
  }

  const [user, profile] = await Promise.all([
    getUserById(session.user.id),
    getCustomerProfile(session.user.id),
  ]);

  if (!user) {
    redirect("/logg-inn");
  }

  return (
    <SettingsClient
      user={{
        id: user.id,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || undefined,
      }}
      addresses={profile?.addresses || []}
    />
  );
}
