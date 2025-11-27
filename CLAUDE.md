# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HjemService is a Norwegian home services booking platform built as a Next.js 14+ web application. Users can book verified service providers (hairdressers, cleaners, handymen, electricians, plumbers, gardeners) who come to their home.

**UI Language:** Norwegian (Bokmål)
**Code Language:** English

## Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Build
npm run build        # Production build
npm run start        # Start production server

# Lint
npm run lint         # Run ESLint
```

## Architecture

### Tech Stack
- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4
- **Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React

### Directory Structure
```
/app                    # Next.js App Router pages
  /(auth)               # Auth pages (login, register, become provider)
  /admin                # Admin panel
  /booking/[providerId] # Booking flow
  /leverandor/[id]      # Provider profiles
  /leverandor-portal    # Provider dashboard
  /mine-sider           # Customer dashboard
  /tjenester/[category] # Service category listings

/components
  /ui                   # shadcn/ui base components
  /layout               # Header, Footer, MobileNav
  /common               # Shared components (Rating, ProviderCard, ServiceCard)

/lib
  /data                 # Mock data (categories.ts, providers.ts)
  /utils.ts             # Utility functions (cn, formatPrice, formatDate)

/types
  /index.ts             # TypeScript interfaces
```

### Key Patterns

**Mock Data:** The app uses mock data from `/lib/data/` for demo purposes. Provider and category data is imported directly without API calls.

**Route Groups:** Auth pages use `(auth)` route group for shared layout patterns without affecting URL structure.

**Responsive Design:** Mobile-first approach. Use Tailwind's `sm:`, `md:`, `lg:` breakpoints. Mobile bottom navigation via `MobileNav` component.

**Norwegian Text:** All user-facing text is in Norwegian. See `tech-spec.md` for UI text reference.

## Data Types

Core interfaces in `/types/index.ts`:
- `ServiceProvider` - Provider profile with services, availability, reviews
- `Booking` - Customer booking with services, address, payment
- `ServiceCategory` - Service categories (frisør, renhold, etc.)
- `User`, `Review`, `Address`, `Service`

## Styling

Uses CSS variables for theming (see `/app/globals.css`). Primary color is blue (#3B82F6). Always use `cn()` utility from `/lib/utils.ts` for conditional classes.
