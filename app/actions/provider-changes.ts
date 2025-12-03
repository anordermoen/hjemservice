"use server";

import { auth } from "@/lib/auth";
import {
  createChangeRequest,
  approveChangeRequest as dbApprove,
  rejectChangeRequest as dbReject,
} from "@/lib/db/provider-changes";
import { prisma } from "@/lib/prisma";
import { ProviderChangeType } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Provider actions - submit change requests

export async function requestAddCertificate(data: {
  name: string;
  issuer: string;
  year: number;
  expiresAt?: string;
  message?: string;
}): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: session.user.id },
  });

  if (!provider) {
    return { error: "Leverandørprofil ikke funnet" };
  }

  try {
    await createChangeRequest({
      providerId: provider.id,
      changeType: "ADD_CERTIFICATE",
      data: {
        name: data.name,
        issuer: data.issuer,
        year: data.year,
        expiresAt: data.expiresAt,
      },
      message: data.message,
    });

    revalidatePath("/leverandor-portal/profil");
    return { success: true };
  } catch (error) {
    console.error("Request add certificate error:", error);
    return { error: "Kunne ikke sende forespørsel" };
  }
}

export async function requestRemoveCertificate(
  certificateId: string,
  message?: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: session.user.id },
    include: { certificates: true },
  });

  if (!provider) {
    return { error: "Leverandørprofil ikke funnet" };
  }

  const certificate = provider.certificates.find((c) => c.id === certificateId);
  if (!certificate) {
    return { error: "Sertifikat ikke funnet" };
  }

  try {
    await createChangeRequest({
      providerId: provider.id,
      changeType: "REMOVE_CERTIFICATE",
      data: {
        certificateId,
        name: certificate.name, // Store name for admin display
      },
      message,
    });

    revalidatePath("/leverandor-portal/profil");
    return { success: true };
  } catch (error) {
    console.error("Request remove certificate error:", error);
    return { error: "Kunne ikke sende forespørsel" };
  }
}

export async function requestAddLanguage(data: {
  code: string;
  name: string;
  proficiency: string;
  message?: string;
}): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: session.user.id },
  });

  if (!provider) {
    return { error: "Leverandørprofil ikke funnet" };
  }

  try {
    await createChangeRequest({
      providerId: provider.id,
      changeType: "ADD_LANGUAGE",
      data: {
        code: data.code,
        name: data.name,
        proficiency: data.proficiency,
      },
      message: data.message,
    });

    revalidatePath("/leverandor-portal/profil");
    return { success: true };
  } catch (error) {
    console.error("Request add language error:", error);
    return { error: "Kunne ikke sende forespørsel" };
  }
}

export async function requestRemoveLanguage(
  languageId: string,
  message?: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: session.user.id },
    include: { languages: true },
  });

  if (!provider) {
    return { error: "Leverandørprofil ikke funnet" };
  }

  const language = provider.languages.find((l) => l.id === languageId);
  if (!language) {
    return { error: "Språk ikke funnet" };
  }

  try {
    await createChangeRequest({
      providerId: provider.id,
      changeType: "REMOVE_LANGUAGE",
      data: {
        languageId,
        name: language.name, // Store name for admin display
      },
      message,
    });

    revalidatePath("/leverandor-portal/profil");
    return { success: true };
  } catch (error) {
    console.error("Request remove language error:", error);
    return { error: "Kunne ikke sende forespørsel" };
  }
}

export async function requestUpdatePoliceCheck(
  policeCheck: boolean,
  message?: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: session.user.id },
  });

  if (!provider) {
    return { error: "Leverandørprofil ikke funnet" };
  }

  try {
    await createChangeRequest({
      providerId: provider.id,
      changeType: "UPDATE_POLICE_CHECK",
      data: { policeCheck },
      message,
    });

    revalidatePath("/leverandor-portal/profil");
    return { success: true };
  } catch (error) {
    console.error("Request update police check error:", error);
    return { error: "Kunne ikke sende forespørsel" };
  }
}

export async function requestUpdateInsurance(
  insurance: boolean,
  message?: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: session.user.id },
  });

  if (!provider) {
    return { error: "Leverandørprofil ikke funnet" };
  }

  try {
    await createChangeRequest({
      providerId: provider.id,
      changeType: "UPDATE_INSURANCE",
      data: { insurance },
      message,
    });

    revalidatePath("/leverandor-portal/profil");
    return { success: true };
  } catch (error) {
    console.error("Request update insurance error:", error);
    return { error: "Kunne ikke sende forespørsel" };
  }
}

export async function requestUpdateEducation(
  education: string,
  message?: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: session.user.id },
  });

  if (!provider) {
    return { error: "Leverandørprofil ikke funnet" };
  }

  try {
    await createChangeRequest({
      providerId: provider.id,
      changeType: "UPDATE_EDUCATION",
      data: { education },
      message,
    });

    revalidatePath("/leverandor-portal/profil");
    return { success: true };
  } catch (error) {
    console.error("Request update education error:", error);
    return { error: "Kunne ikke sende forespørsel" };
  }
}

// Admin actions - approve/reject change requests

export async function approveChangeRequest(
  requestId: string,
  adminNote?: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  if (session.user.role !== "ADMIN") {
    return { error: "Kun administratorer kan godkjenne endringer" };
  }

  try {
    await dbApprove(requestId, session.user.id, adminNote);

    revalidatePath("/admin/endringer");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Approve change request error:", error);
    return { error: "Kunne ikke godkjenne endringen" };
  }
}

export async function rejectChangeRequest(
  requestId: string,
  adminNote?: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Du må være logget inn" };
  }

  if (session.user.role !== "ADMIN") {
    return { error: "Kun administratorer kan avvise endringer" };
  }

  try {
    await dbReject(requestId, session.user.id, adminNote);

    revalidatePath("/admin/endringer");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Reject change request error:", error);
    return { error: "Kunne ikke avvise endringen" };
  }
}
