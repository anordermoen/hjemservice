# HjemService Database Implementation Plan

## Overview

Transform HjemService from mock data to a fully functional application with:
- **Database**: Vercel Postgres with Prisma ORM
- **Authentication**: NextAuth.js v5 (Auth.js)
- **File Storage**: Vercel Blob

---

## Phase 1: Database Setup

### 1.1 Install Dependencies
```bash
npm install @prisma/client @vercel/postgres
npm install -D prisma
```

### 1.2 Initialize Prisma
```bash
npx prisma init
```

### 1.3 Database Schema

Create `prisma/schema.prisma` with the following models:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_UNPOOLED")
}

// ============ AUTH MODELS (NextAuth) ============

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============ CORE MODELS ============

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  passwordHash  String?   // For email/password auth
  phone         String?
  firstName     String?
  lastName      String?
  role          UserRole  @default(CUSTOMER)
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts         Account[]
  sessions         Session[]
  providerProfile  ServiceProvider?
  customerProfile  CustomerProfile?
  bookingsAsCustomer Booking[]       @relation("CustomerBookings")
  reviews          Review[]
  quoteRequests    QuoteRequest[]
}

enum UserRole {
  CUSTOMER
  PROVIDER
  ADMIN
}

model ServiceCategory {
  id          String   @id @default(cuid())
  slug        String   @unique  // e.g., "frisor", "renhold"
  name        String             // e.g., "Frisør", "Renhold"
  icon        String
  description String
  createdAt   DateTime @default(now())

  // Relations
  services      Service[]
  providers     ServiceProvider[] @relation("ProviderCategories")
  quoteRequests QuoteRequest[]
}

model ServiceProvider {
  id              String   @id @default(cuid())
  userId          String   @unique
  businessName    String?
  bio             String
  areasServed     String[] // PostgreSQL array
  rating          Float    @default(0)
  reviewCount     Int      @default(0)
  verified        Boolean  @default(false)
  insurance       Boolean  @default(false)
  policeCheck     Boolean  @default(false)
  yearsExperience Int      @default(0)
  nationality     String?
  education       String?
  leadTime        Int      @default(24) // hours
  blockedDates    String[] // ISO date strings
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  approvedAt      DateTime?

  // Relations
  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  categories    ServiceCategory[] @relation("ProviderCategories")
  services      Service[]
  availability  ProviderSchedule[]
  languages     ProviderLanguage[]
  certificates  Certificate[]
  bookings      Booking[]
  reviews       Review[]
  quoteResponses QuoteResponse[]
}

model ProviderSchedule {
  id         String   @id @default(cuid())
  providerId String
  dayOfWeek  Int      // 0 = Sunday, 1 = Monday, etc.
  startTime  String   // "09:00"
  endTime    String   // "17:00"

  provider ServiceProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)

  @@unique([providerId, dayOfWeek, startTime])
}

model ProviderLanguage {
  id          String @id @default(cuid())
  providerId  String
  code        String // ISO 639-1: "no", "en", "pl"
  name        String // "Norsk", "English"
  proficiency String // "morsmål", "flytende", "god", "grunnleggende"

  provider ServiceProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)

  @@unique([providerId, code])
}

model Certificate {
  id         String    @id @default(cuid())
  providerId String
  name       String
  issuer     String
  year       Int
  verified   Boolean   @default(false)
  expiresAt  DateTime?

  provider ServiceProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)
}

model Service {
  id          String  @id @default(cuid())
  providerId  String
  categoryId  String
  name        String
  description String?
  price       Int     // Price in øre (cents)
  duration    Int     // Duration in minutes

  provider ServiceProvider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  category ServiceCategory @relation(fields: [categoryId], references: [id])
  bookingServices BookingService[]
}

model CustomerProfile {
  id               String   @id @default(cuid())
  userId           String   @unique
  favoriteProviders String[] // Provider IDs

  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  addresses    Address[]
  subscription Subscription?
}

model Address {
  id                String  @id @default(cuid())
  customerProfileId String?
  label             String  // "Hjemme", "Jobb"
  street            String
  postalCode        String
  city              String
  floor             String?
  entryCode         String?
  instructions      String?

  customerProfile CustomerProfile? @relation(fields: [customerProfileId], references: [id], onDelete: Cascade)
  bookings        Booking[]
  quoteRequests   QuoteRequest[]
}

