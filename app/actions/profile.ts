"use server";

import { auth } from "@/lib/auth";
import {
  updateUserProfile,
  addAddress as dbAddAddress,
  updateAddress as dbUpdateAddress,
  deleteAddress as dbDeleteAddress,
} from "@/lib/db/users";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Ikke autorisert" };
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;

  try {
    await updateUserProfile(session.user.id, {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: phone || undefined,
    });

    revalidatePath("/mine-sider/innstillinger");
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "Kunne ikke oppdatere profilen. Prøv igjen." };
  }
}

export async function addAddress(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Ikke autorisert" };
  }

  const label = formData.get("label") as string;
  const street = formData.get("street") as string;
  const postalCode = formData.get("postalCode") as string;
  const city = formData.get("city") as string;
  const floor = formData.get("floor") as string;
  const entryCode = formData.get("entryCode") as string;
  const instructions = formData.get("instructions") as string;

  if (!street || !postalCode || !city) {
    return { error: "Adresse, postnummer og sted er påkrevd" };
  }

  try {
    await dbAddAddress(session.user.id, {
      label: label || "Hjemme",
      street,
      postalCode,
      city,
      floor: floor || undefined,
      entryCode: entryCode || undefined,
      instructions: instructions || undefined,
    });

    revalidatePath("/mine-sider/innstillinger");
    return { success: true };
  } catch (error) {
    console.error("Add address error:", error);
    return { error: "Kunne ikke legge til adressen. Prøv igjen." };
  }
}

export async function updateAddress(addressId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Ikke autorisert" };
  }

  const label = formData.get("label") as string;
  const street = formData.get("street") as string;
  const postalCode = formData.get("postalCode") as string;
  const city = formData.get("city") as string;
  const floor = formData.get("floor") as string;
  const entryCode = formData.get("entryCode") as string;
  const instructions = formData.get("instructions") as string;

  try {
    await dbUpdateAddress(addressId, {
      label: label || undefined,
      street: street || undefined,
      postalCode: postalCode || undefined,
      city: city || undefined,
      floor: floor || undefined,
      entryCode: entryCode || undefined,
      instructions: instructions || undefined,
    });

    revalidatePath("/mine-sider/innstillinger");
    return { success: true };
  } catch (error) {
    console.error("Update address error:", error);
    return { error: "Kunne ikke oppdatere adressen. Prøv igjen." };
  }
}

export async function deleteAddress(addressId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Ikke autorisert" };
  }

  try {
    await dbDeleteAddress(addressId);

    revalidatePath("/mine-sider/innstillinger");
    return { success: true };
  } catch (error) {
    console.error("Delete address error:", error);
    return { error: "Kunne ikke slette adressen. Prøv igjen." };
  }
}
