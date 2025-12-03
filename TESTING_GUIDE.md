# HjemService Testing Guide

This guide covers how to manually test all implemented features in HjemService.

---

## Test Accounts

### Demo Customer
- **Email:** `kunde@demo.no`
- **Password:** `demo123`

### Demo Provider
- **Email:** `leverandor@demo.no`
- **Password:** `demo123`

### Demo Admin
- **Email:** `admin@demo.no`
- **Password:** `demo123`

---

## 1. Public Pages

### 1.1 Landing Page (`/`)
- [ ] Page loads with hero section and search form
- [ ] Service category grid displays 6 categories with icons
- [ ] "How it works" section shows 3 steps
- [ ] Featured providers carousel displays providers
- [ ] Income calculator works (select category, adjust slider)
- [ ] All navigation links work (header, footer)
- [ ] Mobile menu opens and closes correctly

### 1.2 All Services (`/tjenester`)
- [ ] All 6 service categories display
- [ ] Each category card links to correct category page
- [ ] Page is responsive on mobile

### 1.3 Service Category (`/tjenester/frisor`)
Test with any category (frisor, renhold, handverker, elektriker, rorlegger, hage):
- [ ] Category header displays correct name and description
- [ ] "Request quote" card appears
- [ ] Provider list loads with real providers
- [ ] Provider cards show: name, rating, services, areas, badges
- [ ] Clicking provider card opens provider profile
- [ ] Filter sidebar works (if providers exist with different attributes)

### 1.4 Provider Profile (`/leverandor/[id]`)
- [ ] Provider header shows name, business name, avatar
- [ ] Trust badges display (police check, insurance, experience, areas)
- [ ] "About" section shows bio
- [ ] Qualifications show languages, certificates, education
- [ ] Services table shows prices and duration
- [ ] Reviews section shows customer reviews with ratings
- [ ] Booking widget shows available dates
- [ ] "Book now" button works
- [ ] Mobile: sticky "Book" button at bottom

### 1.5 Static Pages
- [ ] About Us (`/om-oss`) - content displays
- [ ] Terms (`/vilkar`) - content displays
- [ ] Privacy (`/personvern`) - content displays
- [ ] Cookies (`/cookies`) - content displays
- [ ] Contact (`/kontakt`) - content displays

---

## 2. Authentication

### 2.1 Login (`/logg-inn`)
- [ ] Form displays with email and password fields
- [ ] Password show/hide toggle works
- [ ] Demo credentials are displayed
- [ ] Login with valid credentials redirects to dashboard
- [ ] Login with invalid credentials shows error
- [ ] "Register" link works
- [ ] "Become provider" link works

### 2.2 Register (`/registrer`)
- [ ] Form displays all fields (name, email, phone, password)
- [ ] Password strength indicator updates in real-time
- [ ] Terms checkbox is required
- [ ] Submit with valid data creates account and logs in
- [ ] Submit with existing email shows error
- [ ] Redirect to dashboard after registration

### 2.3 Become Provider (`/bli-leverandor`)
- [ ] Benefits section displays on left
- [ ] Form shows all fields
- [ ] Category dropdown works
- [ ] Experience dropdown works
- [ ] Submit creates provider account
- [ ] Redirects to provider portal

### 2.4 Logout (`/logg-ut`)
- [ ] Visiting page logs out user
- [ ] Redirects to home page
- [ ] User menu no longer shows logged-in state

---

## 3. Customer Features

**Login as:** `kunde@demo.no` / `demo123`

### 3.1 Customer Dashboard (`/mine-sider`)
- [ ] Welcome message shows customer name
- [ ] Upcoming bookings display (if any)
- [ ] Quick action cards display
- [ ] Navigation sidebar works
- [ ] All sidebar links navigate correctly

### 3.2 My Bookings (`/mine-sider/bestillinger`)
- [ ] Tabs show: Upcoming, Completed, Cancelled
- [ ] Tab counts update correctly
- [ ] Booking cards show service, provider, date, price
- [ ] Status badges display correctly
- [ ] "View details" opens booking detail
- [ ] Empty state shows when no bookings

### 3.3 Cancel Booking (`/mine-sider/bestillinger/[id]/kanseller`)
Requires an existing confirmed booking:
- [ ] Booking details display
- [ ] Cancellation fee calculation shown
- [ ] Warning displays if within 24 hours
- [ ] Cancel button confirms and cancels
- [ ] Redirects to confirmation page

### 3.4 Favorites (`/mine-sider/favoritter`)
- [ ] Saved providers display (if any)
- [ ] Provider cards show info
- [ ] "View profile" link works
- [ ] "Book" button works
- [ ] Empty state shows when no favorites

### 3.5 Family Members (`/mine-sider/familie`)
- [ ] "Add" button opens dialog
- [ ] Fill form: name, phone, relationship, address
- [ ] Submit adds member to list
- [ ] Member card shows all info
- [ ] Edit: click menu → "Rediger" → update info → save
- [ ] Delete: click menu → "Slett" → confirm → member removed
- [ ] Data persists after page refresh

