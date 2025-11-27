"use client";

import { useState, use } from "react";
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
import { getProviderById } from "@/lib/data/providers";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { Service } from "@/types";

interface BookingPageProps {
  params: Promise<{
    providerId: string;
  }>;
}

const steps = [
  { id: 1, title: "Velg tjeneste", icon: ShoppingCart },
  { id: 2, title: "Velg tid", icon: Calendar },
  { id: 3, title: "Din informasjon", icon: User },
  { id: 4, title: "Betaling", icon: CreditCard },
];

export default function BookingPage({ params }: BookingPageProps) {
  const { providerId } = use(params);
  const router = useRouter();
  const provider = getProviderById(providerId);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    postalCode: "",
    city: "",
    floor: "",
    entryCode: "",
    instructions: "",
    bookingForOther: false,
    recipientName: "",
    recipientPhone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"vipps" | "card">("vipps");
  const [termsAccepted, setTermsAccepted] = useState(false);

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Leverandør ikke funnet</p>
      </div>
    );
  }

  const initials = `${provider.user.firstName[0]}${provider.user.lastName[0]}`;
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  // Helper to get day name from date
  const getDayName = (date: Date): keyof typeof provider.availability.schedule => {
    const days: (keyof typeof provider.availability.schedule)[] = [
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
    if (provider.availability.schedule[dayName]?.length > 0) {
      availableDates.push(date);
    }
  }

  // Generate time slots for selected date
  const getTimeSlots = () => {
    if (!selectedDate) return [];
    const dayName = getDayName(selectedDate);
    const schedule = provider.availability.schedule[dayName];
    if (!schedule || schedule.length === 0) return [];

    const slots: string[] = [];
    schedule.forEach((slot) => {
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

  const handleServiceToggle = (service: Service) => {
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

  const handleSubmit = () => {
    // In a real app, this would submit to an API
    router.push("/bekreftelse");
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
        href={`/leverandor/${providerId}`}
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
              <Button onClick={handleSubmit} disabled={!canProceed()} aria-label="Bekreft og betal bestillingen">
                Bekreft og betal
              </Button>
            )}
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Ordresammendrag</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Provider info */}
              <div className="mb-4 flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={provider.user.avatarUrl}
                    alt={`${provider.user.firstName} ${provider.user.lastName}`}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {provider.user.firstName} {provider.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {provider.businessName}
                  </p>
                </div>
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
