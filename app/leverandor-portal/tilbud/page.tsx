"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Send, ChevronDown, ChevronUp, CheckCircle, MessageSquare } from "lucide-react";
import { CategoryIcon } from "@/components/common/CategoryIcon";
import { EmptyState } from "@/components/common/EmptyState";
import { TipList } from "@/components/common/InfoBox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getOpenQuoteRequestsForProvider,
  getQuoteResponsesByProviderId,
  getQuoteRequestById,
} from "@/lib/data/quotes";
import { getProviderById } from "@/lib/data/providers";
import { categories } from "@/lib/data/categories";
import { formatPrice, formatDateShort, getDaysUntil } from "@/lib/utils";
import { QuoteRequest, QuoteAnswer } from "@/types";

// In a real app, this would come from auth
const currentProviderId = "p7";

function formatAnswers(answers: QuoteAnswer[]): { label: string; value: string }[] {
  return answers.map((answer) => ({
    label: answer.questionId.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
    value: String(answer.answer),
  }));
}

function QuoteRequestCard({
  request,
  onRespond,
  hasResponded,
}: {
  request: QuoteRequest;
  onRespond: (request: QuoteRequest) => void;
  hasResponded: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const category = categories.find((c) => c.id === request.categoryId);
  const daysLeft = getDaysUntil(request.expiresAt);
  const formattedAnswers = formatAnswers(request.answers);

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {category && (
            <div className="rounded-full bg-primary/10 p-2">
              <CategoryIcon icon={category.icon} className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium">{request.title}</h3>
              {hasResponded && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Tilbud sendt
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {category?.name}
            </p>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="text-muted-foreground">{formatDateShort(request.createdAt)}</p>
          {daysLeft > 0 && (
            <p className="text-amber-600 font-medium">{daysLeft}d igjen</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {request.address.street}, {request.address.postalCode} {request.address.city}
        </span>
        {request.preferredDates && request.preferredDates.length > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Ønsket: {request.preferredDates.map(d => new Date(d).toLocaleDateString("nb-NO", { day: "numeric", month: "short" })).join(", ")}
          </span>
        )}
      </div>

      {/* Expandable details */}
      <div className="mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Skjul detaljer
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Vis detaljer
            </>
          )}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 p-3 bg-muted/50 rounded-lg">
            {request.description && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Tilleggsinformasjon:</p>
                <p className="text-sm">{request.description}</p>
              </div>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              {formattedAnswers.map((answer, i) => (
                <div key={i}>
                  <p className="text-xs font-medium text-muted-foreground">{answer.label}</p>
                  <p className="text-sm">{answer.value}</p>
                </div>
              ))}
            </div>

            {request.photos && request.photos.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Bilder:</p>
                <div className="flex gap-2">
                  {request.photos.map((photo, i) => (
                    <div key={i} className="w-16 h-16 bg-muted rounded" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {hasResponded ? (
          <Button variant="outline" className="flex-1" disabled>
            <CheckCircle className="mr-2 h-4 w-4" />
            Tilbud sendt
          </Button>
        ) : (
          <Button onClick={() => onRespond(request)} className="flex-1">
            <Send className="mr-2 h-4 w-4" />
            Gi tilbud
          </Button>
        )}
      </div>
    </div>
  );
}

function SendQuoteDialog({
  request,
  open,
  onClose,
}: {
  request: QuoteRequest | null;
  open: boolean;
  onClose: () => void;
}) {
  const [price, setPrice] = useState("");
  const [hours, setHours] = useState("");
  const [message, setMessage] = useState("");
  const [materialsIncluded, setMaterialsIncluded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const category = request ? categories.find((c) => c.id === request.categoryId) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    onClose();
    alert("Tilbud sendt! Kunden vil nå se ditt tilbud.");

    // Reset form
    setPrice("");
    setHours("");
    setMessage("");
    setMaterialsIncluded(false);
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send tilbud</DialogTitle>
          <DialogDescription>
            {request.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {category && <CategoryIcon icon={category.icon} className="h-5 w-5 text-primary" />}
              <span className="font-medium">{category?.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {request.address.city} • {request.description || request.title}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Din pris (kr) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="F.eks. 4500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Estimert tid (timer) *</Label>
              <Input
                id="hours"
                type="number"
                placeholder="F.eks. 3"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                required
                min={0.5}
                step={0.5}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="materials"
              checked={materialsIncluded}
              onCheckedChange={(checked) => setMaterialsIncluded(checked as boolean)}
            />
            <Label htmlFor="materials" className="text-sm font-normal">
              Materialer er inkludert i prisen
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Melding til kunden *</Label>
            <Textarea
              id="message"
              placeholder="Beskriv hva som er inkludert, din erfaring, og eventuelt når du kan utføre jobben..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
            />
          </div>

          {price && (
            <div className="p-3 bg-primary/5 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Din pris</span>
                <span>{formatPrice(Number(price))}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Plattformgebyr (15%)</span>
                <span>-{formatPrice(Math.round(Number(price) * 0.15))}</span>
              </div>
              <div className="flex justify-between font-medium mt-1 pt-1 border-t">
                <span>Du mottar</span>
                <span className="text-primary">
                  {formatPrice(Math.round(Number(price) * 0.85))}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sender..." : "Send tilbud"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProviderQuotesPage() {
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const provider = getProviderById(currentProviderId);
  const providerCategories = provider?.categories || [];

  const incomingRequests = getOpenQuoteRequestsForProvider(currentProviderId, providerCategories);
  const myResponses = getQuoteResponsesByProviderId(currentProviderId);
  const respondedRequestIds = new Set(myResponses.map((r) => r.quoteRequestId));

  const newRequests = incomingRequests.filter((r) => !respondedRequestIds.has(r.id));
  const respondedRequests = incomingRequests.filter((r) => respondedRequestIds.has(r.id));

  const handleRespond = (request: QuoteRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tilbudsforespørsler</CardTitle>
          <p className="text-sm text-muted-foreground">
            Kunder som ønsker tilbud på {providerCategories.map(id =>
              categories.find(c => c.id === id)?.name.toLowerCase()
            ).join(", ")}
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="new">
            <TabsList className="mb-4 w-full justify-start">
              <TabsTrigger value="new">
                Nye forespørsler ({newRequests.length})
              </TabsTrigger>
              <TabsTrigger value="responded">
                Sendte tilbud ({respondedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-4">
              {newRequests.length > 0 ? (
                newRequests.map((request) => (
                  <QuoteRequestCard
                    key={request.id}
                    request={request}
                    onRespond={handleRespond}
                    hasResponded={false}
                  />
                ))
              ) : (
                <EmptyState
                  icon={MessageSquare}
                  title="Ingen nye forespørsler akkurat nå"
                  description="Nye forespørsler fra kunder i ditt område vil dukke opp her"
                />
              )}
            </TabsContent>

            <TabsContent value="responded" className="space-y-4">
              {respondedRequests.length > 0 ? (
                respondedRequests.map((request) => {
                  const response = myResponses.find((r) => r.quoteRequestId === request.id);
                  return (
                    <div key={request.id}>
                      <QuoteRequestCard
                        request={request}
                        onRespond={handleRespond}
                        hasResponded={true}
                      />
                      {response && (
                        <div className="ml-4 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-medium text-green-800">
                            Ditt tilbud: {formatPrice(response.price)}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            {response.status === "accepted"
                              ? "✓ Kunden aksepterte ditt tilbud!"
                              : response.status === "rejected"
                              ? "Kunden valgte et annet tilbud"
                              : `Venter på svar • Gyldig til ${formatDateShort(response.validUntil)}`
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <EmptyState title="Du har ikke sendt noen tilbud ennå" />
              )}
            </TabsContent>
          </Tabs>

          <TipList
            title="Tips for gode tilbud"
            className="mt-6"
            tips={[
              "Svar raskt - kunder velger ofte den som svarer først",
              "Vær tydelig på hva som er inkludert i prisen",
              "Nevn din erfaring og eventuelle garantier",
              "Gi en realistisk tidsestimering",
            ]}
          />
        </CardContent>
      </Card>

      <SendQuoteDialog
        request={selectedRequest}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedRequest(null);
        }}
      />
    </>
  );
}
