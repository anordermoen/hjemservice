"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle,
  XCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  Languages,
  GraduationCap,
  Globe,
  UserCheck,
  Loader2,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { approveProviderAction, rejectProviderAction } from "@/app/actions/admin";
import { formatDate } from "@/lib/utils";

interface ProviderData {
  id: string;
  userId: string;
  businessName: string | null;
  bio: string;
  areasServed: string[];
  yearsExperience: number;
  nationality: string | null;
  education: string | null;
  verified: boolean;
  insurance: boolean;
  policeCheck: boolean;
  createdAt: Date;
  approvedAt: Date | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
    code: string;
    proficiency: string;
  }>;
  certificates: Array<{
    id: string;
    name: string;
    issuer: string;
    year: number;
    verified: boolean;
  }>;
}

interface ApprovalClientProps {
  providers: ProviderData[];
}

function ApplicationCard({
  provider,
  onApprove,
  onReject,
  isPending,
}: {
  provider: ProviderData;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isPending: boolean;
}) {
  const name = `${provider.user.firstName || ""} ${provider.user.lastName || ""}`.trim() || "Ukjent";
  const initials = `${provider.user.firstName?.[0] || ""}${provider.user.lastName?.[0] || ""}`;
  const categoryNames = provider.categories.map((c) => c.name).join(", ") || "Ukjent kategori";
  const fluentLanguages = provider.languages.filter(
    (l) => l.proficiency === "morsmål" || l.proficiency === "flytende"
  );
  const status = provider.approvedAt ? "approved" : "pending";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={provider.user.avatarUrl || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{name}</h3>
                <Badge variant={status === "pending" ? "warning" : "success"}>
                  {status === "pending" ? "Venter" : "Godkjent"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {categoryNames} • {provider.yearsExperience} års erfaring
              </p>

              {provider.businessName && (
                <p className="text-sm text-muted-foreground">{provider.businessName}</p>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                {provider.nationality && (
                  <Badge variant="outline" className="text-xs">
                    <Globe className="mr-1 h-3 w-3" />
                    {provider.nationality}
                  </Badge>
                )}
                {fluentLanguages.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Languages className="mr-1 h-3 w-3" />
                    {fluentLanguages.map((l) => l.name).join(", ")}
                  </Badge>
                )}
                {provider.education && (
                  <Badge variant="outline" className="text-xs">
                    <GraduationCap className="mr-1 h-3 w-3" />
                    Utdanning
                  </Badge>
                )}
                {provider.policeCheck && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Politiattest
                  </Badge>
                )}
                {provider.insurance && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Forsikret
                  </Badge>
                )}
              </div>

              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {provider.user.email}
                </p>
                {provider.user.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {provider.user.phone}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {provider.areasServed.join(", ")}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Søkte {formatDate(provider.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Se detaljer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Søknadsdetaljer - {name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Om søkeren
                    </h4>
                    <p className="text-sm text-muted-foreground">{provider.bio}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {provider.nationality && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Nasjonalitet</p>
                        <p className="font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {provider.nationality}
                        </p>
                      </div>
                    )}
                    {provider.education && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Utdanning</p>
                        <p className="font-medium flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          {provider.education}
                        </p>
                      </div>
                    )}
                  </div>

                  {provider.languages.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        Språk
                      </h4>
                      <div className="space-y-2">
                        {provider.languages.map((lang) => (
                          <div
                            key={lang.id}
                            className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded"
                          >
                            <span className="font-medium">{lang.name}</span>
                            <Badge
                              variant={
                                lang.proficiency === "morsmål"
                                  ? "default"
                                  : lang.proficiency === "flytende"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {lang.proficiency}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {provider.certificates.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Sertifikater
                      </h4>
                      <div className="space-y-2">
                        {provider.certificates.map((cert) => (
                          <div
                            key={cert.id}
                            className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded"
                          >
                            <div>
                              <span className="font-medium">{cert.name}</span>
                              <p className="text-xs text-muted-foreground">
                                {cert.issuer} • {cert.year}
                              </p>
                            </div>
                            {cert.verified && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Verifisert
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="mb-2 font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Dokumenter og kvalifikasjoner
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                        <span>Politiattest</span>
                        <Badge
                          variant="secondary"
                          className={
                            provider.policeCheck
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {provider.policeCheck ? "Bekreftet" : "Mangler"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                        <span>Forsikring</span>
                        <Badge
                          variant="secondary"
                          className={
                            provider.insurance
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {provider.insurance ? "Bekreftet" : "Ikke oppgitt"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Dekningsområder
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {provider.areasServed.map((area) => (
                        <Badge key={area} variant="outline">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <h4 className="mb-2 font-medium">Kontaktinfo</h4>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`mailto:${provider.user.email}`}
                          className="text-primary hover:underline"
                        >
                          {provider.user.email}
                        </a>
                      </p>
                      {provider.user.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`tel:${provider.user.phone}`}
                            className="text-primary hover:underline"
                          >
                            {provider.user.phone}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {status === "pending" && (
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onReject(provider.id)}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Avslå
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => onApprove(provider.id)}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Godkjenn
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {status === "pending" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(provider.id)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Avslå
                </Button>
                <Button
                  size="sm"
                  onClick={() => onApprove(provider.id)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Godkjenn
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApprovalClient({ providers }: ApprovalClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const result = await approveProviderAction(id);
      if (result.error) {
        console.error(result.error);
      }
    });
  };

  const handleReject = (id: string) => {
    if (!confirm("Er du sikker på at du vil avslå denne søknaden? Leverandørprofilen vil bli slettet.")) {
      return;
    }
    startTransition(async () => {
      const result = await rejectProviderAction(id);
      if (result.error) {
        console.error(result.error);
      }
    });
  };

  const pending = providers.filter((p) => !p.approvedAt);
  const approved = providers.filter((p) => p.approvedAt);

  return (
    <Tabs defaultValue="pending">
      <TabsList className="mb-4">
        <TabsTrigger value="pending">Ventende ({pending.length})</TabsTrigger>
        <TabsTrigger value="approved">Godkjente ({approved.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="space-y-4">
        {pending.length > 0 ? (
          pending.map((provider) => (
            <ApplicationCard
              key={provider.id}
              provider={provider}
              onApprove={handleApprove}
              onReject={handleReject}
              isPending={isPending}
            />
          ))
        ) : (
          <EmptyState
            icon={Clock}
            title="Ingen ventende søknader"
            description="Nye leverandørsøknader vil dukke opp her for gjennomgang"
          />
        )}
      </TabsContent>

      <TabsContent value="approved" className="space-y-4">
        {approved.length > 0 ? (
          approved.map((provider) => (
            <ApplicationCard
              key={provider.id}
              provider={provider}
              onApprove={handleApprove}
              onReject={handleReject}
              isPending={isPending}
            />
          ))
        ) : (
          <EmptyState
            icon={CheckCircle}
            title="Ingen godkjente leverandører"
            description="Godkjente leverandører vil vises her"
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
