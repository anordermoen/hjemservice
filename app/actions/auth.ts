"use server";

import { signIn, signOut } from "@/lib/auth";
import { createUser, getUserByEmail, updatePassword, verifyPassword } from "@/lib/db/users";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export async function login(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: (formData.get("callbackUrl") as string) || "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Feil e-post eller passord" };
        default:
          return { error: "Noe gikk galt. Prøv igjen." };
      }
    }
    throw error;
  }
}

export async function register(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;

  // Validation
  if (!email || !password) {
    return { error: "E-post og passord er påkrevd" };
  }

  if (password.length < 8) {
    return { error: "Passordet må være minst 8 tegn" };
  }

  if (password !== confirmPassword) {
    return { error: "Passordene stemmer ikke overens" };
  }

  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { error: "En bruker med denne e-posten finnes allerede" };
  }

  try {
    await createUser({
      email,
      password,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phone: phone || undefined,
    });

    // Sign in the new user
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Kunne ikke opprette bruker. Prøv igjen." };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function changePassword(
  userId: string,
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword) {
    return { error: "Alle felt er påkrevd" };
  }

  if (newPassword.length < 8) {
    return { error: "Nytt passord må være minst 8 tegn" };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passordene stemmer ikke overens" };
  }

  // Verify current password
  const isValid = await verifyPassword(userId, currentPassword);
  if (!isValid) {
    return { error: "Nåværende passord er feil" };
  }

  try {
    await updatePassword(userId, newPassword);
    return { success: true };
  } catch (error) {
    console.error("Password change error:", error);
    return { error: "Kunne ikke endre passord. Prøv igjen." };
  }
}