model Booking {
  id             String        @id @default(cuid())
  customerId     String
  providerId     String
  addressId      String
  recipientName  String?
  recipientPhone String?
  notes          String?
  status         BookingStatus @default(PENDING)
  scheduledAt    DateTime
  totalPrice     Int           // Price in øre
  platformFee    Int
  providerPayout Int
  paymentMethod  PaymentMethod
  paymentStatus  PaymentStatus @default(PENDING)
  createdAt      DateTime      @default(now())
  completedAt    DateTime?

  // Relations
  customer     User              @relation("CustomerBookings", fields: [customerId], references: [id])
  provider     ServiceProvider   @relation(fields: [providerId], references: [id])
  address      Address           @relation(fields: [addressId], references: [id])
  services     BookingService[]
  cancellation Cancellation?
  review       Review?
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  VIPPS
  CARD
}

enum PaymentStatus {
  PENDING
  PAID
  REFUNDED
  PARTIALLY_REFUNDED
}

model BookingService {
  id        String @id @default(cuid())
  bookingId String
  serviceId String
  name      String // Snapshot at booking time
  price     Int    // Snapshot at booking time
  duration  Int    // Snapshot at booking time

  booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  service Service @relation(fields: [serviceId], references: [id])
}

model Cancellation {
  id               String   @id @default(cuid())
  bookingId        String   @unique
  cancelledAt      DateTime @default(now())
  cancelledBy      String   // "customer" or "provider"
  reason           String?
  wasWithin24Hours Boolean
  cancellationFee  Int
  feeRefunded      Boolean  @default(false)
  feeRefundedAt    DateTime?

  booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
}

model Review {
  id           String   @id @default(cuid())
  bookingId    String   @unique
  customerId   String
  providerId   String
  rating       Int      // 1-5
  comment      String?
  customerName String   // Snapshot for display
  createdAt    DateTime @default(now())

  booking  Booking         @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  customer User            @relation(fields: [customerId], references: [id])
  provider ServiceProvider @relation(fields: [providerId], references: [id])
}

model Subscription {
  id                String             @id @default(cuid())
  customerProfileId String             @unique
  plan              SubscriptionPlan
  status            SubscriptionStatus @default(ACTIVE)
  discount          Int                // Percentage
  startedAt         DateTime           @default(now())
  expiresAt         DateTime

  customerProfile CustomerProfile @relation(fields: [customerProfileId], references: [id], onDelete: Cascade)
}

enum SubscriptionPlan {
  MONTHLY
  YEARLY
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
}

model QuoteRequest {
  id             String            @id @default(cuid())
  customerId     String
  categoryId     String
  addressId      String
  title          String
  description    String
  answers        Json              // Store as JSON array
  photos         String[]          // URLs
  preferredDates String[]          // ISO date strings
  status         QuoteRequestStatus @default(OPEN)
  createdAt      DateTime          @default(now())
  expiresAt      DateTime

  customer  User              @relation(fields: [customerId], references: [id])
  category  ServiceCategory   @relation(fields: [categoryId], references: [id])
  address   Address           @relation(fields: [addressId], references: [id])
  responses QuoteResponse[]
}

enum QuoteRequestStatus {
  OPEN
  QUOTED
  ACCEPTED
  EXPIRED
  CANCELLED
}

model QuoteResponse {
  id                String              @id @default(cuid())
  quoteRequestId    String
  providerId        String
  price             Int                 // Price in øre
  estimatedDuration Int                 // Minutes
  materialsIncluded Boolean             @default(false)
  materialsEstimate Int?
  message           String
  validUntil        DateTime
  status            QuoteResponseStatus @default(PENDING)
  createdAt         DateTime            @default(now())

  quoteRequest QuoteRequest    @relation(fields: [quoteRequestId], references: [id], onDelete: Cascade)
  provider     ServiceProvider @relation(fields: [providerId], references: [id])
}

enum QuoteResponseStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
}
```

### 1.4 Vercel Postgres Setup

1. Go to Vercel Dashboard → Storage → Create Database → Postgres
2. Copy connection strings to `.env.local`:
   ```
   DATABASE_URL="postgres://..."
   DATABASE_URL_UNPOOLED="postgres://..."
   ```

### 1.5 Run Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Phase 2: Authentication Setup

### 2.1 Install Auth.js
```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

### 2.2 Norwegian Identity Providers

**Option A: Criipto (Recommended)**
- Single integration for both Vipps Login and BankID
- OIDC-compliant, works with NextAuth.js
- Test environment available
- https://www.criipto.com/

