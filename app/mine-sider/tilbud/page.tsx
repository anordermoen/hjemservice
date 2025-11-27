"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, MapPin, CheckCircle, MessageSquare, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Rating } from "@/components/common/Rating";
import { getQuoteRequestsByCustomerId, getQuoteResponsesByRequestId } from "@/lib/data/quotes";
import { categories } from "@/lib/data/categories";
import { formatPrice } from "@/lib/utils";
import { QuoteRequest, QuoteResponse } from "@/types";

// In a real app, this would come from auth
const currentUserId = "c1";

function getStatusBadge(status: QuoteRequest["status"]) {
  switch (status) {
    case "open":
      return <Badge className="bg-blue-100 text-blue-800">Venter på tilbud</Badge>;
    case "quoted":
      return <Badge className="bg-amber-100 text-amber-800">Har mottatt tilbud</Badge>;
    case "accepted":
      return <Badge className="bg-green-100 text-green-800">Akseptert</Badge>;
    case "expired":
      return <Badge variant="secondary">Utløpt</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Kansellert</Badge>;
    default:
      return null;
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function QuoteRequestCard({
  request,
  onViewResponses,
}: {
  request: QuoteRequest;
  onViewResponses: (request: QuoteRequest) => void;
}) {
  const category = categories.find((c) => c.id === request.categoryId);
  const responses = getQuoteResponsesByRequestId(request.id);
  const daysLeft = Math.ceil((request.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{category?.icon}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium">{request.title}</h3>
              {getStatusBadge(request.status)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {category?.name}
            </p>
          </div>
        </div>
        {responses.length > 0 && (
          <Badge variant="secondary" className="shrink-0">
            {responses.length} tilbud
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2">
        {request.description || request.answers.find(a => a.questionId.includes("description"))?.answer as string || "Ingen beskrivelse"}
      </p>

      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {request.address.city}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Sendt {formatDate(request.createdAt)}
        </span>
        {daysLeft > 0 && request.status !== "accepted" && (
          <span className="text-amber-600">
            {daysLeft} dager igjen
          </span>
        )}
      </div>

      {responses.length > 0 && (
        <div className="border-t pt-3 mt-1">
          <p className="text-sm font-medium mb-2">Mottatte tilbud:</p>
          <div className="space-y-2">
            {responses.slice(0, 2).map((response) => (
              <div key={response.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={response.provider?.user.avatarUrl} />
                    <AvatarFallback>
                      {response.provider?.user.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>{response.provider?.user.firstName} {response.provider?.user.lastName}</span>
                  {response.status === "accepted" && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <span className="font-semibold">{formatPrice(response.price)}</span>
              </div>
            ))}
            {responses.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{responses.length - 2} flere tilbud
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-1">
        {responses.length > 0 ? (
          <Button onClick={() => onViewResponses(request)} className="flex-1">
            Se tilbud
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" disabled className="flex-1">
            Venter på tilbud...
          </Button>
        )}
      </div>
    </div>
  );
}

function ResponseDetailDialog({
  request,
  responses,
  open,
  onClose,
}: {
  request: QuoteRequest | null;
  responses: QuoteResponse[];
  open: boolean;
  onClose: () => void;
}) {
  const [selectedResponse, setSelectedResponse] = useState<QuoteResponse | null>(null);
  const category = request ? categories.find((c) => c.id === request.categoryId) : null;

  const handleAccept = (response: QuoteResponse) => {
    // In a real app, this would call an API
    console.log("Accepting response:", response.id);
    alert(`Tilbud fra ${response.provider?.user.firstName} akseptert! I en ferdig app ville dette startet booking-prosessen.`);
    onClose();
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{category?.icon}</span>
            {request.title}
          </DialogTitle>
          <DialogDescription>
            {responses.length} tilbud mottatt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {responses.map((response) => (
            <Card key={response.id} className={response.status === "accepted" ? "border-green-500" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={response.provider?.user.avatarUrl} />
                      <AvatarFallback>
                        {response.provider?.user.firstName[0]}
                        {response.provider?.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">
                        {response.provider?.user.firstName} {response.provider?.user.lastName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {response.provider?.businessName}
                      </p>
                      {response.provider && (
                        <Rating
                          value={response.provider.rating}
                          count={response.provider.reviewCount}
                          size="sm"
                        />
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(response.price)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ca. {Math.round(response.estimatedDuration / 60)} timer
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{response.message}</p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {response.materialsIncluded && (
                    <Badge variant="secondary">Materialer inkludert</Badge>
                  )}
                  {response.provider?.policeCheck && (
                    <Badge variant="secondary">Politiattest</Badge>
                  )}
                  {response.provider?.insurance && (
                    <Badge variant="secondary">Forsikret</Badge>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  {response.status === "accepted" ? (
                    <Button disabled className="flex-1">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Akseptert
                    </Button>
                  ) : request.status !== "accepted" ? (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setSelectedResponse(response)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Kontakt
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => handleAccept(response)}
                      >
                        Aksepter tilbud
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" disabled className="flex-1">
                      Annet tilbud akseptert
                    </Button>
                  )}
                </div>

                <p className="mt-2 text-xs text-muted-foreground text-center">
                  Tilbudet er gyldig til {formatDate(response.validUntil)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomerQuotesPage() {
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const allRequests = getQuoteRequestsByCustomerId(currentUserId);

  const active = allRequests.filter((r) => r.status === "open" || r.status === "quoted");
  const accepted = allRequests.filter((r) => r.status === "accepted");
  const expired = allRequests.filter((r) => r.status === "expired" || r.status === "cancelled");

  const handleViewResponses = (request: QuoteRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mine tilbudsforespørsler</CardTitle>
          <Link href="/tjenester">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Ny forespørsel
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="mb-4 w-full justify-start">
              <TabsTrigger value="active">Aktive ({active.length})</TabsTrigger>
              <TabsTrigger value="accepted">Aksepterte ({accepted.length})</TabsTrigger>
              <TabsTrigger value="expired">Utløpte ({expired.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {active.length > 0 ? (
                active.map((request) => (
                  <QuoteRequestCard
                    key={request.id}
                    request={request}
                    onViewResponses={handleViewResponses}
                  />
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-4 text-muted-foreground">
                    Du har ingen aktive tilbudsforespørsler
                  </p>
                  <Link href="/tjenester">
                    <Button>Be om tilbud</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="accepted" className="space-y-4">
              {accepted.length > 0 ? (
                accepted.map((request) => (
                  <QuoteRequestCard
                    key={request.id}
                    request={request}
                    onViewResponses={handleViewResponses}
                  />
                ))
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  Ingen aksepterte tilbud ennå
                </p>
              )}
            </TabsContent>

            <TabsContent value="expired" className="space-y-4">
              {expired.length > 0 ? (
                expired.map((request) => (
                  <QuoteRequestCard
                    key={request.id}
                    request={request}
                    onViewResponses={handleViewResponses}
                  />
                ))
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  Ingen utløpte forespørsler
                </p>
              )}
            </TabsContent>
          </Tabs>

          {/* Info box */}
          <div className="mt-6 rounded-lg bg-muted/40 p-4">
            <h3 className="font-medium mb-2">Slik fungerer tilbudsforespørsler</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Send en forespørsel med beskrivelse av jobben</li>
              <li>• Motta tilbud fra interesserte leverandører</li>
              <li>• Sammenlign pris, erfaring og vurderinger</li>
              <li>• Aksepter det tilbudet som passer best</li>
              <li>• Forespørsler er gyldige i 7 dager</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <ResponseDetailDialog
        request={selectedRequest}
        responses={selectedRequest ? getQuoteResponsesByRequestId(selectedRequest.id) : []}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedRequest(null);
        }}
      />
    </>
  );
}
