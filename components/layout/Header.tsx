"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/data/categories";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                <DropdownMenuItem key={category.id} asChild>
                  <Link href={`/tjenester/${category.id}`}>{category.name}</Link>
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

          {/* Demo pages dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1">
                Demo
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/mine-sider">Min side (kunde)</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/mine-sider/bestillinger">Mine bestillinger</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/leverandor-portal">Leverandørportal</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/leverandor-portal/oppdrag">Oppdrag</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/leverandor-portal/kalender">Kalender</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin">Admin panel</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/bli-leverandor">
            <Button variant="ghost">Bli leverandør</Button>
          </Link>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex md:items-center md:gap-2">
          <Link href="/logg-inn">
            <Button variant="ghost">Logg inn</Button>
          </Link>
          <Link href="/registrer">
            <Button>Registrer deg</Button>
          </Link>
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
          "md:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="space-y-1 px-4 pb-4 pt-2">
          <Link
            href="/tjenester"
            className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
            onClick={() => setMobileMenuOpen(false)}
          >
            Tjenester
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/tjenester/${category.id}`}
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
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">Demo</p>
            <Link
              href="/mine-sider"
              className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Min side (kunde)
            </Link>
            <Link
              href="/mine-sider/bestillinger"
              className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Mine bestillinger
            </Link>
            <Link
              href="/leverandor-portal"
              className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Leverandørportal
            </Link>
            <Link
              href="/leverandor-portal/oppdrag"
              className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Oppdrag
            </Link>
            <Link
              href="/admin"
              className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin panel
            </Link>
          </div>
          <div className="border-t pt-4 mt-4">
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
          </div>
        </div>
      </div>
    </header>
  );
}
