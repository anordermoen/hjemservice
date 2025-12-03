# HjemService - Feature List

## Overview
HjemService is a Norwegian home services booking platform enabling customers to book verified service providers (hairdressers, cleaners, handymen, electricians, plumbers, gardeners) who come to their home.

---

## 1. Public Pages

| Page | Route | Status |
|------|-------|--------|
| Landing Page | `/` | Working |
| All Services | `/tjenester` | Working |
| Service Category | `/tjenester/[category]` | Working |
| Provider Profile | `/leverandor/[id]` | Working |
| About Us | `/om-oss` | Working |
| Terms of Service | `/vilkar` | Working |
| Privacy Policy | `/personvern` | Working |
| Cookies | `/cookies` | Working |
| Contact | `/kontakt` | Working |

### Landing Page Features
- Hero section with search form
- Service category grid (6 categories)
- "How it works" section
- Trust/safety badges
- Featured providers carousel
- Income calculator for providers
- Provider recruitment CTA

### Provider Profile Features
- Provider header with verification badges
- Trust badges (police check, insurance, experience, areas)
- Qualifications (languages, certificates, education)
- Services and pricing table
- Customer reviews with ratings
- Sticky booking widget

---

## 2. Authentication

| Feature | Route | Status |
|---------|-------|--------|
| Login | `/logg-inn` | Working |
| Register | `/registrer` | Working |
| Become Provider | `/bli-leverandor` | Working |
| Logout | `/logg-ut` | Working |

### Login Features
- Email/password authentication
- Demo credentials display
- Social login buttons (disabled - Vipps/BankID coming)

### Registration Features
- Personal info form
- Password strength indicator
- Terms acceptance
- Auto-login after registration

### Provider Registration Features
- Benefits showcase
- Requirements checklist
- Category and experience selection
- Bio/description

---

## 3. Customer Features

| Feature | Route | Status |
|---------|-------|--------|
| Dashboard | `/mine-sider` | Working |
| My Bookings | `/mine-sider/bestillinger` | Working |
| Cancel Booking | `/mine-sider/bestillinger/[id]/kanseller` | Working |
| Quote Requests | `/mine-sider/tilbud` | Working |
| Book from Quote | `/mine-sider/tilbud/[id]/bestill` | Working |
| Favorites | `/mine-sider/favoritter` | Working |
| Family | `/mine-sider/familie` | Working |
| Support | `/mine-sider/hjelp` | Working |
| Ticket Detail | `/mine-sider/hjelp/[id]` | Working |

### Dashboard Features
- Upcoming bookings preview
- Quick action cards
- Booking status indicators

### Booking Features
- Service selection
- Date/time picker
- Address management
- Payment method selection
- Cancellation with fee calculation (free >24h, 50% <24h)

### Quote Features
- Request quotes from providers
- View provider responses
- Compare prices
- Accept and book from quote

### Support Features
- Create support tickets
- View ticket history
- Conversation threading
- Close own tickets

---

## 4. Provider Features

| Feature | Route | Status |
|---------|-------|--------|
| Dashboard | `/leverandor-portal` | Working |
| Bookings | `/leverandor-portal/oppdrag` | Working |
| Quotes | `/leverandor-portal/tilbud` | Working |
| Calendar | `/leverandor-portal/kalender` | Working |
| Profile | `/leverandor-portal/profil` | Working |
| Earnings | `/leverandor-portal/inntekt` | Working |

### Dashboard Features
- Stats cards (appointments, requests, earnings, rating)
- Today's appointments
- Pending bookings with accept/decline

### Bookings Features
- Filter by status (pending, confirmed, completed, cancelled)
- Booking details with customer info
- Accept/decline actions

### Quotes Features
- View open quote requests
- Respond with pricing
- Track quote status

### Calendar Features
- Calendar view of bookings
- Availability management
- Block dates functionality

### Profile Features
- Personal info editing
- Avatar upload
- Services management
- Areas served
- Qualifications

### Earnings Features
- Monthly earnings stats
- Pending payout info
- Transaction history
- Platform fee breakdown (15%)

---

## 5. Admin Features

| Feature | Route | Status |
|---------|-------|--------|
| Dashboard | `/admin` | Working |
| Provider Approvals | `/admin/godkjenning` | Working |
| Support | `/admin/support` | Working |
| Statistics | `/admin/statistikk` | Working |

### Dashboard Features
- Overview stats (users, providers, bookings, revenue)
- Pending approvals alert
- Quick approve/decline

### Approvals Features
- Provider applications list
- Detailed provider info
- Approve/decline with guidelines

### Support Features
- All tickets view
- Filter by status/priority
- Respond to tickets
- Assign tickets
- Reopen resolved tickets

### Statistics Features
- Booking/revenue stats with trends
- Category breakdown
- Top providers ranking
- Platform fee tracking

---

## 6. Booking Flow

| Step | Route | Status |
|------|-------|--------|
| Select Provider | `/leverandor/[id]` | Working |
| Book Service | `/booking/[providerId]` | Working |
| Confirmation | `/bekreftelse` | Working |

### Booking Process
1. Browse providers or receive quote
2. Select service and date/time
3. Enter/select address
4. Choose payment method
5. Confirm booking
6. Receive confirmation

---

## 7. Quote Request Flow

| Step | Route | Status |
|------|-------|--------|
| Request Form | `/tilbud/[category]` | Working |
| View Responses | `/mine-sider/tilbud` | Working |
| Book from Quote | `/mine-sider/tilbud/[id]/bestill` | Working |

### Quote Process
1. Customer fills category-specific form
2. Selects providers to send request to
3. Providers receive and respond with pricing
4. Customer compares responses
5. Customer accepts preferred quote
6. Proceeds to booking

---

## 8. Core Systems

### Payment System
- Platform fee: 15%
- Provider payout: 85%
- Payment methods: Card, Vipps (placeholder)
- Cancellation fees enforced

### Review System
- 5-star ratings
- Text reviews
- Displayed on provider profiles
- Average rating calculation

### Verification System
- Police check badge
- Insurance verification
- Years of experience
- Language proficiency levels

### Notification System
- Email notifications (placeholder)
- SMS notifications (placeholder)

---

## 9. Service Categories

1. **Frisør** - Hairdressing at home
2. **Renhold** - Cleaning services
3. **Håndverker** - Handyman services
4. **Elektriker** - Electrical work
5. **Rørlegger** - Plumbing
6. **Hage** - Garden services

---

## 10. Implementation Status

### Fully Working
- All public pages
- Authentication (email/password)
- Customer dashboard & bookings
- Provider portal (all features)
- Admin panel (all features)
- Quote request system
- Review system
- Support ticket system

### Placeholder/Coming Soon
- Payment processing (Stripe/Vipps)
- Email/SMS notifications
- Vipps/BankID authentication
- Password reset

---

## 11. Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: NextAuth.js
- **Icons**: Lucide React
