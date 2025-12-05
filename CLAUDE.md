# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HjemService is a Norwegian home services booking platform built as a Next.js web application. Users can book verified service providers (hairdressers, cleaners, handymen, electricians, plumbers, gardeners) who come to their home.

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

# Database
npm run db:migrate   # Prisma migrate dev
npm run db:push      # Sync schema to database
npm run db:seed      # Run seed.ts with demo data
npm run db:studio    # Open Prisma Studio for DB inspection
```

## Architecture

### Tech Stack
- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4
- **Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **Database:** PostgreSQL on Neon (serverless)
- **ORM:** Prisma
- **Auth:** NextAuth.js v5 (beta) with Prisma Adapter
- **File Storage:** Vercel Blob

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
  /db                   # Database access layer (users, providers, bookings, etc.)
  /prisma.ts            # Prisma client singleton
  /auth.ts              # NextAuth configuration
  /utils.ts             # Utility functions (cn, formatPrice, formatDate)

/prisma
  /schema.prisma        # Database schema
  /seed.ts              # Seed script for demo data

/types
  /index.ts             # TypeScript interfaces
```

### Database Schema

Key models in Prisma schema:
- **Auth:** User, Account, Session, VerificationToken
- **Business:** ServiceCategory, ServiceProvider, Service, Booking, Review
- **Provider:** ProviderSchedule, BlockedDate, Certificate, ProviderLanguage
- **Customer:** CustomerProfile, Address, FamilyMember
- **Other:** QuoteRequest, QuoteResponse, SupportTicket, Subscription

### Key Patterns

**Database Access:** All database functions are in `/lib/db/` and wrapped with React's `cache()` for request-level deduplication.

**Auth:** JWT-based sessions with credentials provider. Password hashing with bcrypt.

**Route Groups:** Auth pages use `(auth)` route group for shared layout patterns without affecting URL structure.

**Responsive Design:** Mobile-first approach. Use Tailwind's `sm:`, `md:`, `lg:` breakpoints. Mobile bottom navigation via `MobileNav` component.

**Norwegian Text:** All user-facing text is in Norwegian.

## Data Types

Core interfaces in `/types/index.ts`:
- `ServiceProvider` - Provider profile with services, availability, reviews
- `Booking` - Customer booking with services, address, payment
- `ServiceCategory` - Service categories (frisør, renhold, etc.)
- `User`, `Review`, `Address`, `Service`

## Styling

Uses CSS variables for theming (see `/app/globals.css`). Primary color is blue (#3B82F6). Always use `cn()` utility from `/lib/utils.ts` for conditional classes.

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - Neon pooled connection string
- `DATABASE_URL_UNPOOLED` - Neon direct connection (for migrations)
- `NEXTAUTH_SECRET` - Auth secret
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token
