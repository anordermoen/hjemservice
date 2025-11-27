# HjemService – Technical Project Specification

## Project Overview

**Product:** HjemService – A web-based platform for booking home services in Norway
**Type:** Responsive web application (mobile-first)
**Purpose:** Product demo / MVP prototype
**Language:** Norwegian (Bokmål) for UI, English for code

---

## Core Concept

HjemService connects Norwegian customers with verified service providers who come to their home. The platform focuses on accessibility for elderly users, people with disabilities, and busy families.

**Key differentiator:** Everything happens at the customer's home – not at a salon or workshop.

---

## Tech Stack (Recommended)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Icons | Lucide React |
| State | React hooks / Zustand (if needed) |
| Database | Supabase (PostgreSQL) or mock data for demo |
| Auth | Supabase Auth or NextAuth (optional for demo) |
| Deployment | Vercel |

---

## User Roles

### 1. Customer (Kunde)
- Browse and search services
- View service provider profiles
- Book appointments
- Pay via platform
- Rate and review
- Manage bookings
- Book on behalf of others (family members)

### 2. Service Provider (Tjenesteyter)
- Create profile
- Set services and prices
- Manage availability/calendar
- Accept/decline bookings
- View earnings
- Receive payments

### 3. Admin
- Approve/reject service providers
- View statistics
- Handle support tickets
- Manage categories and pricing rules

---

## Site Structure

```
/                       → Landing page (home)
/tjenester              → Service category listing
/tjenester/[category]   → Service providers in category
/leverandor/[id]        → Service provider profile
/booking/[providerId]   → Booking flow
/bekreftelse            → Booking confirmation
/mine-sider             → Customer dashboard
/mine-sider/bestillinger → Booking history
/mine-sider/favoritter  → Saved providers
/mine-sider/familie     → Book for family members

/leverandor-portal      → Service provider dashboard
/leverandor-portal/oppdrag → Manage bookings
/leverandor-portal/kalender → Availability calendar
/leverandor-portal/inntekt → Earnings overview
/leverandor-portal/profil → Edit profile

/admin                  → Admin dashboard
/admin/godkjenning      → Approve providers
/admin/statistikk       → Platform statistics

/logg-inn               → Login page
/registrer              → Registration (customer)
/bli-leverandor         → Registration (service provider)
```

---

## Page Specifications

### 1. Landing Page (`/`)

**Purpose:** Convert visitors to users, explain the service

**Sections:**
1. **Hero**
   - Headline: "Tjenester som kommer hjem til deg"
   - Subheadline: "Book frisør, renhold, håndverker og mer – enkelt og trygt"
   - Search bar with location input
   - CTA button: "Finn tjenester"

2. **Service Categories**
   - Grid of 6 category cards with icons:
     - Frisør (Scissors icon)
     - Renhold (Sparkles icon)
     - Håndverker (Hammer icon)
     - Elektriker (Zap icon)
     - Rørlegger (Wrench icon)
     - Hage (Leaf icon)

3. **How It Works**
   - 3-step visual:
     1. "Finn tjeneste" – Søk og sammenlign
     2. "Book tid" – Velg dato og klokkeslett
     3. "Betal enkelt" – Vipps eller kort

4. **Trust Section**
   - "Verifiserte fagfolk" – Politiattest og forsikring
   - "Trygg betaling" – Betaling via plattformen
   - "Kvalitetsgaranti" – Vurderinger fra ekte kunder

5. **Featured Providers**
   - Carousel of top-rated providers

6. **CTA Section**
   - "Er du fagperson? Bli leverandør" → Link to /bli-leverandor

7. **Footer**
   - Links: Om oss, Kontakt, Personvern, Vilkår
   - Contact info

---

### 2. Service Category Page (`/tjenester/[category]`)

**Purpose:** Show available providers in a category

**Components:**
- **Filters (sidebar on desktop, drawer on mobile)**
  - Sted (location) – text input or dropdown
  - Dato – date picker
  - Pris – range slider
  - Vurdering – minimum stars
  - Tilgjengelighet – "Ledig i dag", "Ledig denne uken"

- **Provider Cards (grid)**
  - Profile photo
  - Name
  - Verified badge (checkmark)
  - Rating (stars + number)
  - Starting price ("Fra kr 599")
  - Short description
  - "Se profil" button

