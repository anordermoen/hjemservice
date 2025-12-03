"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Send,
  Loader2,
  CheckCircle,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { addSupportResponse, closeTicket } from "@/app/actions/support";

type TicketCategory = "BOOKING" | "PAYMENT" | "PROVIDER" | "TECHNICAL" | "OTHER";
type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

interface TicketResponse {
  id: string;
  message: string;
  isAdmin: boolean;
  createdAt: Date;
  userName: string;
}

interface TicketData {
  id: string;
  subject: string;
  message: string;
  category: TicketCategory;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  responses: TicketResponse[];
}

interface TicketDetailClientProps {
  ticket: TicketData;
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCategoryLabel(category: TicketCategory): string {
  const labels: Record<TicketCategory, string> = {
    BOOKING: "Bestilling",
    PAYMENT: "Betaling",
    PROVIDER: "Leverandør",
    TECHNICAL: "Teknisk problem",
    OTHER: "Annet",
  };
  return labels[category];
}

function getStatusInfo(status: TicketStatus) {
  switch (status) {
    case "OPEN":
      return {
        badge: <Badge variant="warning">Venter på svar</Badge>,
        message: "Vi har mottatt din henvendelse og vil svare så snart som mulig.",
      };
    case "IN_PROGRESS":
      return {
        badge: <Badge variant="default">Under behandling</Badge>,
        message: "En av våre supportmedarbeidere jobber med saken din.",
      };
    case "RESOLVED":
      return {
        badge: <Badge variant="secondary">Løst</Badge>,
        message: "Denne saken er markert som løst.",
      };
  }
}

export function TicketDetailClient({ ticket }: TicketDetailClientProps) {
  const router = useRouter();
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isClosing, startClosing] = useTransition();
  const [error, setError] = useState("");

  const statusInfo = getStatusInfo(ticket.status);

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    setError("");
    startTransition(async () => {
      const result = await addSupportResponse(ticket.id, replyText.trim());
      if (result.error) {
        setError(result.error);
      } else {
        setReplyText("");
        router.refresh();
      }
    });
  };

  const handleCloseTicket = () => {
    if (!confirm("Er du sikker på at du vil lukke denne saken?")) return;

    setError("");
    startClosing(async () => {
      const result = await closeTicket(ticket.id);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/mine-sider/hjelp"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Tilbake til henvendelser
      </Link>

      {/* Ticket header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>{ticket.subject}</CardTitle>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {statusInfo.badge}
                <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Opprettet {formatDateTime(ticket.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-3 rounded-lg bg-muted/30 text-sm">
            {statusInfo.message}
          </div>
        </CardContent>
      </Card>

      {/* Conversation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Samtale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Original message */}
          <div className="p-4 rounded-lg bg-muted/30 mr-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Du</span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(ticket.createdAt)}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
          </div>

          {/* Responses */}
          {ticket.responses.map((response) => (
            <div
              key={response.id}
              className={`p-4 rounded-lg ${
                response.isAdmin
                  ? "bg-primary/10 ml-8"
                  : "bg-muted/30 mr-8"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">{response.userName}</span>
                {response.isAdmin && (
                  <Badge variant="outline" className="text-xs">
                    Support
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(response.createdAt)}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{response.message}</p>
            </div>
          ))}

          {/* Reply form */}
          {ticket.status !== "RESOLVED" ? (
            <div className="pt-4 border-t">
              {error && (
                <div className="mb-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Textarea
                placeholder="Skriv ditt svar her..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                disabled={isPending || isClosing}
                className="mb-3"
              />
              <div className="flex items-center justify-between gap-3">
                <Button
                  onClick={handleSendReply}
                  disabled={isPending || isClosing || !replyText.trim()}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sender...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send svar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCloseTicket}
                  disabled={isPending || isClosing}
                >
                  {isClosing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Lukker...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Lukk sak
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Lukk saken hvis problemet er løst eller du ikke trenger mer hjelp.
              </p>
            </div>
          ) : (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Denne saken er løst. Opprett en ny henvendelse hvis du trenger mer hjelp.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
