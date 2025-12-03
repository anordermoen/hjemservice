"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Calendar,
  User,
  ShoppingCart,
  Star,
  Languages,
  Shield,
  FileCheck,
  CheckCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { submitBooking } from "@/app/actions/booking";

interface ProviderService {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
}

interface ProviderLanguage {
  code: string;
  name: string;
  proficiency: string;
}

interface ProviderAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Provider {
  id: string;
  businessName: string | null;
  rating: number;
  reviewCount: number;
  verified: boolean;
  insurance: boolean;
  policeCheck: boolean;
  user: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
  services: ProviderService[];
  languages: ProviderLanguage[];
  availability: ProviderAvailability[];
}

interface UserAddress {
  id: string;
  label: string;
  street: string;
  postalCode: string;
  city: string;
  floor: string | null;
  entryCode: string | null;
  instructions: string | null;
}

interface UserProfile {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string;
  addresses: UserAddress[];
}

interface BookingClientProps {
  provider: Provider;
  userProfile: UserProfile | null;
}

const steps = [
  { id: 1, title: "Velg tjeneste", icon: ShoppingCart },
  { id: 2, title: "Velg tid", icon: Calendar },
  { id: 3, title: "Din informasjon", icon: User },
  { id: 4, title: "Betaling", icon: CreditCard },
];

