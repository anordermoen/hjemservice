"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Upload,
  Info,
  CheckCircle,
  FileCheck,
  Shield,
  Star,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rating } from "@/components/common/Rating";
import { categories } from "@/lib/data/categories";
import { getProvidersByCategory } from "@/lib/data/providers";
import { getQuestionsForCategory } from "@/lib/data/quote-questions";
import { QuoteQuestion, ServiceProvider } from "@/types";

type Step = "details" | "providers" | "submitted";

interface Preferences {
  requireVerified: boolean;
  requirePoliceCheck: boolean;
  requireInsurance: boolean;
  minRating: number;
  minExperience: number;
}

export default function QuoteRequestPage() {
  const params = useParams();
  const categoryId = params.category as string;

  const category = categories.find((c) => c.id === categoryId);
  const questions = getQuestionsForCategory(categoryId);
  const allProviders = getProvidersByCategory(categoryId);

  // Form state
  const [step, setStep] = useState<Step>("details");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [address, setAddress] = useState({
    street: "",
    postalCode: "",
    city: "",
  });
  const [preferredDate, setPreferredDate] = useState("");

  // Provider selection state
  const [preferences, setPreferences] = useState<Preferences>({
    requireVerified: false,
    requirePoliceCheck: false,
    requireInsurance: false,
    minRating: 0,
    minExperience: 0,
  });
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter providers based on preferences
  const filteredProviders = useMemo(() => {
    return allProviders.filter((provider) => {
      if (preferences.requireVerified && !provider.verified) return false;
      if (preferences.requirePoliceCheck && !provider.policeCheck) return false;
      if (preferences.requireInsurance && !provider.insurance) return false;
      if (preferences.minRating > 0 && provider.rating < preferences.minRating) return false;
      if (preferences.minExperience > 0 && provider.yearsExperience < preferences.minExperience) return false;
      return true;
    });
  }, [allProviders, preferences]);

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Kategori ikke funnet</h1>
        <Link href="/tjenester">
          <Button>Tilbake til tjenester</Button>
        </Link>
      </div>
    );
  }

  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleProviderToggle = (providerId: string) => {
    setSelectedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(providerId)) {
        next.delete(providerId);
      } else {
        next.add(providerId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedProviders.size === filteredProviders.length) {
      setSelectedProviders(new Set());
    } else {
      setSelectedProviders(new Set(filteredProviders.map((p) => p.userId)));
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    // Pre-select all filtered providers
    setSelectedProviders(new Set(filteredProviders.map((p) => p.userId)));
    setStep("providers");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setStep("submitted");
  };

  const renderQuestion = (question: QuoteQuestion) => {
    switch (question.type) {
      case "text":
        return (
          <Input
            id={question.id}
            placeholder={question.placeholder}
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.required}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={question.id}
            placeholder={question.placeholder}
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.required}
            rows={3}
          />
        );

      case "number":
        return (
          <div className="flex items-center gap-2">
            <Input
              id={question.id}
              type="number"
              placeholder={question.placeholder}
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, Number(e.target.value))}
              required={question.required}
              className="flex-1"
            />
            {question.unit && (
              <span className="text-sm text-muted-foreground">{question.unit}</span>
            )}
          </div>
        );

      case "select":
        return (
          <Select
            value={answers[question.id]?.toString() || ""}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
            required={question.required}
          >
            <SelectTrigger id={question.id}>
              <SelectValue placeholder="Velg..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "photos":
        return (
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Dra og slipp bilder her, eller klikk for å laste opp
            </p>
            <Button type="button" variant="outline" size="sm">
              Velg bilder
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              PNG, JPG opp til 10MB
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // Step indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      <div className={`flex items-center gap-2 ${step === "details" ? "text-primary" : "text-muted-foreground"}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === "details" ? "bg-primary text-primary-foreground" :
          step === "providers" || step === "submitted" ? "bg-green-100 text-green-700" : "bg-muted"
        }`}>
          {step === "providers" || step === "submitted" ? <CheckCircle className="h-5 w-5" /> : "1"}
        </div>
        <span className="text-sm font-medium hidden sm:inline">Beskriv jobben</span>
      </div>
      <div className="w-8 h-px bg-border" />
      <div className={`flex items-center gap-2 ${step === "providers" ? "text-primary" : "text-muted-foreground"}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          step === "providers" ? "bg-primary text-primary-foreground" :
          step === "submitted" ? "bg-green-100 text-green-700" : "bg-muted"
        }`}>
          {step === "submitted" ? <CheckCircle className="h-5 w-5" /> : "2"}
        </div>
        <span className="text-sm font-medium hidden sm:inline">Velg leverandører</span>
      </div>
    </div>
  );

  // Submitted state
  if (step === "submitted") {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Forespørsel sendt!</h1>
            <p className="text-muted-foreground mb-6">
              Din forespørsel er sendt til {selectedProviders.size} utvalgte leverandører.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium mb-2">Hva skjer nå?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• De {selectedProviders.size} leverandørene du valgte mottar forespørselen</li>
                <li>• Interesserte leverandører sender deg et tilbud med pris</li>
                <li>• Du kan sammenligne tilbud og velge den beste</li>
                <li>• Forespørselen er gyldig i 7 dager</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/mine-sider/tilbud">
                <Button>Se mine forespørsler</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Til forsiden</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Provider selection step
  if (step === "providers") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setStep("details")}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake til jobbdetaljer
          </button>

          <StepIndicator />

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Filter className="h-5 w-5" />
                Velg hvem som skal motta forespørselen
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Sett krav og velg hvilke leverandører du vil sende forespørselen til
              </p>
            </CardHeader>
            <CardContent>
              {/* Preferences/Filters */}
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Kvalitetskrav
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified"
                      checked={preferences.requireVerified}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, requireVerified: checked as boolean })
                      }
                    />
                    <Label htmlFor="verified" className="text-sm font-normal flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                      Kun verifiserte
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="policeCheck"
                      checked={preferences.requirePoliceCheck}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, requirePoliceCheck: checked as boolean })
                      }
                    />
                    <Label htmlFor="policeCheck" className="text-sm font-normal flex items-center gap-1">
                      <FileCheck className="h-3.5 w-3.5 text-green-600" />
                      Krever politiattest
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="insurance"
                      checked={preferences.requireInsurance}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, requireInsurance: checked as boolean })
                      }
                    />
                    <Label htmlFor="insurance" className="text-sm font-normal flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-purple-600" />
                      Krever forsikring
                    </Label>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="minRating" className="text-sm">Minimum vurdering</Label>
                    <Select
                      value={preferences.minRating.toString()}
                      onValueChange={(value) =>
                        setPreferences({ ...preferences, minRating: Number(value) })
                      }
                    >
                      <SelectTrigger id="minRating">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Ingen krav</SelectItem>
                        <SelectItem value="3">3+ stjerner</SelectItem>
                        <SelectItem value="4">4+ stjerner</SelectItem>
                        <SelectItem value="4.5">4.5+ stjerner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minExperience" className="text-sm">Minimum erfaring</Label>
                    <Select
                      value={preferences.minExperience.toString()}
                      onValueChange={(value) =>
                        setPreferences({ ...preferences, minExperience: Number(value) })
                      }
                    >
                      <SelectTrigger id="minExperience">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Ingen krav</SelectItem>
                        <SelectItem value="2">2+ år</SelectItem>
                        <SelectItem value="5">5+ år</SelectItem>
                        <SelectItem value="10">10+ år</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Provider list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {filteredProviders.length} leverandører matcher dine krav
                  </p>
                  <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                    {selectedProviders.size === filteredProviders.length ? "Fjern alle" : "Velg alle"}
                  </Button>
                </div>

                {filteredProviders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Ingen leverandører matcher dine krav.</p>
                    <p className="text-sm">Prøv å justere filtrene.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProviders.map((provider) => (
                      <ProviderSelectCard
                        key={provider.userId}
                        provider={provider}
                        selected={selectedProviders.has(provider.userId)}
                        onToggle={() => handleProviderToggle(provider.userId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tilbake
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedProviders.size === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                "Sender..."
              ) : (
                <>
                  Send til {selectedProviders.size} leverandører
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Details step (default)
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/tjenester/${categoryId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake til {category.name.toLowerCase()}
        </Link>

        <StepIndicator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              Be om tilbud - {category.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Steg 1: Beskriv jobben du trenger hjelp med
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNextStep} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Kort beskrivelse av oppdraget *</Label>
                <Input
                  id="title"
                  placeholder="F.eks. &quot;Montere 5 taklamper&quot; eller &quot;Klippe stor plen&quot;"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Category-specific questions */}
              {questions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Detaljer om oppdraget</h3>
                  {questions.map((question) => (
                    <div key={question.id} className="space-y-2">
                      <Label htmlFor={question.id}>
                        {question.question}
                        {question.required && " *"}
                      </Label>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>
              )}

              {/* Additional description */}
              <div className="space-y-2">
                <Label htmlFor="description">Tilleggsinformasjon</Label>
                <Textarea
                  id="description"
                  placeholder="Er det noe annet leverandøren bør vite?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="font-medium">Hvor skal jobben utføres?</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="street">Adresse *</Label>
                    <Input
                      id="street"
                      placeholder="Gateadresse"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postnummer *</Label>
                    <Input
                      id="postalCode"
                      placeholder="0000"
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      required
                      maxLength={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Sted *</Label>
                    <Input
                      id="city"
                      placeholder="By/sted"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Preferred date */}
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Ønsket dato (valgfritt)</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Du velger hvem som får forespørselen</p>
                    <p className="text-blue-700">
                      I neste steg kan du sette kvalitetskrav og velge hvilke leverandører
                      du vil sende forespørselen til.
                    </p>
                  </div>
                </div>
              </div>

              {/* Next step button */}
              <Button type="submit" className="w-full">
                Neste: Velg leverandører
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Provider selection card component
function ProviderSelectCard({
  provider,
  selected,
  onToggle,
}: {
  provider: ServiceProvider;
  selected: boolean;
  onToggle: () => void;
}) {
  const initials = `${provider.user.firstName[0]}${provider.user.lastName[0]}`;

  return (
    <div
      onClick={onToggle}
      className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
        selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
    >
      <Checkbox checked={selected} onChange={onToggle} />
      <Avatar className="h-10 w-10">
        <AvatarImage src={provider.user.avatarUrl} alt="" />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">
            {provider.user.firstName} {provider.user.lastName}
          </p>
          {provider.verified && (
            <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {provider.businessName}
        </p>
      </div>
      <div className="flex flex-wrap gap-1 shrink-0">
        {provider.policeCheck && (
          <Badge variant="secondary" className="text-xs">
            <FileCheck className="mr-1 h-3 w-3" />
            Politiattest
          </Badge>
        )}
      </div>
      <div className="text-right shrink-0">
        <Rating value={provider.rating} count={provider.reviewCount} size="sm" />
        <p className="text-xs text-muted-foreground mt-0.5">
          {provider.yearsExperience} års erfaring
        </p>
      </div>
    </div>
  );
}
