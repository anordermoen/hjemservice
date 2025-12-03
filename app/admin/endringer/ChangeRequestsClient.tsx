"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Loader2,
  Award,
  Languages,
  Shield,
  FileText,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  approveChangeRequest,
  rejectChangeRequest,
} from "@/app/actions/provider-changes";
import { ProviderChangeType } from "@prisma/client";

interface ChangeRequest {
  id: string;
  changeType: ProviderChangeType;
  data: Record<string, unknown>;
  message: string | null;
  createdAt: Date;
  provider: {
    id: string;
    businessName: string | null;
    userName: string;
    email: string;
  };
}

interface ChangeRequestsClientProps {
  requests: ChangeRequest[];
}

function getChangeTypeLabel(type: ProviderChangeType): string {
  const labels: Record<ProviderChangeType, string> = {
    ADD_CERTIFICATE: "Legg til sertifikat",
    UPDATE_CERTIFICATE: "Oppdater sertifikat",
    REMOVE_CERTIFICATE: "Fjern sertifikat",
    ADD_LANGUAGE: "Legg til språk",
    UPDATE_LANGUAGE: "Oppdater språk",
    REMOVE_LANGUAGE: "Fjern språk",
    UPDATE_POLICE_CHECK: "Oppdater politiattest",
    UPDATE_INSURANCE: "Oppdater forsikring",
    UPDATE_EDUCATION: "Oppdater utdanning",
    UPDATE_BIO: "Oppdater beskrivelse",
  };
  return labels[type];
}

function getChangeTypeIcon(type: ProviderChangeType) {
  if (type.includes("CERTIFICATE")) return Award;
  if (type.includes("LANGUAGE")) return Languages;
  if (type.includes("POLICE") || type.includes("INSURANCE")) return Shield;
  if (type.includes("EDUCATION")) return GraduationCap;
  return FileText;
}

function getChangeTypeBadgeVariant(type: ProviderChangeType): "default" | "secondary" | "destructive" {
  if (type.includes("ADD")) return "default";
  if (type.includes("REMOVE")) return "destructive";
  return "secondary";
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChangeDataDisplay({ type, data }: { type: ProviderChangeType; data: Record<string, unknown> }) {
  switch (type) {
    case "ADD_CERTIFICATE":
    case "UPDATE_CERTIFICATE":
      return (
        <div className="space-y-1 text-sm">
          <p><strong>Navn:</strong> {data.name as string}</p>
          <p><strong>Utsteder:</strong> {data.issuer as string}</p>
          <p><strong>År:</strong> {data.year as number}</p>
          {data.expiresAt ? <p><strong>Utløper:</strong> {String(data.expiresAt)}</p> : null}
        </div>
      );

    case "REMOVE_CERTIFICATE":
      return (
        <div className="text-sm">
          <p><strong>Fjerner:</strong> {data.name as string}</p>
        </div>
      );

    case "ADD_LANGUAGE":
    case "UPDATE_LANGUAGE":
      return (
        <div className="space-y-1 text-sm">
          <p><strong>Språk:</strong> {data.name as string}</p>
          <p><strong>Nivå:</strong> {data.proficiency as string}</p>
        </div>
      );

    case "REMOVE_LANGUAGE":
      return (
        <div className="text-sm">
          <p><strong>Fjerner:</strong> {data.name as string}</p>
        </div>
      );

    case "UPDATE_POLICE_CHECK":
      return (
        <div className="text-sm">
          <p><strong>Politiattest:</strong> {data.policeCheck ? "Ja, har politiattest" : "Nei"}</p>
        </div>
      );

    case "UPDATE_INSURANCE":
      return (
        <div className="text-sm">
          <p><strong>Forsikring:</strong> {data.insurance ? "Ja, har forsikring" : "Nei"}</p>
        </div>
      );

    case "UPDATE_EDUCATION":
      return (
        <div className="text-sm">
          <p><strong>Utdanning:</strong> {data.education as string}</p>
        </div>
      );

    case "UPDATE_BIO":
      return (
        <div className="text-sm">
          <p><strong>Ny beskrivelse:</strong></p>
          <p className="mt-1 p-2 bg-muted rounded text-xs">{data.bio as string}</p>
        </div>
      );

    default:
      return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>;
  }
}

function ChangeRequestCard({ request }: { request: ChangeRequest }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [error, setError] = useState("");

  const Icon = getChangeTypeIcon(request.changeType);

  const handleApprove = () => {
    setError("");
    startTransition(async () => {
      const result = await approveChangeRequest(request.id, adminNote || undefined);
      if (result.error) {
        setError(result.error);
      } else {
        setShowApproveDialog(false);
        setAdminNote("");
        router.refresh();
      }
    });
  };

  const handleReject = () => {
    if (!adminNote.trim()) {
      setError("Du må oppgi en grunn for avvisning");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await rejectChangeRequest(request.id, adminNote);
      if (result.error) {
        setError(result.error);
      } else {
        setShowRejectDialog(false);
        setAdminNote("");
        router.refresh();
      }
    });
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="rounded-lg bg-muted p-2">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant={getChangeTypeBadgeVariant(request.changeType)}>
                    {getChangeTypeLabel(request.changeType)}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(request.createdAt)}
                  </span>
                </div>

                {/* Provider info */}
                <div className="mb-3 p-2 rounded bg-muted/50 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3.5 w-3.5" />
                    <span className="font-medium">{request.provider.userName}</span>
                    {request.provider.businessName && (
                      <span className="text-muted-foreground">({request.provider.businessName})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {request.provider.email}
                  </div>
                </div>

                {/* Change data */}
                <div className="mb-3">
                  <ChangeDataDisplay type={request.changeType} data={request.data} />
                </div>

                {/* Provider message */}
                {request.message && (
                  <div className="p-2 rounded bg-blue-50 dark:bg-blue-950 text-sm">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Melding fra leverandør:
                    </p>
                    <p className="text-blue-900 dark:text-blue-100">{request.message}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 sm:flex-col">
              <Button
                size="sm"
                onClick={() => setShowApproveDialog(true)}
                disabled={isPending}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Godkjenn
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRejectDialog(true)}
                disabled={isPending}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Avvis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Godkjenn endring</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil godkjenne denne endringen? Endringen vil bli gjennomført umiddelbart.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="approveNote">Notat (valgfritt)</Label>
            <Textarea
              id="approveNote"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Eventuelt notat..."
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={isPending}>
              Avbryt
            </Button>
            <Button onClick={handleApprove} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Godkjenner...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Godkjenn
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avvis endring</DialogTitle>
            <DialogDescription>
              Oppgi en grunn for avvisning. Leverandøren vil se denne meldingen.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="rejectNote">Grunn for avvisning *</Label>
            <Textarea
              id="rejectNote"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Forklar hvorfor endringen avvises..."
              disabled={isPending}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isPending}>
              Avbryt
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Avviser...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Avvis
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ChangeRequestsClient({ requests }: ChangeRequestsClientProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Ventende endringer ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <ChangeRequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle}
              title="Ingen ventende endringer"
              description="Alle leverandørendringer er behandlet"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
