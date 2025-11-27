"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Upload, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/lib/data/categories";
import { getQuestionsForCategory } from "@/lib/data/quote-questions";
import { QuoteQuestion } from "@/types";

export default function QuoteRequestPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.category as string;

  const category = categories.find((c) => c.id === categoryId);
  const questions = getQuestionsForCategory(categoryId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [address, setAddress] = useState({
    street: "",
    postalCode: "",
    city: "",
  });
  const [preferredDate, setPreferredDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Forespørsel sendt!</h1>
            <p className="text-muted-foreground mb-6">
              Din forespørsel er sendt til leverandører i ditt område. Du vil motta tilbud
              i løpet av kort tid.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium mb-2">Hva skjer nå?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Leverandører i ditt område ser forespørselen din</li>
                <li>• De som er interesserte sender deg et tilbud med pris</li>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href={`/tjenester/${categoryId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake til {category.name.toLowerCase()}
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              Be om tilbud - {category.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Fyll ut skjemaet så får du tilbud fra leverandører i ditt område
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <p className="text-xs text-muted-foreground">
                  Leverandører vil se at dette er din foretrukne dato
                </p>
              </div>

              {/* Info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Slik fungerer det</p>
                    <ul className="text-blue-700 space-y-1">
                      <li>• Forespørselen sendes til relevante leverandører i ditt område</li>
                      <li>• Du mottar tilbud med pris direkte fra leverandørene</li>
                      <li>• Sammenlign tilbud og velg det beste for deg</li>
                      <li>• Helt gratis og uforpliktende</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Sender forespørsel..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send forespørsel
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Ved å sende forespørselen godtar du våre{" "}
                <Link href="/vilkar" className="underline">
                  vilkår
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
