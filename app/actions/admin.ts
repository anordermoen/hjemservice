"use server";

import { auth } from "@/lib/auth";
import {
  approveProvider as dbApproveProvider,
  rejectProvider as dbRejectProvider,
} from "@/lib/db/admin";
import { revalidatePath } from "next/cache";

export async function approveProviderAction(
  providerId: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user) {
    return { error: "Ikke autorisert" };
  }

  if (session.user.role !== "ADMIN") {
    return { error: "Kun administratorer kan godkjenne leverandører" };
  }

  try {
    await dbApproveProvider(providerId);
    revalidatePath("/admin");
    revalidatePath("/admin/godkjenning");
    revalidatePath("/tjenester");
    return { success: true };
  } catch (error) {
    console.error("Approve provider error:", error);
    return { error: "Kunne ikke godkjenne leverandøren" };
  }
}

export async function rejectProviderAction(
  providerId: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user) {
    return { error: "Ikke autorisert" };
  }

  if (session.user.role !== "ADMIN") {
    return { error: "Kun administratorer kan avslå leverandører" };
  }

  try {
    await dbRejectProvider(providerId);
    revalidatePath("/admin");
    revalidatePath("/admin/godkjenning");
    return { success: true };
  } catch (error) {
    console.error("Reject provider error:", error);
    return { error: "Kunne ikke avslå leverandøren" };
  }
}