- **Map View Toggle**
  - Switch between list and map view
  - Map shows provider locations

- **Sorting**
  - Anbefalt, Pris lav-høy, Pris høy-lav, Best vurdert, Nærmest

---

### 3. Service Provider Profile (`/leverandor/[id]`)

**Purpose:** Show detailed info, build trust, enable booking

**Sections:**
1. **Header**
   - Large profile photo
   - Name
   - Badges: "Verifisert", "Forsikret", "X års erfaring"
   - Rating with review count
   - Location/areas served

2. **About**
   - Bio text
   - Specialties

3. **Services & Prices**
   - Table/list of services with prices:
     ```
     Herreklipp           kr 450
     Dameklipp            kr 550
     Klipp + farge        kr 1 200
     ```
   - "Tillegg for hjemmebesøk: kr 100" (if applicable)

4. **Availability**
   - Calendar showing available dates
   - Next available slot highlighted

5. **Reviews**
   - Average rating
   - Review breakdown (5-star, 4-star, etc.)
   - Individual reviews with:
     - Customer name (first name only)
     - Date
     - Rating
     - Comment

6. **Booking CTA**
   - Sticky button on mobile: "Book nå"
   - Sidebar booking widget on desktop

---

### 4. Booking Flow (`/booking/[providerId]`)

**Purpose:** Complete a booking in minimal steps

**Multi-step form:**

**Step 1: Velg tjeneste**
- List of provider's services with checkboxes
- Running total at bottom

**Step 2: Velg tid**
- Calendar date picker
- Available time slots for selected date
- If no availability: "Ingen ledige tider denne dagen"

**Step 3: Din informasjon**
- Name (pre-filled if logged in)
- Phone number
- Address (street, postal code, city)
- Floor/apartment number
- Entry instructions (door code, etc.)
- Special needs/notes (accessibility, parking, etc.)
- Toggle: "Jeg bestiller for noen andre" → Shows additional fields for recipient

**Step 4: Betaling**
- Order summary
- Payment method selection:
  - Vipps
  - Kort (card)
- Checkbox: Terms acceptance
- "Bekreft og betal" button

**Confirmation page (`/bekreftelse`):**
- Success message
- Booking details
- Add to calendar button
- "Se mine bestillinger" link

---

### 5. Customer Dashboard (`/mine-sider`)

**Purpose:** Manage bookings and account

**Tabs/Sections:**
1. **Oversikt** (Overview)
   - Upcoming bookings (next 3)
   - Quick actions

2. **Mine bestillinger**
   - Upcoming (with cancel option if > 24h away)
   - Completed (with "Book igjen" and "Gi vurdering" buttons)
   - Cancelled

3. **Favoritter**
   - Saved providers

4. **Familie**
   - Add family members (name, address, phone)
   - Book on their behalf
   - View their booking history

5. **Innstillinger**
   - Profile info
   - Notification preferences
   - Payment methods
   - Abonnement (subscription status)

---

### 6. Service Provider Portal (`/leverandor-portal`)

**Purpose:** Manage business operations

**Sections:**
1. **Dashboard**
   - Today's appointments
   - Pending requests
   - Earnings this month
   - Rating summary

2. **Oppdrag** (Bookings)
   - Incoming requests (accept/decline)
   - Confirmed upcoming
   - Completed
   - Cancelled

3. **Kalender**
   - Weekly/monthly view
   - Set availability
   - Block dates

4. **Inntekt** (Earnings)
   - Transaction history
   - Pending payouts
   - Payout schedule
   - Download reports

5. **Min profil**
   - Edit bio, photo
   - Manage services and prices
   - Areas served
   - Documents (certificates, insurance)

---

### 7. Admin Panel (`/admin`)

**Purpose:** Platform management

**Sections:**
1. **Dashboard**
   - Key metrics: bookings today, revenue, new users
   - Alerts (pending approvals, support tickets)

2. **Godkjenning** (Approvals)
   - Pending provider applications
   - View documents, approve/reject

3. **Brukere** (Users)
   - Customer list
   - Provider list
   - Search and filter

4. **Bestillinger** (Bookings)
   - All bookings
   - Filter by status, date, category

5. **Statistikk**
   - Charts: bookings over time, revenue, popular categories
   - Provider performance

