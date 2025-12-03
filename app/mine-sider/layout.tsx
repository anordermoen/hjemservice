"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Calendar,
  FileQuestion,
  Heart,
  Users,
  Settings,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/mine-sider", label: "Oversikt", icon: LayoutDashboard },
  { href: "/mine-sider/bestillinger", label: "Bestillinger", icon: Calendar },
  { href: "/mine-sider/tilbud", label: "Tilbudsforespørsler", icon: FileQuestion },
  { href: "/mine-sider/favoritter", label: "Favoritter", icon: Heart },
  { href: "/mine-sider/familie", label: "Familie", icon: Users },
  { href: "/mine-sider/hjelp", label: "Hjelp og support", icon: HelpCircle },
  { href: "/mine-sider/innstillinger", label: "Innstillinger", icon: Settings },
];

export default function DashboardLayout({
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mine sider</h1>
        <p className="text-muted-foreground">
          Hei, {session?.user?.name || session?.user?.email}! Administrer dine bestillinger og innstillinger.
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
                (item.href !== "/mine-sider" &&
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
