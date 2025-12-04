import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

// Get user by ID
export const getUserById = cache(async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      providerProfile: true,
      customerProfile: {
        include: {
          addresses: true,
          subscription: true,
        },
      },
    },
  });
  return user;
});

// Get user by email
export const getUserByEmail = cache(async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
});

// Create a new user (registration)
export async function createUser(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
}) {
  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role || UserRole.CUSTOMER,
      // Create customer profile for customers
      ...((!data.role || data.role === UserRole.CUSTOMER) && {
        customerProfile: {
          create: {},
        },
      }),
    },
    include: {
      customerProfile: true,
    },
  });

  return user;
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  return user;
}

// Update password
export async function updatePassword(userId: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

// Verify password
export async function verifyPassword(
  userId: string,
  password: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) return false;

  return bcrypt.compare(password, user.passwordHash);
}

// Get customer profile with addresses
export const getCustomerProfile = cache(async (userId: string) => {
  const profile = await prisma.customerProfile.findUnique({
    where: { userId },
    include: {
      addresses: true,
      subscription: true,
      user: true,
    },
  });
  return profile;
});

// Add address to customer profile
export async function addAddress(
  userId: string,
  data: {
    label: string;
    street: string;
    postalCode: string;
    city: string;
    floor?: string;
    entryCode?: string;
    instructions?: string;
  }
) {
  // First ensure customer profile exists
  let profile = await prisma.customerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    profile = await prisma.customerProfile.create({
      data: { userId },
    });
  }

  const address = await prisma.address.create({
    data: {
      ...data,
      customerProfileId: profile.id,
    },
  });

  return address;
}

// Update address
export async function updateAddress(
  addressId: string,
  data: {
    label?: string;
    street?: string;
    postalCode?: string;
    city?: string;
    floor?: string;
    entryCode?: string;
    instructions?: string;
  }
) {
  const address = await prisma.address.update({
    where: { id: addressId },
    data,
  });
  return address;
}

// Delete address
export async function deleteAddress(addressId: string) {
  await prisma.address.delete({
    where: { id: addressId },
  });
}

// Toggle favorite provider
export async function toggleFavoriteProvider(
  userId: string,
  providerId: string
) {
  const profile = await prisma.customerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("Customer profile not found");
  }

  const isFavorite = profile.favoriteProviders.includes(providerId);

  await prisma.customerProfile.update({
    where: { userId },
    data: {
      favoriteProviders: isFavorite
        ? { set: profile.favoriteProviders.filter((id) => id !== providerId) }
        : { push: providerId },
    },
  });

  return !isFavorite;
}

// Get favorite providers for a customer
export const getFavoriteProviders = cache(async (userId: string) => {
  const profile = await prisma.customerProfile.findUnique({
    where: { userId },
    select: { favoriteProviders: true },
  });

  if (!profile || profile.favoriteProviders.length === 0) {
    return [];
  }

  const providers = await prisma.serviceProvider.findMany({
    where: {
      id: { in: profile.favoriteProviders },
    },
    include: {
      user: true,
      categories: true,
      services: true,
      languages: true,
    },
  });

  return providers;
});
