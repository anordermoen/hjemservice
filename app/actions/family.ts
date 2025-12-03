"use server";

import { auth } from "@/lib/auth";
import {
  addFamilyMember as dbAddFamilyMember,
  updateFamilyMember as dbUpdateFamilyMember,
  deleteFamilyMember as dbDeleteFamilyMember,
} from "@/lib/db/family";
import { revalidatePath } from "next/cache";

export async function addFamilyMember(data: {
  name: string;
  phone: string;
  relationship: string;
  street: string;
  postalCode: string;
  city: string;
}): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  try {
    await dbAddFamilyMember(session.user.id, data);
    revalidatePath("/mine-sider/familie");
    return { success: true };
  } catch (error) {
    console.error("Add family member error:", error);
    return { error: "Kunne ikke legge til familiemedlem" };
  }
}

export async function updateFamilyMember(
  id: string,
  data: {
    name?: string;
    phone?: string;
    relationship?: string;
    street?: string;
    postalCode?: string;
    city?: string;
  }
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  try {
    await dbUpdateFamilyMember(id, session.user.id, data);
    revalidatePath("/mine-sider/familie");
    return { success: true };
  } catch (error) {
    console.error("Update family member error:", error);
    return { error: "Kunne ikke oppdatere familiemedlem" };
  }
}

export async function deleteFamilyMember(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  try {
    await dbDeleteFamilyMember(id, session.user.id);
    revalidatePath("/mine-sider/familie");
    return { success: true };
  } catch (error) {
    console.error("Delete family member error:", error);
    return { error: "Kunne ikke slette familiemedlem" };
  }
}
