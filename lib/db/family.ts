import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const getFamilyMembers = cache(async (userId: string) => {
  const profile = await prisma.customerProfile.findUnique({
    where: { userId },
    include: {
      familyMembers: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return profile?.familyMembers ?? [];
});

export async function addFamilyMember(
  userId: string,
  data: {
    name: string;
    phone: string;
    relationship: string;
    street: string;
    postalCode: string;
    city: string;
  }
) {
  // Ensure customer profile exists
  let profile = await prisma.customerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    profile = await prisma.customerProfile.create({
      data: {
        userId,
        favoriteProviders: [],
      },
    });
  }

  return prisma.familyMember.create({
    data: {
      customerProfileId: profile.id,
      name: data.name,
      phone: data.phone,
      relationship: data.relationship,
      street: data.street,
      postalCode: data.postalCode,
      city: data.city,
    },
  });
}

export async function updateFamilyMember(
  id: string,
  userId: string,
  data: {
    name?: string;
    phone?: string;
    relationship?: string;
    street?: string;
    postalCode?: string;
    city?: string;
  }
) {
  // Verify ownership
  const member = await prisma.familyMember.findFirst({
    where: {
      id,
      customerProfile: {
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("Family member not found");
  }

  return prisma.familyMember.update({
    where: { id },
    data,
  });
}

export async function deleteFamilyMember(id: string, userId: string) {
  // Verify ownership
  const member = await prisma.familyMember.findFirst({
    where: {
      id,
      customerProfile: {
        userId,
      },
    },
  });

  if (!member) {
    throw new Error("Family member not found");
  }

  return prisma.familyMember.delete({
    where: { id },
  });
}
