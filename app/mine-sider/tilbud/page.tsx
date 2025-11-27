"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  MapPin,
  CheckCircle,
  MessageSquare,
  ChevronRight,
  Plus,
  FileQuestion,
  Languages,
  Award,
  Shield,
  FileCheck,
  ExternalLink,
  Star,
} from "lucide-react";
import { CategoryIcon } from "@/components/common/CategoryIcon";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { TipList } from "@/components/common/InfoBox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Rating } from "@/components/common/Rating";
import { getQuoteRequestsByCustomerId, getQuoteResponsesByRequestId } from "@/lib/data/quotes";
import { categories } from "@/lib/data/categories";
import { formatPrice, formatDateWithYear, getDaysUntil, formatDuration } from "@/lib/utils";
import { QuoteRequest, QuoteResponse, ServiceProvider } from "@/types";

// In a real app, this would come from auth
const currentUserId = "c1";

// Helper component for displaying provider qualifications compactly
function ProviderQualifications({ provider }: { provider: ServiceProvider }) {
  const verifiedCerts = provider.certificates?.filter((c) => c.verified) || [];
  const fluentLanguages = provider.languages?.filter(
    (l) => l.proficiency === "morsmål" || l.proficiency === "flytende"
  ) || [];

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      {fluentLanguages.length > 0 && (
        <span className="flex items-center gap-1">
          <Languages className="h-3 w-3" />
          {fluentLanguages.map((l) => l.name).join(", ")}
        </span>
      )}
      {verifiedCerts.length > 0 && (
        <span className="flex items-center gap-1">
          <Award className="h-3 w-3" />
          {verifiedCerts.length} sertifikat{verifiedCerts.length !== 1 ? "er" : ""}
        </span>
      )}
      {provider.yearsExperience > 0 && (
        <span>{provider.yearsExperience} års erfaring</span>
      )}
    </div>
  );
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
  const daysLeft = getDaysUntil(request.expiresAt);

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {category && (
            <div className="rounded-full bg-primary/10 p-2">
              <CategoryIcon icon={category.icon} className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium">{request.title}</h3>
              <StatusBadge type="quoteRequest" status={request.status} />
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
          Sendt {formatDateWithYear(request.createdAt)}
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
          <div className="space-y-3">
            {responses.slice(0, 2).map((response) => (
              <div key={response.id} className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={response.provider?.user.avatarUrl} />
                      <AvatarFallback>
                        {response.provider?.user.firstName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium">
                          {response.provider?.user.firstName} {response.provider?.user.lastName}
                        </span>
                        {response.status === "accepted" && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {response.provider?.verified && (
                          <CheckCircle className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      {response.provider && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{response.provider.rating.toFixed(1)}</span>
                          <span>({response.provider.reviewCount})</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-primary">{formatPrice(response.price)}</span>
                </div>
                {response.provider && (
                  <div className="mt-2">
                    <ProviderQualifications provider={response.provider} />
                  </div>
                )}
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
        {request.status === "accepted" ? (
          <>
            <Button variant="outline" onClick={() => onViewResponses(request)} className="flex-1">
              Se detaljer
            </Button>
            <Link href={`/mine-sider/tilbud/${request.id}/bestill`} className="flex-1">
              <Button className="w-full">
                Fullfør bestilling
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </>
        ) : responses.length > 0 ? (
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
  onAccept,
}: {
  request: QuoteRequest | null;
  responses: QuoteResponse[];
  open: boolean;
  onClose: () => void;
  onAccept: (request: QuoteRequest, response: QuoteResponse) => void;
}) {
  const category = request ? categories.find((c) => c.id === request.categoryId) : null;

  const handleAccept = (response: QuoteResponse) => {
    if (request) {
      onAccept(request, response);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {category && <CategoryIcon icon={category.icon} className="h-5 w-5 text-primary" />}
            {request.title}
          </DialogTitle>
          <DialogDescription>
            Sammenlign {responses.length} tilbud og velg den beste leverandøren
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {responses.map((response) => {
            const provider = response.provider;
            const verifiedCerts = provider?.certificates?.filter((c) => c.verified) || [];
            const fluentLanguages = provider?.languages?.filter(
              (l) => l.proficiency === "morsmål" || l.proficiency === "flytende"
            ) || [];

            return (
              <Card key={response.id} className={response.status === "accepted" ? "border-green-500 border-2" : ""}>
                <CardContent className="p-4">
                  {/* Header with price */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={provider?.user.avatarUrl} />
                        <AvatarFallback className="text-lg">
                          {provider?.user.firstName[0]}
                          {provider?.user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">
                            {provider?.user.firstName} {provider?.user.lastName}
                          </h4>
                          {provider?.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Verifisert
                            </Badge>
                          )}
                        </div>
                        {provider?.businessName && (
                          <p className="text-sm text-muted-foreground">
                            {provider.businessName}
                          </p>
                        )}
                        {provider && (
                          <Rating
                            value={provider.rating}
                            count={provider.reviewCount}
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
                        ca. {formatDuration(response.estimatedDuration)}
                      </p>
                    </div>
                  </div>

                  {/* Provider qualifications */}
                  {provider && (
                    <div className="mb-4 p-3 bg-muted/30 rounded-lg space-y-3">
                      {/* Trust badges */}
                      <div className="flex flex-wrap gap-2">
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
                        {provider.yearsExperience > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {provider.yearsExperience} års erfaring
                          </Badge>
                        )}
                        {response.materialsIncluded && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Materialer inkludert
                          </Badge>
                        )}
                      </div>

                      {/* Languages */}
                      {fluentLanguages.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Languages className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Språk:</span>
                          <span>
                            {fluentLanguages.map((l, i) => (
                              <span key={l.code}>
                                {l.name}
                                {l.proficiency === "morsmål" && (
                                  <span className="text-xs text-muted-foreground"> (morsmål)</span>
                                )}
                                {i < fluentLanguages.length - 1 && ", "}
                              </span>
                            ))}
                          </span>
                        </div>
                      )}

                      {/* Certificates */}
                      {verifiedCerts.length > 0 && (
                        <div className="flex items-start gap-2 text-sm">
                          <Award className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="text-muted-foreground">Sertifikater: </span>
                            {verifiedCerts.map((c, i) => (
                              <span key={c.id}>
                                {c.name}
                                {i < verifiedCerts.length - 1 && ", "}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Background */}
                      {(provider.nationality || provider.education) && (
                        <div className="text-sm text-muted-foreground">
                          {provider.nationality && <span>Fra {provider.nationality}</span>}
                          {provider.nationality && provider.education && <span> • </span>}
                          {provider.education && <span>{provider.education}</span>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quote message */}
                  <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Melding fra leverandøren:</p>
                    <p className="text-sm">{response.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {response.status === "accepted" ? (
                      <Button disabled className="flex-1">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Akseptert
                      </Button>
                    ) : request.status !== "accepted" ? (
                      <>
                        <Link href={`/leverandor/${provider?.userId}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Se profil
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="flex-1"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Kontakt
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => handleAccept(response)}
                        >
                          Aksepter
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href={`/leverandor/${provider?.userId}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Se profil
                          </Button>
                        </Link>
                        <Button variant="outline" disabled className="flex-1">
                          Annet tilbud akseptert
                        </Button>
                      </>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground text-center">
                    Tilbudet er gyldig til {formatDateWithYear(response.validUntil)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomerQuotesPage() {
  const router = useRouter();
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

  const handleAcceptQuote = (request: QuoteRequest, response: QuoteResponse) => {
    // In a real app, this would call an API to update the quote status
    console.log("Accepting quote:", response.id, "for request:", request.id);
    setDialogOpen(false);
    // Redirect to booking completion page
    router.push(`/mine-sider/tilbud/${request.id}/bestill`);
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
                <EmptyState
                  icon={FileQuestion}
                  title="Du har ingen aktive tilbudsforespørsler"
                  action={
                    <Link href="/tjenester">
                      <Button>Be om tilbud</Button>
                    </Link>
                  }
                />
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
                <EmptyState title="Ingen aksepterte tilbud ennå" />
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
                <EmptyState title="Ingen utløpte forespørsler" />
              )}
            </TabsContent>
          </Tabs>

          <TipList
            title="Slik fungerer tilbudsforespørsler"
            className="mt-6"
            tips={[
              "Send en forespørsel med beskrivelse av jobben",
              "Motta tilbud fra interesserte leverandører",
              "Sammenlign pris, erfaring og vurderinger",
              "Aksepter det tilbudet som passer best",
              "Forespørsler er gyldige i 7 dager",
            ]}
          />
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
        onAccept={handleAcceptQuote}
      />
    </>
  );
}