---

## Component Library

### Common Components

```
Button          - Primary, secondary, outline, ghost variants
Input           - Text, email, phone, with validation
Select          - Dropdown with search
DatePicker      - Calendar for date selection
TimePicker      - Time slot selection
Card            - Service card, provider card, booking card
Avatar          - User/provider photos
Badge           - Verified, status indicators
Rating          - Star display and input
Modal           - Confirmations, forms
Drawer          - Mobile navigation, filters
Toast           - Notifications
Tabs            - Navigation within pages
Stepper         - Multi-step forms
Calendar        - Availability display
Map             - Provider locations (optional for demo)
```

### Layout Components

```
Header          - Logo, navigation, user menu
MobileNav       - Bottom navigation for mobile
Sidebar         - Dashboard navigation
Footer          - Links, contact info
Container       - Max-width wrapper
```

---

## Design System

### Colors

```css
/* Primary */
--primary: #3B82F6;        /* Blue */
--primary-hover: #2563EB;
--primary-light: #EFF6FF;

/* Neutral */
--background: #FFFFFF;
--foreground: #0F172A;
--muted: #F1F5F9;
--muted-foreground: #64748B;
--border: #E2E8F0;

/* Semantic */
--success: #22C55E;
--warning: #F59E0B;
--error: #EF4444;

/* Accessibility */
--focus-ring: #3B82F6;
```

### Typography

```css
/* Font */
font-family: 'Inter', system-ui, sans-serif;

/* Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Spacing

```css
/* Use Tailwind defaults: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 */
```

### Accessibility Requirements

- Minimum touch target: 44x44px (48px preferred)
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Focus indicators on all interactive elements
- Keyboard navigation support
- Screen reader friendly (proper ARIA labels)
- Font size: minimum 16px base, option to increase
- No information conveyed by color alone

---

## Data Models

### User

```typescript
interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'provider' | 'admin';
  createdAt: Date;
  avatarUrl?: string;
}
```

### Customer Profile

```typescript
interface CustomerProfile {
  userId: string;
  addresses: Address[];
  familyMembers: FamilyMember[];
  subscription?: Subscription;
  favoriteProviders: string[];
}

interface Address {
  id: string;
  label: string;        // "Hjemme", "Mamma"
  street: string;
  postalCode: string;
  city: string;
  floor?: string;
  entryCode?: string;
  instructions?: string;
}

interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  address: Address;
  relationship: string; // "Mor", "Far", "Bestemor"
}
```

### Service Provider

```typescript
interface ServiceProvider {
  userId: string;
  businessName?: string;
  bio: string;
  categories: string[];
  services: Service[];
  areasServed: string[];     // Postal codes or areas
  rating: number;
  reviewCount: number;
  verified: boolean;
  insurance: boolean;
  policeCheck: boolean;
  yearsExperience: number;
  availability: Availability;
  createdAt: Date;
  approvedAt?: Date;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;          // minutes
  category: string;
}

interface Availability {
  schedule: WeeklySchedule;
  blockedDates: string[];    // ISO dates
  leadTime: number;          // hours before booking
}

interface WeeklySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  // ... etc
}

interface TimeSlot {
  start: string;  // "09:00"
  end: string;    // "17:00"
}
```

### Booking

```typescript
interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  services: BookedService[];
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledAt: Date;
  address: Address;
  recipientName?: string;    // If booking for someone else
  recipientPhone?: string;
  notes?: string;
  totalPrice: number;
  platformFee: number;
  providerPayout: number;
  paymentMethod: 'vipps' | 'card';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: Date;
  completedAt?: Date;
}

