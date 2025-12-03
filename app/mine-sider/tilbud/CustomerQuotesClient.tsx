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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Rating } from "@/components/common/Rating";
import { formatPrice, formatDateWithYear, getDaysUntil, formatDuration } from "@/lib/utils";
import { acceptQuote } from "@/app/actions/quote";

interface Provider {
  id: string;
  businessName: string | null;
  rating: number;
  reviewCount: number;
  verified: boolean;
  insurance: boolean;
  policeCheck: boolean;
  yearsExperience: number;
  user: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
}

interface QuoteResponse {
  id: string;
  price: number;
  estimatedDuration: number;
  message: string;
  status: string;
  materialsIncluded: boolean;
  validUntil: string;
  createdAt: string;
  provider: Provider | null;
}

interface QuoteRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categorySlug: string;
  address: {
    city: string;
    street: string;
    postalCode: string;
  } | null;
  answers: Array<{ questionId: string; answer: string | number | string[] }>;
  responses: QuoteResponse[];
}

interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
}

interface CustomerQuotesClientProps {
  requests: QuoteRequest[];
  categories: Category[];
}

function QuoteRequestCard({
  request,
  onViewResponses,
}: {
  request: QuoteRequest;
  onViewResponses: (request: QuoteRequest) => void;
}) {
  const daysLeft = getDaysUntil(new Date(request.expiresAt));

  // Map database status to StatusBadge status
  const statusMap: Record<string, "open" | "quoted" | "accepted" | "expired" | "cancelled"> = {
    OPEN: "open",
    QUOTED: "quoted",
    ACCEPTED: "accepted",
    EXPIRED: "expired",
    CANCELLED: "cancelled",
  };
  const displayStatus = statusMap[request.status] || "open";

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <CategoryIcon icon={request.categoryIcon} className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium">{request.title}</h3>
              <StatusBadge type="quoteRequest" status={displayStatus} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {request.categoryName}
            </p>
          </div>
        </div>
        {request.responses.length > 0 && (
          <Badge variant="secondary" className="shrink-0">
            {request.responses.length} tilbud
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2">
        {request.description || "Ingen beskrivelse"}
      </p>

      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        {request.address && (
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {request.address.city}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Sendt {formatDateWithYear(new Date(request.createdAt))}
        </span>
        {daysLeft > 0 && request.status !== "ACCEPTED" && (
          <span className="text-amber-600">
            {daysLeft} dager igjen
          </span>
        )}
      </div>

      {request.responses.length > 0 && (
        <div className="border-t pt-3 mt-1">
          <p className="text-sm font-medium mb-2">Mottatte tilbud:</p>
          <div className="space-y-3">
            {request.responses.slice(0, 2).map((response) => (
              <div key={response.id} className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={response.provider?.user.avatarUrl || undefined} />
                      <AvatarFallback>
                        {response.provider?.user.firstName?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium">
                          {response.provider?.user.firstName} {response.provider?.user.lastName}
                        </span>
                        {response.status === "ACCEPTED" && (
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
              </div>
            ))}
            {request.responses.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{request.responses.length - 2} flere tilbud
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-1">
        {request.status === "ACCEPTED" ? (
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
        ) : request.responses.length > 0 ? (
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
  open,
  onClose,
  onAccept,
}: {
  request: QuoteRequest | null;
  open: boolean;
  onClose: () => void;
  onAccept: (requestId: string, responseId: string) => void;
}) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CategoryIcon icon={request.categoryIcon} className="h-5 w-5 text-primary" />
            {request.title}
          </DialogTitle>
          <DialogDescription>
            Sammenlign {request.responses.length} tilbud og velg den beste leverandøren
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {request.responses.map((response) => {
            const provider = response.provider;

            return (
              <Card key={response.id} className={response.status === "ACCEPTED" ? "border-green-500 border-2" : ""}>
                <CardContent className="p-4">
                  {/* Header with price */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={provider?.user.avatarUrl || undefined} />
                        <AvatarFallback className="text-lg">
                          {provider?.user.firstName?.[0] || "?"}
                          {provider?.user.lastName?.[0] || ""}
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
                    </div>
                  )}

                  {/* Quote message */}
                  <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Melding fra leverandøren:</p>
                    <p className="text-sm">{response.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {response.status === "ACCEPTED" ? (
                      <Button disabled className="flex-1">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Akseptert
                      </Button>
                    ) : request.status !== "ACCEPTED" ? (
                      <>
                        {provider && (
                          <Link href={`/leverandor/${provider.id}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Se profil
                            </Button>
                          </Link>
                        )}
                        <Button
                          className="flex-1"
                          onClick={() => onAccept(request.id, response.id)}
                        >
                          Aksepter
                        </Button>
                      </>
                    ) : (
                      <>
                        {provider && (
                          <Link href={`/leverandor/${provider.id}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Se profil
                            </Button>
                          </Link>
                        )}
                        <Button variant="outline" disabled className="flex-1">
                          Annet tilbud akseptert
                        </Button>
                      </>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground text-center">
                    Tilbudet er gyldig til {formatDateWithYear(new Date(response.validUntil))}
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

export function CustomerQuotesClient({ requests, categories }: CustomerQuotesClientProps) {
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const active = requests.filter((r) => r.status === "OPEN" || r.status === "QUOTED");
  const accepted = requests.filter((r) => r.status === "ACCEPTED");
  const expired = requests.filter((r) => r.status === "EXPIRED" || r.status === "CANCELLED");

  const handleViewResponses = (request: QuoteRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleAcceptQuote = async (requestId: string, responseId: string) => {
    try {
      await acceptQuote(responseId);
      setDialogOpen(false);
      router.push(`/mine-sider/tilbud/${requestId}/bestill`);
    } catch (error) {
      console.error("Failed to accept quote:", error);
    }
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
