export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: "customer" | "provider" | "admin";
  createdAt: Date;
  avatarUrl?: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  postalCode: string;
  city: string;
  floor?: string;
  entryCode?: string;
  instructions?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  address: Address;
  relationship: string;
}

export interface CustomerProfile {
  userId: string;
  addresses: Address[];
  familyMembers: FamilyMember[];
  subscription?: Subscription;
  favoriteProviders: string[];
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface WeeklySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface Availability {
  schedule: WeeklySchedule;
  blockedDates: string[];
  leadTime: number;
}

export interface ServiceProvider {
  userId: string;
  businessName?: string;
  bio: string;
  categories: string[];
  services: Service[];
  areasServed: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  insurance: boolean;
  policeCheck: boolean;
  yearsExperience: number;
  availability: Availability;
  createdAt: Date;
  approvedAt?: Date;
  user: User;
}

export interface BookedService {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
}

export interface Cancellation {
  cancelledAt: Date;
  cancelledBy: "customer" | "provider";
  reason?: string;
  wasWithin24Hours: boolean;
  cancellationFee: number;
  feeRefunded: boolean;
  feeRefundedAt?: Date;
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  services: BookedService[];
  status: "pending" | "confirmed" | "completed" | "cancelled";
  scheduledAt: Date;
  address: Address;
  recipientName?: string;
  recipientPhone?: string;
  notes?: string;
  totalPrice: number;
  platformFee: number;
  providerPayout: number;
  paymentMethod: "vipps" | "card";
  paymentStatus: "pending" | "paid" | "refunded" | "partially_refunded";
  createdAt: Date;
  completedAt?: Date;
  cancellation?: Cancellation;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  customerName: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  plan: "monthly" | "yearly";
  status: "active" | "cancelled";
  discount: number;
  startedAt: Date;
  expiresAt: Date;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Quote request system
export interface QuoteQuestion {
  id: string;
  question: string;
  type: "text" | "textarea" | "select" | "number" | "photos";
  placeholder?: string;
  options?: string[];
  required: boolean;
  unit?: string;
}

export interface QuoteAnswer {
  questionId: string;
  answer: string | number | string[];
}

export interface QuoteRequest {
  id: string;
  customerId: string;
  categoryId: string;
  title: string;
  description: string;
  answers: QuoteAnswer[];
  photos?: string[];
  address: Address;
  preferredDates?: string[];
  status: "open" | "quoted" | "accepted" | "expired" | "cancelled";
  createdAt: Date;
  expiresAt: Date;
}

export interface QuoteResponse {
  id: string;
  quoteRequestId: string;
  providerId: string;
  provider?: ServiceProvider;
  price: number;
  estimatedDuration: number;
  materialsIncluded: boolean;
  materialsEstimate?: number;
  message: string;
  validUntil: Date;
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt: Date;
}