interface BookedService {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
}
```

### Review

```typescript
interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;           // 1-5
  comment?: string;
  createdAt: Date;
}
```

### Subscription

```typescript
interface Subscription {
  id: string;
  customerId: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'cancelled';
  discount: number;         // 10 = 10%
  startedAt: Date;
  expiresAt: Date;
}
```

---

## Mock Data

For the demo, create realistic Norwegian mock data:

### Service Categories

```typescript
const categories = [
  { id: 'frisor', name: 'Frisør', icon: 'scissors', description: 'Klipp, farge og styling hjemme' },
  { id: 'renhold', name: 'Renhold', icon: 'sparkles', description: 'Husvask og rengjøring' },
  { id: 'handverker', name: 'Håndverker', icon: 'hammer', description: 'Montering og reparasjoner' },
  { id: 'elektriker', name: 'Elektriker', icon: 'zap', description: 'Elektrisk arbeid' },
  { id: 'rorlegger', name: 'Rørlegger', icon: 'wrench', description: 'VVS og rørarbeid' },
  { id: 'hage', name: 'Hage', icon: 'leaf', description: 'Hagearbeid og vedlikehold' },
];
```

### Sample Providers

Create 3-5 providers per category with:
- Norwegian names
- Oslo-area locations
- Realistic prices
- Sample reviews

---

## Development Phases

### Phase 1: Core Structure
- [ ] Project setup (Next.js, Tailwind, shadcn/ui)
- [ ] Layout components (Header, Footer, Navigation)
- [ ] Landing page
- [ ] Service category page (with mock data)

### Phase 2: Provider & Booking
- [ ] Provider profile page
- [ ] Booking flow (multi-step form)
- [ ] Confirmation page

### Phase 3: User Dashboards
- [ ] Customer dashboard
- [ ] Service provider portal
- [ ] Login/registration pages

### Phase 4: Polish
- [ ] Admin panel (basic)
- [ ] Mobile optimization
- [ ] Accessibility review
- [ ] Animation and transitions

---

## File Structure

```
/app
  /page.tsx                    # Landing page
  /layout.tsx                  # Root layout
  /globals.css
  
  /(auth)
    /logg-inn/page.tsx
    /registrer/page.tsx
    /bli-leverandor/page.tsx
  
  /tjenester
    /page.tsx                  # All categories
    /[category]/page.tsx       # Category listing
  
  /leverandor
    /[id]/page.tsx             # Provider profile
  
  /booking
    /[providerId]/page.tsx     # Booking flow
  
  /bekreftelse/page.tsx        # Confirmation
  
  /mine-sider
    /page.tsx                  # Dashboard
    /bestillinger/page.tsx
    /favoritter/page.tsx
    /familie/page.tsx
  
  /leverandor-portal
    /page.tsx
    /oppdrag/page.tsx
    /kalender/page.tsx
    /inntekt/page.tsx
    /profil/page.tsx
  
  /admin
    /page.tsx
    /godkjenning/page.tsx
    /statistikk/page.tsx

/components
  /ui                          # shadcn components
  /layout
    Header.tsx
    Footer.tsx
    MobileNav.tsx
    Sidebar.tsx
  /features
    /booking
    /provider
    /dashboard
  /common
    ServiceCard.tsx
    ProviderCard.tsx
    BookingCard.tsx
    Rating.tsx

/lib
  /data                        # Mock data
  /utils                       # Helper functions
  /hooks                       # Custom hooks

/types
  index.ts                     # TypeScript interfaces
```

---

## Notes for AI Assistant

1. **Always use Norwegian** for all user-facing text (labels, buttons, headings, placeholder text)

2. **Prioritize mobile design** – design for 375px width first, then scale up

3. **Keep accessibility in mind** – large touch targets, good contrast, semantic HTML

4. **Use realistic data** – Norwegian names, Oslo addresses, NOK prices

5. **Keep the code clean** – proper TypeScript types, consistent formatting

6. **Focus on the happy path** – for demo purposes, don't over-engineer error handling

7. **Make it feel real** – subtle animations, loading states, proper feedback

---

## Quick Reference: Norwegian UI Text

```
Finn tjenester          Find services
Book nå                 Book now
Se profil               View profile
Velg tjeneste           Select service
Velg tid                Select time
Bekreft og betal        Confirm and pay
Mine bestillinger       My bookings
Logg inn                Log in
Registrer deg           Sign up
Søk                     Search
Filtrer                 Filter
Sorter etter            Sort by
Pris                    Price
Vurdering               Rating
Tilgjengelighet         Availability
Ledig i dag             Available today
Verifisert              Verified
Forsikret               Insured
Politiattest            Police check
Fra kr                  From NOK
Legg til                Add
Avbryt                  Cancel
Lagre                   Save
Neste                   Next
Tilbake                 Back
Ferdig                  Done
```

---

*This specification should give the AI enough context to build a comprehensive, realistic demo of the HjemService platform.*