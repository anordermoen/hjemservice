import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const getCategories = cache(async () => {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { name: "asc" },
  });
  return categories;
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const category = await prisma.serviceCategory.findUnique({
    where: { slug },
  });
  return category;
});

export const getCategoryById = cache(async (id: string) => {
  const category = await prisma.serviceCategory.findUnique({
    where: { id },
  });
  return category;
});