**Option B: Direct Vipps Login**
- Vipps Login API directly
- Requires Vipps Merchant account
- Custom NextAuth provider needed

**For MVP**: Start with email/password + prepare for Vipps/BankID integration later (requires business accounts and agreements)

### 2.3 Create Auth Configuration

Create `lib/auth.ts`:
```typescript
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    // Email/Password for MVP
    Credentials({
      credentials: {
        email: { label: "E-post", type: "email" },
        password: { label: "Passord", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.passwordHash) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role
        }
      }
    }),
    // TODO: Add Criipto/Vipps provider when business accounts are ready
    // Criipto({
    //   clientId: process.env.CRIIPTO_CLIENT_ID,
    //   clientSecret: process.env.CRIIPTO_CLIENT_SECRET,
    //   issuer: process.env.CRIIPTO_DOMAIN,
    // })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      return session
    }
  },
  pages: {
    signIn: '/logg-inn',
    newUser: '/registrer',
  }
})
```

### 2.3 Create Auth API Routes

Create `app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

---

## Phase 3: File Storage Setup

### 3.1 Install Vercel Blob
```bash
npm install @vercel/blob
```

### 3.2 Create Upload API

Create `app/api/upload/route.ts` for handling file uploads.

### 3.3 Vercel Blob Setup

1. Go to Vercel Dashboard → Storage → Create Database → Blob
2. Copy token to `.env.local`:
   ```
   BLOB_READ_WRITE_TOKEN="vercel_blob_..."
   ```

---

## Phase 4: Data Access Layer

### 4.1 Create Prisma Client

Create `lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 4.2 Create Data Access Functions

Replace mock data imports with database queries:

```
lib/
  db/
    providers.ts    # getProviders, getProviderById, etc.
    bookings.ts     # createBooking, getBookingsByUser, etc.
    categories.ts   # getCategories, getCategoryBySlug
    quotes.ts       # createQuoteRequest, getQuoteResponses
    users.ts        # createUser, updateProfile
```

---

## Phase 5: API Routes

Create Server Actions or API routes for mutations:

```
app/
  api/
    auth/[...nextauth]/route.ts
    upload/route.ts
  actions/
    booking.ts      # createBooking, cancelBooking
    provider.ts     # updateProfile, updateServices
    quote.ts        # createQuoteRequest, respondToQuote
    review.ts       # createReview
```

---

## Phase 6: Seed Data

Create `prisma/seed.ts` to populate initial data:
- 6 service categories
- Sample providers (for demo)
- Quote question templates (keep in code as they're static)

---

## Phase 7: Update Components

Update pages to use database queries instead of mock data:

1. **Service category pages** (`/tjenester/[category]`)
2. **Provider profiles** (`/leverandor/[id]`)
3. **Booking flow** (`/booking/[providerId]`)
4. **Customer dashboard** (`/mine-sider`)
5. **Provider portal** (`/leverandor-portal`)
6. **Admin panel** (`/admin`)

---

## Environment Variables Required

```env
# Database (Vercel Postgres)
DATABASE_URL="postgres://..."
DATABASE_URL_UNPOOLED="postgres://..."

# Auth.js
AUTH_SECRET="generate-a-secret"
AUTH_URL="http://localhost:3000" # or production URL

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Vercel Blob
BLOB_READ_WRITE_TOKEN=""
```

---

## Implementation Order

1. **Phase 1**: Database setup + schema + migrations
2. **Phase 2**: Authentication (critical for user sessions)
3. **Phase 3**: File storage setup
4. **Phase 4**: Data access layer (replace mock data)
5. **Phase 5**: API routes / Server Actions
6. **Phase 6**: Seed data for development
7. **Phase 7**: Update components one by one

---

## Estimated Complexity

- **Database schema**: ~250 lines of Prisma schema
- **New files**: ~15-20 new files
- **Modified files**: ~30-40 files (replacing mock data imports)
- **Total scope**: Medium-large refactor

---

## Decisions Made

1. **Auth providers**: Email/password for MVP, Vipps Login + BankID later (via Criipto)
2. **Payments**: Mock for now, real integration later
3. **Migration**: All at once
4. **Database**: Vercel Postgres with Prisma
5. **File storage**: Vercel Blob

## Remaining Questions

1. **Email verification**: Required before booking?
2. **Admin seeding**: Create default admin user in seed script?
