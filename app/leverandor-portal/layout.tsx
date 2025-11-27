"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  FileQuestion,
  Wallet,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Leverandørportal</h1>
        <p className="text-muted-foreground">
          Administrer din virksomhet på HjemService
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
