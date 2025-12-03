"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  FileQuestion,
  Wallet,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/leverandor-portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leverandor-portal/oppdrag", label: "Oppdrag", icon: ClipboardList },
  { href: "/leverandor-portal/tilbud", label: "Tilbudsforespørsler", icon: FileQuestion },
  { href: "/leverandor-portal/kalender", label: "Kalender", icon: CalendarDays },
  { href: "/leverandor-portal/inntekt", label: "Inntekt", icon: Wallet },
  { href: "/leverandor-portal/profil", label: "Min profil", icon: User },
];

export default function ProviderPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/logg-inn?callbackUrl=" + encodeURIComponent(pathname));
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Check if user is a provider
  if (session?.user?.role !== "PROVIDER" && session?.user?.role !== "ADMIN") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">Ingen tilgang</h2>
            <p className="mb-6 text-muted-foreground">
              Denne siden er kun for registrerte leverandører.
            </p>
            <div className="flex gap-4">
              <Link href="/bli-leverandor">
                <Button>Bli leverandør</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Gå til forsiden</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Leverandørportal</h1>
        <p className="text-muted-foreground">
          Hei, {session?.user?.name}! Administrer din virksomhet på HjemService.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar navigation */}
        <aside className="w-full lg:w-64">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/leverandor-portal" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
