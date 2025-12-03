import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { getCategories } from "@/lib/db/categories";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HjemService - Tjenester som kommer hjem til deg",
  description:
    "Book frisør, renhold, håndverker og mer – enkelt og trygt. Verifiserte fagfolk kommer hjem til deg.",
  keywords: [
    "hjemmetjenester",
    "frisør hjemme",
    "renhold",
    "håndverker",
    "Oslo",
    "Norge",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html lang="nb">
      <body className={inter.className}>
        <SessionProvider>
          <div className="flex min-h-screen flex-col">
            <Header categories={categories} />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer categories={categories} />
            <MobileNav />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