export function BookingClient({ provider, userProfile }: BookingClientProps) {
  const router = useRouter();

  // Get default address (first one or empty)
  const defaultAddress = userProfile?.addresses?.[0];

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<ProviderService[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(defaultAddress?.id || null);
  const [formData, setFormData] = useState({
    name: userProfile ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() : "",
    phone: userProfile?.phone || "",
    street: defaultAddress?.street || "",
    postalCode: defaultAddress?.postalCode || "",
    city: defaultAddress?.city || "",
    floor: defaultAddress?.floor || "",
    entryCode: defaultAddress?.entryCode || "",
    instructions: defaultAddress?.instructions || "",
    bookingForOther: false,
    recipientName: "",
    recipientPhone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"vipps" | "card">("vipps");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Handle selecting a saved address
  const handleSelectAddress = (addressId: string) => {
    const address = userProfile?.addresses.find((a) => a.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setFormData((prev) => ({
        ...prev,
        street: address.street,
        postalCode: address.postalCode,
        city: address.city,
        floor: address.floor || "",
        entryCode: address.entryCode || "",
        instructions: address.instructions || "",
      }));
    }
  };

  const initials = `${provider.user.firstName?.[0] || ""}${provider.user.lastName?.[0] || ""}`;
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  // Build schedule from availability array
  const schedule = {
    sunday: provider.availability.filter((a) => a.dayOfWeek === 0).map((a) => ({ start: a.startTime, end: a.endTime })),
    monday: provider.availability.filter((a) => a.dayOfWeek === 1).map((a) => ({ start: a.startTime, end: a.endTime })),
    tuesday: provider.availability.filter((a) => a.dayOfWeek === 2).map((a) => ({ start: a.startTime, end: a.endTime })),
    wednesday: provider.availability.filter((a) => a.dayOfWeek === 3).map((a) => ({ start: a.startTime, end: a.endTime })),
    thursday: provider.availability.filter((a) => a.dayOfWeek === 4).map((a) => ({ start: a.startTime, end: a.endTime })),
    friday: provider.availability.filter((a) => a.dayOfWeek === 5).map((a) => ({ start: a.startTime, end: a.endTime })),
    saturday: provider.availability.filter((a) => a.dayOfWeek === 6).map((a) => ({ start: a.startTime, end: a.endTime })),
  };

  // Helper to get day name from date
  const getDayName = (date: Date): keyof typeof schedule => {
    const days: (keyof typeof schedule)[] = [
      "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
    ];
    return days[date.getDay()];
  };

  // Generate available dates (next 14 days)
  const availableDates: Date[] = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = getDayName(date);
    if (schedule[dayName]?.length > 0) {
      availableDates.push(date);
    }
  }

  // Generate time slots for selected date
  const getTimeSlots = () => {
    if (!selectedDate) return [];
    const dayName = getDayName(selectedDate);
    const daySchedule = schedule[dayName];
    if (!daySchedule || daySchedule.length === 0) return [];

    const slots: string[] = [];
    daySchedule.forEach((slot) => {
      const [startHour] = slot.start.split(":").map(Number);
      const [endHour] = slot.end.split(":").map(Number);
      for (let hour = startHour; hour < endHour; hour++) {
        slots.push(`${hour.toString().padStart(2, "0")}:00`);
        if (hour + 0.5 < endHour) {
          slots.push(`${hour.toString().padStart(2, "0")}:30`);
        }
      }
    });
    return slots;
  };

  const handleServiceToggle = (service: ProviderService) => {
    setSelectedServices((prev) =>
      prev.find((s) => s.id === service.id)
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service]
    );
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const result = await submitBooking({
        providerId: provider.id,
        services: selectedServices.map((s) => ({
          serviceId: s.id,
          name: s.name,
          price: s.price,
          duration: s.duration,
        })),
        scheduledDate: selectedDate.toISOString().split("T")[0],
        scheduledTime: selectedTime,
        address: {
          street: formData.street,
          postalCode: formData.postalCode,
          city: formData.city,
          floor: formData.floor || undefined,
          entryCode: formData.entryCode || undefined,
          instructions: formData.instructions || undefined,
        },
        savedAddressId: selectedAddressId,
        name: formData.name,
        phone: formData.phone,
        recipientName: formData.recipientName || undefined,
        recipientPhone: formData.recipientPhone || undefined,
        notes: formData.instructions || undefined,
        paymentMethod,
        bookingForOther: formData.bookingForOther,
      });

      if (!result.success) {
        setSubmitError(result.error || "Kunne ikke fullføre bestillingen");
        setIsSubmitting(false);
        return;
      }

      router.push("/bekreftelse");
    } catch {
      setSubmitError("Noe gikk galt. Prøv igjen.");
      setIsSubmitting(false);
    }
  };

  // Validation helpers
  const isValidPhone = (phone: string) => /^(\+47)?[0-9]{8}$/.test(phone.replace(/\s/g, ""));
  const isValidPostalCode = (code: string) => /^[0-9]{4}$/.test(code);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedServices.length > 0;
      case 2:
        return selectedDate && selectedTime;
      case 3:
        const phoneValid = isValidPhone(formData.phone);
        const postalValid = isValidPostalCode(formData.postalCode);
        const basicInfoValid = formData.name.trim().length >= 2 && formData.street.trim().length >= 3 && formData.city.trim().length >= 2;
        const recipientValid = !formData.bookingForOther || (formData.recipientName.trim().length >= 2 && isValidPhone(formData.recipientPhone));
        return basicInfoValid && phoneValid && postalValid && recipientValid;
      case 4:
        return termsAccepted;
      default:
        return false;
    }
  };

  const getValidationMessage = () => {
    if (currentStep === 3) {
      if (formData.name.trim().length < 2) return "Vennligst fyll inn navn";
      if (!isValidPhone(formData.phone)) return "Ugyldig telefonnummer (8 siffer)";
      if (formData.street.trim().length < 3) return "Vennligst fyll inn gateadresse";
      if (!isValidPostalCode(formData.postalCode)) return "Ugyldig postnummer (4 siffer)";
      if (formData.city.trim().length < 2) return "Vennligst fyll inn by/sted";
      if (formData.bookingForOther) {
        if (formData.recipientName.trim().length < 2) return "Vennligst fyll inn mottakers navn";
        if (!isValidPhone(formData.recipientPhone)) return "Ugyldig telefonnummer for mottaker";
      }
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href={`/leverandor/${provider.id}`}
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Tilbake til profil
      </Link>

      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      isActive && "border-primary bg-primary text-primary-foreground",
                      isCompleted && "border-primary bg-primary text-primary-foreground",
                      !isActive && !isCompleted && "border-muted-foreground/30"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 hidden text-xs sm:block",
                      isActive && "font-medium text-foreground",
                      !isActive && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 flex-1",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Step 1: Select services */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Velg tjeneste</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {provider.services.map((service) => {
                    const isSelected = selectedServices.find(
                      (s) => s.id === service.id
                    );
                    return (
                      <div
                        key={service.id}
                        className={cn(
                          "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors",
                          isSelected && "border-primary bg-primary/5"
                        )}
                        onClick={() => handleServiceToggle(service)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={!!isSelected}
                            onCheckedChange={() => handleServiceToggle(service)}
                          />
                          <div>
                            <h4 className="font-medium">{service.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Ca. {service.duration} min
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold">
                          {formatPrice(service.price)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Select date and time */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Velg tid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Label className="mb-3 block">Velg dato</Label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {availableDates.map((date, index) => {
                      const isSelected =
                        selectedDate?.toDateString() === date.toDateString();
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedTime(null);
                          }}
                          className={cn(
                            "rounded-lg border p-3 text-center transition-colors",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "hover:border-primary/50"
                          )}
                        >
                          <p className="text-xs">
                            {date.toLocaleDateString("nb-NO", {
                              weekday: "short",
                            })}
                          </p>
                          <p className="text-lg font-semibold">
                            {date.getDate()}
                          </p>
                          <p className="text-xs">
                            {date.toLocaleDateString("nb-NO", { month: "short" })}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <Label className="mb-3 block">Velg tidspunkt</Label>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {getTimeSlots().map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={cn(
                              "rounded-lg border p-2 text-sm transition-colors",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "hover:border-primary/50"
                            )}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Customer information */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Din informasjon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Navn</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Ditt fulle navn"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="Mobilnummer"
                      />
                    </div>
                  </div>

                  {/* Saved addresses selector */}
                  {userProfile && userProfile.addresses.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Lagrede adresser</Label>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.addresses.map((address) => (
                          <button
                            key={address.id}
                            type="button"
                            onClick={() => handleSelectAddress(address.id)}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-sm transition-colors",
                              selectedAddressId === address.id
                                ? "border-primary bg-primary/5"
                                : "hover:border-primary/50"
                            )}
                          >
                            <span className="font-medium">{address.label}</span>
                            <span className="text-muted-foreground ml-1">
                              - {address.street}, {address.city}
                            </span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(null);
                            setFormData((prev) => ({
                              ...prev,
                              street: "",
                              postalCode: "",
                              city: "",
                              floor: "",
                              entryCode: "",
                              instructions: "",
                            }));
                          }}
                          className={cn(
                            "rounded-lg border px-3 py-2 text-sm transition-colors",
                            selectedAddressId === null
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          )}
                        >
                          + Ny adresse
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="street">Gateadresse</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                      placeholder="Gate og husnummer"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="postalCode">Postnummer</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) =>
                          setFormData({ ...formData, postalCode: e.target.value })
                        }
                        placeholder="0000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Sted</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="By/sted"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="floor">Etasje/leilighet (valgfritt)</Label>
                      <Input
                        id="floor"
                        value={formData.floor}
                        onChange={(e) =>
                          setFormData({ ...formData, floor: e.target.value })
                        }
                        placeholder="F.eks. 3. etasje, leil. 12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="entryCode">Portkode (valgfritt)</Label>
                      <Input
                        id="entryCode"
                        value={formData.entryCode}
                        onChange={(e) =>
                          setFormData({ ...formData, entryCode: e.target.value })
                        }
                        placeholder="Kode til inngang"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instructions">
                      Spesielle behov/instruksjoner (valgfritt)
                    </Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) =>
                        setFormData({ ...formData, instructions: e.target.value })
                      }
                      placeholder="F.eks. parkering, tilgjengelighet, allergier..."
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bookingForOther"
                      checked={formData.bookingForOther}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          bookingForOther: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="bookingForOther">
                      Jeg bestiller for noen andre
                    </Label>
                  </div>

                  {formData.bookingForOther && (
                    <div className="grid gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="recipientName">Mottakers navn</Label>
                        <Input
                          id="recipientName"
                          value={formData.recipientName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recipientName: e.target.value,
                            })
                          }
                          placeholder="Navn på mottaker"
                        />
                      </div>
                      <div>
                        <Label htmlFor="recipientPhone">Mottakers telefon</Label>
                        <Input
                          id="recipientPhone"
                          type="tel"
                          value={formData.recipientPhone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recipientPhone: e.target.value,
                            })
                          }
                          placeholder="Mobilnummer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Betaling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <Label className="mb-3 block">Velg betalingsmåte</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("vipps")}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-lg border p-4 transition-colors",
                        paymentMethod === "vipps"
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      )}
                    >
                      <span className="text-lg font-semibold text-[#FF5B24]">
                        Vipps
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-lg border p-4 transition-colors",
                        paymentMethod === "card"
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      )}
                    >
                      <CreditCard className="h-5 w-5" />
                      <span className="font-medium">Kort</span>
                    </button>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                      setTermsAccepted(checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="terms" className="cursor-pointer">
                      Jeg godtar{" "}
                      <Link
                        href="/vilkar"
                        className="text-primary underline"
                      >
                        vilkårene
                      </Link>{" "}
                      og{" "}
                      <Link
                        href="/personvern"
                        className="text-primary underline"
                      >
                        personvernerklæringen
                      </Link>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation message */}
          {currentStep === 3 && getValidationMessage() && (
            <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {getValidationMessage()}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              aria-label="Gå tilbake til forrige steg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Tilbake
            </Button>

            {currentStep < 4 ? (
              <Button onClick={handleNext} disabled={!canProceed()} aria-label="Gå til neste steg">
                Neste
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting} aria-label="Bekreft og betal bestillingen">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Behandler...
                  </>
                ) : (
                  "Bekreft og betal"
                )}
              </Button>
            )}
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {submitError}
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Ordresammendrag</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Provider info */}
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Link href={`/leverandor/${provider.id}`}>
                    <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                      <AvatarImage
                        src={provider.user.avatarUrl || undefined}
                        alt={`${provider.user.firstName} ${provider.user.lastName}`}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/leverandor/${provider.id}`} className="hover:underline">
                        <p className="font-medium">
                          {provider.user.firstName} {provider.user.lastName}
                        </p>
                      </Link>
                      {provider.verified && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    {provider.businessName && (
                      <p className="text-sm text-muted-foreground truncate">
                        {provider.businessName}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{provider.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({provider.reviewCount})</span>
                    </div>
                  </div>
                </div>

                {/* Quick qualifications */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {provider.policeCheck && (
                    <Badge variant="outline" className="text-xs">
                      <FileCheck className="mr-1 h-3 w-3" />
                      Politiattest
                    </Badge>
                  )}
                  {provider.insurance && (
                    <Badge variant="outline" className="text-xs">
                      <Shield className="mr-1 h-3 w-3" />
                      Forsikret
                    </Badge>
                  )}
                </div>

                {/* Languages */}
                {provider.languages && provider.languages.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Languages className="h-3.5 w-3.5" />
                    {provider.languages
                      .filter((l) => l.proficiency === "morsmål" || l.proficiency === "flytende")
                      .map((l) => l.name)
                      .join(", ")}
                  </div>
                )}

                <Link href={`/leverandor/${provider.id}`} className="block mt-3">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    Se full profil
                  </Button>
                </Link>
              </div>

              <Separator className="my-4" />

              {/* Selected services */}
              {selectedServices.length > 0 ? (
                <div className="space-y-2">
                  {selectedServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{service.name}</span>
                      <span>{formatPrice(service.price)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ingen tjenester valgt
                </p>
              )}

              {/* Date and time */}
              {selectedDate && selectedTime && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatDate(selectedDate)} kl. {selectedTime}
                    </span>
                  </div>
                </>
              )}

              {/* Total */}
              {selectedServices.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Totalt</span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Estimert tid: {totalDuration} min
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