### 3.6 Quote Requests (`/mine-sider/tilbud`)
- [ ] Quote requests list displays (if any)
- [ ] Request cards show title, category, status
- [ ] Provider responses display with prices
- [ ] "Accept" button on response works
- [ ] Empty state shows when no requests

### 3.7 Book from Quote (`/mine-sider/tilbud/[id]/bestill`)
Requires an accepted quote:
- [ ] Quote details display
- [ ] Date/time selection works
- [ ] Address selection works
- [ ] Confirm booking creates booking
- [ ] Redirects to confirmation

### 3.8 Support (`/mine-sider/hjelp`)
- [ ] FAQ section displays
- [ ] "New ticket" button opens dialog
- [ ] Fill form: category, subject, description
- [ ] Submit creates ticket
- [ ] Ticket appears in list
- [ ] Click ticket opens detail page

### 3.9 Ticket Detail (`/mine-sider/hjelp/[id]`)
- [ ] Ticket subject and status display
- [ ] Original message displays
- [ ] Response thread shows (if any)
- [ ] Reply form appears for open tickets
- [ ] Submit reply adds to thread
- [ ] "Close ticket" button works
- [ ] Closed tickets show as resolved

---

## 4. Booking Flow

**Login as:** `kunde@demo.no` / `demo123`

### 4.1 Start Booking (`/booking/[providerId]`)
Navigate from provider profile "Book now":
- [ ] Provider info displays
- [ ] Service selection dropdown works
- [ ] Select service updates price
- [ ] Date picker shows available dates
- [ ] Time slots display for selected date
- [ ] Select time slot

### 4.2 Complete Booking
- [ ] Address form appears (or saved address selection)
- [ ] Fill address: street, postal code, city
- [ ] Optional: floor, entry code, instructions
- [ ] Contact info: name, phone, email
- [ ] Notes field (optional)
- [ ] Payment method selection (Card/Vipps)
- [ ] Terms checkbox required
- [ ] Order summary shows correct totals
- [ ] Submit creates booking
- [ ] Redirects to confirmation

### 4.3 Confirmation (`/bekreftelse`)
- [ ] Success message displays
- [ ] Booking details correct
- [ ] Provider info displays
- [ ] "View my bookings" link works
- [ ] "Back to home" link works

---

## 5. Quote Request Flow

**Login as:** `kunde@demo.no` / `demo123`

### 5.1 Request Quote (`/tilbud/[category]`)
Navigate from service category page "Request quote":
- [ ] Category-specific questions display
- [ ] Fill out questions
- [ ] Description textarea works
- [ ] Photo upload works (optional)
- [ ] Preferred dates selection
- [ ] Provider selection (multi-select)
- [ ] Address input
- [ ] Submit creates quote request
- [ ] Confirmation message displays

### 5.2 View Responses
- [ ] Navigate to `/mine-sider/tilbud`
- [ ] Quote request shows in list
- [ ] Provider responses appear (when providers respond)
- [ ] Compare prices and messages
- [ ] Accept preferred quote
- [ ] Proceed to booking

---

## 6. Provider Features

**Login as:** `leverandor@demo.no` / `demo123`

### 6.1 Provider Dashboard (`/leverandor-portal`)
- [ ] Stats cards show: appointments, requests, earnings, rating
- [ ] Today's appointments list (if any)
- [ ] Pending bookings with accept/decline
- [ ] Navigation works

### 6.2 Bookings (`/leverandor-portal/oppdrag`)
- [ ] Tabs: Pending, Upcoming, Completed, Cancelled
- [ ] Booking cards show customer, service, date, address
- [ ] Accept booking changes status to confirmed
- [ ] Decline booking changes status
- [ ] View booking details
- [ ] Customer contact info visible

### 6.3 Quote Requests (`/leverandor-portal/tilbud`)
- [ ] Open quote requests in provider's category display
- [ ] Request details show: title, description, location
- [ ] "Respond" button opens form
- [ ] Fill: price, message, materials, valid until
- [ ] Submit creates response
- [ ] Response shows in request card

### 6.4 Calendar (`/leverandor-portal/kalender`)
- [ ] Calendar displays current month
- [ ] Bookings appear on calendar dates
- [ ] Click date shows bookings for that day
- [ ] Navigate between months
- [ ] Today indicator visible

### 6.5 Profile (`/leverandor-portal/profil`)
- [ ] Personal info form displays
- [ ] Edit name, email, phone
- [ ] Edit business name, bio
- [ ] Avatar upload works
- [ ] Services section shows current services
- [ ] Add new service works
- [ ] Edit service price/duration
- [ ] Delete service works
- [ ] Save changes persists data

### 6.6 Earnings (`/leverandor-portal/inntekt`)
- [ ] Earnings stats display
- [ ] This month vs last month comparison
- [ ] Recent transactions list
- [ ] Payout information displays
- [ ] Platform fee (15%) shown correctly

