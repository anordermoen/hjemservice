"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  CreditCard,
  Star,
  Languages,
  Shield,
  FileCheck,
  Building,
  KeyRound,
  StickyNote,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CategoryIcon } from "@/components/common/CategoryIcon";
import { TipList } from "@/components/common/InfoBox";
import { getQuoteRequestById, getQuoteResponsesByRequestId } from "@/lib/data/quotes";
import { categories } from "@/lib/data/categories";
import { formatPrice, formatDuration, formatDateWithYear } from "@/lib/utils";

interface BookingCompletionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookingCompletionPage({ params }: BookingCompletionPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const quoteRequest = getQuoteRequestById(id);
  const responses = quoteRequest ? getQuoteResponsesByRequestId(id) : [];
  const acceptedResponse = responses.find((r) => r.status === "accepted");
  const provider = acceptedResponse?.provider;
  const category = quoteRequest ? categories.find((c) => c.id === quoteRequest.categoryId) : null;

  // Form state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [address, setAddress] = useState({
    street: quoteRequest?.address.street || "",
    postalCode: quoteRequest?.address.postalCode || "",
    city: quoteRequest?.address.city || "",
    floor: "",
    entryCode: "",
    instructions: "",
  });
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"vipps" | "card">("vipps");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate available time slots
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00",
  ];

  // Generate next 14 days for date selection
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split("T")[0];
  });

  if (!quoteRequest || quoteRequest.status !== "accepted" || !acceptedResponse || !provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-bold mb-2">Tilbud ikke funnet</h1>
            <p className="text-muted-foreground mb-4">
              Dette tilbudet finnes ikke eller har ikke blitt akseptert ennå.
            </p>
            <Link href="/mine-sider/tilbud">
              <Button>Tilbake til mine tilbud</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fluentLanguages = provider.languages?.filter(
    (l) => l.proficiency === "morsmål" || l.proficiency === "flytende"
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Redirect to confirmation
    router.push("/bekreftelse");
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === tomorrow.toDateString()) {
      return "I morgen";
    }

    return date.toLocaleDateString("nb-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/mine-sider/tilbud"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake til mine tilbud
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {category && (
              <div className="rounded-full bg-primary/10 p-2">
                <CategoryIcon icon={category.icon} className="h-5 w-5 text-primary" />
              </div>
            )}
            <h1 className="text-2xl font-bold">Fullfør bestilling</h1>
          </div>
          <p className="text-muted-foreground">{quoteRequest.title}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Provider info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Valgt leverandør</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Link href={`/leverandor/${provider.userId}`}>
                      <Avatar className="h-14 w-14 hover:ring-2 hover:ring-primary transition-all">
                        <AvatarImage src={provider.user.avatarUrl} />
                        <AvatarFallback>
                          {provider.user.firstName[0]}
                          {provider.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/leverandor/${provider.userId}`} className="hover:underline">
                          <h3 className="font-semibold">
                            {provider.user.firstName} {provider.user.lastName}
                          </h3>
                        </Link>
                        {provider.verified && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      {provider.businessName && (
                        <p className="text-sm text-muted-foreground">{provider.businessName}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{provider.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({provider.reviewCount})</span>
                        </span>
                        {fluentLanguages.length > 0 && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Languages className="h-4 w-4" />
                            {fluentLanguages.map((l) => l.name).join(", ")}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
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
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Date selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Velg dato og tid
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Dato *</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableDates.slice(0, 6).map((date) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => setSelectedDate(date)}
                          className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                            selectedDate === date
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <p className="font-medium">{formatDateLabel(date)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(date).toLocaleDateString("nb-NO", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </button>
                      ))}
                    </div>
                    <details className="mt-2">
                      <summary className="text-sm text-primary cursor-pointer">
                        Vis flere datoer
                      </summary>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {availableDates.slice(6).map((date) => (
                          <button
                            key={date}
                            type="button"
                            onClick={() => setSelectedDate(date)}
                            className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                              selectedDate === date
                                ? "border-primary bg-primary/5"
                                : "hover:bg-muted/50"
                            }`}
                          >
                            <p className="font-medium">{formatDateLabel(date)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(date).toLocaleDateString("nb-NO", {
                                day: "numeric",
                                month: "short",
                              })}
                            </p>
                          </button>
                        ))}
                      </div>
                    </details>
                  </div>

                  <div>
                    <Label className="mb-2 block">Tidspunkt *</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 rounded-lg border text-sm text-center transition-colors ${
                            selectedTime === time
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Adresse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="street">Gateadresse *</Label>
                      <Input
                        id="street"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postnummer *</Label>
                      <Input
                        id="postalCode"
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        required
                        maxLength={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Sted *</Label>
                      <Input
                        id="city"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="floor" className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Etasje (valgfritt)
                      </Label>
                      <Input
                        id="floor"
                        placeholder="f.eks. 3. etasje"
                        value={address.floor}
                        onChange={(e) => setAddress({ ...address, floor: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="entryCode" className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        Portkode (valgfritt)
                      </Label>
                      <Input
                        id="entryCode"
                        placeholder="f.eks. 1234"
                        value={address.entryCode}
                        onChange={(e) => setAddress({ ...address, entryCode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instructions" className="flex items-center gap-2">
                      <StickyNote className="h-4 w-4" />
                      Instruksjoner for å finne frem (valgfritt)
                    </Label>
                    <Textarea
                      id="instructions"
                      placeholder="f.eks. Ringeklokke merket 'Hansen', inngang fra bakgården"
                      value={address.instructions}
                      onChange={(e) => setAddress({ ...address, instructions: e.target.value })}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact person */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Kontaktperson
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="recipientName">Navn *</Label>
                      <Input
                        id="recipientName"
                        placeholder="Fullt navn"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipientPhone">Telefon *</Label>
                      <Input
                        id="recipientPhone"
                        type="tel"
                        placeholder="+47 xxx xx xxx"
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Merknad til leverandør (valgfritt)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Er det noe leverandøren bør vite?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Betaling
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("vipps")}
                    className={`w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                      paymentMethod === "vipps" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "vipps" ? "border-primary" : "border-muted-foreground"
                    }`}>
                      {paymentMethod === "vipps" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="h-8 w-8 rounded bg-[#FF5B24] flex items-center justify-center text-white font-bold text-xs">
                      V
                    </div>
                    <div>
                      <p className="font-medium">Vipps</p>
                      <p className="text-sm text-muted-foreground">Betal enkelt med Vipps</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
                      paymentMethod === "card" ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "card" ? "border-primary" : "border-muted-foreground"
                    }`}>
                      {paymentMethod === "card" && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Kort</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard</p>
                    </div>
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Order summary sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Oppsummering</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium">{quoteRequest.title}</p>
                      <p className="text-sm text-muted-foreground">
                        ca. {formatDuration(acceptedResponse.estimatedDuration)}
                      </p>
                    </div>

                    {selectedDate && selectedTime && (
                      <div className="p-3 bg-muted/30 rounded-lg text-sm">
                        <p className="font-medium">{formatDateLabel(selectedDate)}</p>
                        <p className="text-muted-foreground">kl. {selectedTime}</p>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tjeneste</span>
                        <span>{formatPrice(acceptedResponse.price)}</span>
                      </div>
                      {acceptedResponse.materialsIncluded && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Materialer</span>
                          <span>Inkludert</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-between font-semibold text-lg">
                      <span>Totalt</span>
                      <span className="text-primary">{formatPrice(acceptedResponse.price)}</span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={!selectedDate || !selectedTime || !recipientName || !recipientPhone || isSubmitting}
                    >
                      {isSubmitting ? "Behandler..." : `Betal ${formatPrice(acceptedResponse.price)}`}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Du kan avbestille gratis inntil 24 timer før avtalt tid
                    </p>
                  </CardContent>
                </Card>

                <TipList
                  title="God å vite"
                  className="mt-4"
                  tips={[
                    "Leverandøren kontakter deg hvis noe er uklart",
                    "Du får bekreftelse på SMS og e-post",
                    "Betalingen trekkes først når tjenesten er utført",
                  ]}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
