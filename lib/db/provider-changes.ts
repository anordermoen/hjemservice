import { prisma } from "@/lib/prisma";
import { ProviderChangeType, ProviderChangeStatus } from "@prisma/client";
import { cache } from "react";

// Get all pending change requests (for admin)
export const getPendingChangeRequests = cache(async () => {
  return prisma.providerChangeRequest.findMany({
    where: { status: "PENDING" },
    include: {
      provider: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
});

// Get change requests for a specific provider
export const getProviderChangeRequests = cache(async (providerId: string) => {
  return prisma.providerChangeRequest.findMany({
    where: { providerId },
    orderBy: { createdAt: "desc" },
  });
});

// Get pending change requests count (for admin dashboard)
export const getPendingChangeRequestsCount = cache(async () => {
  return prisma.providerChangeRequest.count({
    where: { status: "PENDING" },
  });
});

// Create a new change request
export async function createChangeRequest(data: {
  providerId: string;
  changeType: ProviderChangeType;
  data: Record<string, unknown>;
  message?: string;
}) {
  return prisma.providerChangeRequest.create({
    data: {
      providerId: data.providerId,
      changeType: data.changeType,
      data: data.data as object,
      message: data.message,
    },
  });
}

// Approve a change request and apply the change
export async function approveChangeRequest(
  requestId: string,
  adminUserId: string,
  adminNote?: string
) {
  const request = await prisma.providerChangeRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("Change request not found");
  }

  if (request.status !== "PENDING") {
    throw new Error("Change request is not pending");
  }

  const changeData = request.data as Record<string, unknown>;

  // Apply the change based on type
  await prisma.$transaction(async (tx) => {
    switch (request.changeType) {
      case "ADD_CERTIFICATE":
        await tx.certificate.create({
          data: {
            providerId: request.providerId,
            name: changeData.name as string,
            issuer: changeData.issuer as string,
            year: changeData.year as number,
            verified: true, // Admin approved = verified
            expiresAt: changeData.expiresAt ? new Date(changeData.expiresAt as string) : null,
          },
        });
        break;

      case "UPDATE_CERTIFICATE":
        await tx.certificate.update({
          where: { id: changeData.certificateId as string },
          data: {
            name: changeData.name as string,
            issuer: changeData.issuer as string,
            year: changeData.year as number,
            expiresAt: changeData.expiresAt ? new Date(changeData.expiresAt as string) : null,
          },
        });
        break;

      case "REMOVE_CERTIFICATE":
        await tx.certificate.delete({
          where: { id: changeData.certificateId as string },
        });
        break;

      case "ADD_LANGUAGE":
        await tx.providerLanguage.create({
          data: {
            providerId: request.providerId,
            code: changeData.code as string,
            name: changeData.name as string,
            proficiency: changeData.proficiency as string,
          },
        });
        break;

      case "UPDATE_LANGUAGE":
        await tx.providerLanguage.update({
          where: { id: changeData.languageId as string },
          data: {
            proficiency: changeData.proficiency as string,
          },
        });
        break;

      case "REMOVE_LANGUAGE":
        await tx.providerLanguage.delete({
          where: { id: changeData.languageId as string },
        });
        break;

      case "UPDATE_POLICE_CHECK":
        await tx.serviceProvider.update({
          where: { id: request.providerId },
          data: { policeCheck: changeData.policeCheck as boolean },
        });
        break;

      case "UPDATE_INSURANCE":
        await tx.serviceProvider.update({
          where: { id: request.providerId },
          data: { insurance: changeData.insurance as boolean },
        });
        break;

      case "UPDATE_EDUCATION":
        await tx.serviceProvider.update({
          where: { id: request.providerId },
          data: { education: changeData.education as string },
        });
        break;

      case "UPDATE_BIO":
        await tx.serviceProvider.update({
          where: { id: request.providerId },
          data: { bio: changeData.bio as string },
        });
        break;
    }

    // Mark request as approved
    await tx.providerChangeRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        adminNote,
      },
    });
  });
}

// Reject a change request
export async function rejectChangeRequest(
  requestId: string,
  adminUserId: string,
  adminNote?: string
) {
  const request = await prisma.providerChangeRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("Change request not found");
  }

  if (request.status !== "PENDING") {
    throw new Error("Change request is not pending");
  }

  return prisma.providerChangeRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      reviewedBy: adminUserId,
      reviewedAt: new Date(),
      adminNote,
    },
  });
}

// Helper to get human-readable change type labels
export function getChangeTypeLabel(type: ProviderChangeType): string {
  const labels: Record<ProviderChangeType, string> = {
    ADD_CERTIFICATE: "Nytt sertifikat",
    UPDATE_CERTIFICATE: "Oppdater sertifikat",
    REMOVE_CERTIFICATE: "Fjern sertifikat",
    ADD_LANGUAGE: "Nytt språk",
    UPDATE_LANGUAGE: "Oppdater språk",
    REMOVE_LANGUAGE: "Fjern språk",
    UPDATE_POLICE_CHECK: "Politiattest",
    UPDATE_INSURANCE: "Forsikring",
    UPDATE_EDUCATION: "Utdanning",
    UPDATE_BIO: "Beskrivelse",
  };
  return labels[type];
}