---

## 7. Admin Features

**Login as:** `admin@demo.no` / `demo123`

### 7.1 Admin Dashboard (`/admin`)
- [ ] Stats cards: users, providers, bookings today, revenue
- [ ] Pending approvals alert (if any)
- [ ] Quick approve/decline buttons work
- [ ] Navigation to other admin pages

### 7.2 Provider Approvals (`/admin/godkjenning`)
- [ ] Pending providers list displays
- [ ] Provider details show: name, email, categories, experience
- [ ] Qualifications visible
- [ ] "Approve" button approves provider
- [ ] "Decline" button removes provider
- [ ] Approved providers no longer appear
- [ ] Empty state when all approved

### 7.3 Support Management (`/admin/support`)
- [ ] All tickets display
- [ ] Tabs: Open, In Progress, Resolved
- [ ] Ticket counts update correctly
- [ ] Click "View details" opens dialog
- [ ] User info visible (email, phone)
- [ ] Conversation thread displays
- [ ] Reply form works
- [ ] Status dropdown changes status
- [ ] "Take ticket" assigns to admin
- [ ] "Reopen" button on resolved tickets

### 7.4 Statistics (`/admin/statistikk`)
- [ ] Overview stats with trends
- [ ] Category breakdown table
- [ ] Revenue per category
- [ ] Top providers list
- [ ] Platform fee calculations

---

## 8. Cross-Feature Tests

### 8.1 Complete Booking Journey
1. [ ] Customer browses services
2. [ ] Customer views provider profile
3. [ ] Customer books service
4. [ ] Provider sees pending booking
5. [ ] Provider accepts booking
6. [ ] Customer sees confirmed booking
7. [ ] (Simulate) Provider completes job
8. [ ] Customer leaves review
9. [ ] Review appears on provider profile

### 8.2 Complete Quote Journey
1. [ ] Customer requests quote
2. [ ] Provider receives quote request
3. [ ] Provider submits quote response
4. [ ] Customer views responses
5. [ ] Customer accepts quote
6. [ ] Customer books from quote
7. [ ] Booking created successfully

### 8.3 Support Journey
1. [ ] Customer creates support ticket
2. [ ] Admin sees ticket in dashboard
3. [ ] Admin takes ticket (assigns)
4. [ ] Admin responds
5. [ ] Customer sees response
6. [ ] Customer replies
7. [ ] Admin resolves ticket
8. [ ] Customer sees resolved status

### 8.4 Provider Onboarding
1. [ ] New user registers as provider
2. [ ] Provider profile created (pending)
3. [ ] Admin sees in approvals
4. [ ] Admin approves provider
5. [ ] Provider can receive bookings

---

## 9. Mobile Testing

Test on mobile device or browser dev tools (375px width):

### Navigation
- [ ] Hamburger menu appears
- [ ] Menu opens/closes smoothly
- [ ] All menu items accessible
- [ ] Menu closes on navigation

### Key Pages
- [ ] Landing page responsive
- [ ] Provider list scrolls properly
- [ ] Provider profile readable
- [ ] Booking form usable
- [ ] Dashboard navigation works
- [ ] Forms are touch-friendly

### Sticky Elements
- [ ] Booking widget sticky on provider page
- [ ] "Book now" footer on mobile

---

## 10. Error Handling

### Authentication
- [ ] Invalid login shows error message
- [ ] Session expiry redirects to login
- [ ] Protected pages redirect when not logged in

### Forms
- [ ] Required fields show validation
- [ ] Invalid email format rejected
- [ ] Invalid phone format rejected
- [ ] Server errors show user-friendly message

### Data
- [ ] Empty states show helpful messages
- [ ] Loading states display spinners
- [ ] 404 page for invalid routes

---

## 11. Data Persistence

Verify data persists after page refresh:
- [ ] User stays logged in
- [ ] Family members saved
- [ ] Bookings retain status
- [ ] Support tickets saved
- [ ] Provider profile changes saved
- [ ] Quote responses saved

---

## Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________
Device: ___________

Section | Passed | Failed | Notes
--------|--------|--------|------
Public Pages | /10 | |
Authentication | /4 | |
Customer Features | /9 | |
Booking Flow | /3 | |
Quote Flow | /2 | |
Provider Features | /6 | |
Admin Features | /4 | |
Cross-Feature | /4 | |
Mobile | /3 | |
Error Handling | /3 | |
Data Persistence | /1 | |

Total: ___/49

Critical Issues:
1.
2.

Minor Issues:
1.
2.
```

---

## Reporting Issues

When reporting bugs, include:
1. **Steps to reproduce** - exact clicks/actions
2. **Expected behavior** - what should happen
3. **Actual behavior** - what actually happened
4. **Screenshot** - if visual issue
5. **Browser/device** - Chrome, Safari, mobile, etc.
6. **Account used** - which test account
