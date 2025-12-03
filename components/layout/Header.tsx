"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
}

interface HeaderProps {
  categories: Category[];
}

export function Header({ categories }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4" aria-label="Hovednavigasjon">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary" aria-hidden="true">
            <span className="text-lg font-bold text-primary-foreground">H</span>
          </div>
          <span className="text-xl font-bold">HjemService</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1">
                Tjenester
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {categories.map((category) => (
                <DropdownMenuItem key={category.slug} asChild>
                  <Link href={`/tjenester/${category.slug}`}>{category.name}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/tjenester" className="font-medium">
                  Se alle tjenester
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/bli-leverandor">
            <Button variant="ghost">Bli leverandør</Button>
          </Link>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex md:items-center md:gap-2">
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse bg-muted rounded" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || undefined} />
                    <AvatarFallback>
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline">{session.user.name || session.user.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {session.user.name || session.user.email}
                </div>
                <div className="px-2 pb-1.5 text-xs text-muted-foreground">
                  {session.user.email}
                </div>
                <DropdownMenuSeparator />
                {session.user.role === "PROVIDER" ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/leverandor-portal">
                        <User className="mr-2 h-4 w-4" />
                        Leverandørportal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/leverandor-portal/oppdrag">Mine oppdrag</Link>
                    </DropdownMenuItem>
                  </>
                ) : session.user.role === "ADMIN" ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <User className="mr-2 h-4 w-4" />
                        Admin panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/mine-sider">
                        <User className="mr-2 h-4 w-4" />
                        Min side
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/mine-sider/bestillinger">Mine bestillinger</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logg ut
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/logg-inn">
                <Button variant="ghost">Logg inn</Button>
              </Link>
              <Link href="/registrer">
                <Button>Registrer deg</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden rounded-md p-2.5 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <span className="sr-only">{mobileMenuOpen ? "Lukk meny" : "Åpne meny"}</span>
          {mobileMenuOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "md:hidden border-t",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="space-y-1 px-4 pb-6 pt-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <Link
            href="/tjenester"
            className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
            onClick={() => setMobileMenuOpen(false)}
          >
            Tjenester
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/tjenester/${category.slug}`}
              className="block rounded-md px-3 py-2 pl-6 text-sm text-muted-foreground hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              {category.name}
            </Link>
          ))}
          <Link
            href="/bli-leverandor"
            className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
            onClick={() => setMobileMenuOpen(false)}
          >
            Bli leverandør
          </Link>
          <div className="border-t pt-4 mt-4">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm font-medium">
                  {session.user.name || session.user.email}
                </div>
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-accent"
                >
                  Logg ut
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/logg-inn"
                  className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Logg inn
                </Link>
                <Link
                  href="/registrer"
                  className="block rounded-md px-3 py-2 text-base font-medium text-primary hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Registrer deg
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
