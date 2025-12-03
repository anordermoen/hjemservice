"use client";

import { useState, useTransition } from "react";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  Calendar,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/EmptyState";
import { TipList } from "@/components/common/InfoBox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addSupportResponse,
  updateSupportTicketStatus,
  takeTicket,
  reopenTicket,
} from "@/app/actions/support";
import { formatDate } from "@/lib/utils";

interface TicketResponse {
  id: string;
  message: string;
  isAdmin: boolean;
  createdAt: Date;
  user: {
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
}

interface TicketData {
  id: string;
  subject: string;
  message: string;
  category: "BOOKING" | "PAYMENT" | "PROVIDER" | "TECHNICAL" | "OTHER";
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  assignedTo: string | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    role: string;
  };
  responses: TicketResponse[];
}

interface SupportStats {
  open: number;
  inProgress: number;
  resolved: number;
  highPriority: number;
}

interface SupportClientProps {
  tickets: TicketData[];
  stats: SupportStats;
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

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} min siden`;
  if (diffHours < 24) return `${diffHours} timer siden`;
  if (diffDays < 7) return `${diffDays} dager siden`;
  return formatDateTime(date);
}

function getCategoryLabel(category: TicketData["category"]): string {
  const labels = {
    BOOKING: "Bestilling",
    PAYMENT: "Betaling",
    PROVIDER: "Leverandør",
    TECHNICAL: "Teknisk",
    OTHER: "Annet",
  };
  return labels[category];
}

function TicketCard({
  ticket,
  onStatusChange,
  onTakeTicket,
  onReopenTicket,
  onSendReply,
  isPending,
}: {
  ticket: TicketData;
  onStatusChange: (id: string, status: TicketData["status"]) => void;
  onTakeTicket: (id: string) => void;
  onReopenTicket: (id: string) => void;
  onSendReply: (id: string, message: string) => void;
  isPending: boolean;
}) {
  const [replyText, setReplyText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const userName = `${ticket.user.firstName || ""} ${ticket.user.lastName || ""}`.trim() || "Ukjent";
  const initials = `${ticket.user.firstName?.[0] || ""}${ticket.user.lastName?.[0] || ""}` || "?";

  const handleSendReply = () => {
    if (replyText.trim()) {
      onSendReply(ticket.id, replyText);
      setReplyText("");
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold">{ticket.subject}</h3>
                <Badge
                  variant={
                    ticket.priority === "HIGH"
                      ? "destructive"
                      : ticket.priority === "MEDIUM"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {ticket.priority === "HIGH"
                    ? "Høy"
                    : ticket.priority === "MEDIUM"
                    ? "Medium"
                    : "Lav"}
                </Badge>
                <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {ticket.message}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {userName}
                  <Badge variant="outline" className="ml-1 text-xs">
                    {ticket.user.role === "CUSTOMER" ? "Kunde" : ticket.user.role === "PROVIDER" ? "Leverandør" : "Admin"}
                  </Badge>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(ticket.createdAt)}
                </span>
                {ticket.responses.length > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {ticket.responses.length} svar
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 sm:flex-col">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Se detaljer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{ticket.subject}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* User info */}
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{userName}</span>
                        <Badge variant="outline">
                          {ticket.user.role === "CUSTOMER" ? "Kunde" : ticket.user.role === "PROVIDER" ? "Leverandør" : "Admin"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm">
                        <a
                          href={`mailto:${ticket.user.email}`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {ticket.user.email}
                        </a>
                        {ticket.user.phone && (
                          <a
                            href={`tel:${ticket.user.phone}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {ticket.user.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ticket meta */}
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={
                        ticket.priority === "HIGH"
                          ? "destructive"
                          : ticket.priority === "MEDIUM"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {ticket.priority === "HIGH"
                        ? "Høy prioritet"
                        : ticket.priority === "MEDIUM"
                        ? "Medium prioritet"
                        : "Lav prioritet"}
                    </Badge>
                    <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
                    <Badge
                      variant={
                        ticket.status === "OPEN"
                          ? "warning"
                          : ticket.status === "IN_PROGRESS"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {ticket.status === "OPEN"
                        ? "Åpen"
                        : ticket.status === "IN_PROGRESS"
                        ? "Under behandling"
                        : "Løst"}
                    </Badge>
                  </div>

                  {/* Original message */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Melding - {formatDateTime(ticket.createdAt)}
                    </h4>
                    <p className="text-sm bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">
                      {ticket.message}
                    </p>
                  </div>

                  {/* Conversation */}
                  {ticket.responses.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Samtale</h4>
                      <div className="space-y-3">
                        {ticket.responses.map((response) => (
                          <div
                            key={response.id}
                            className={`p-3 rounded-lg ${
                              response.isAdmin
                                ? "bg-primary/10 ml-4"
                                : "bg-muted/30 mr-4"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">
                                {response.isAdmin
                                  ? "Support"
                                  : `${response.user.firstName || ""} ${response.user.lastName || ""}`.trim() || "Bruker"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(response.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{response.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply form */}
                  {ticket.status !== "RESOLVED" && (
                    <div className="pt-3 border-t">
                      <Label htmlFor="reply" className="mb-2 block">
                        Svar til {userName}
                      </Label>
                      <Textarea
                        id="reply"
                        placeholder="Skriv ditt svar her..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                        disabled={isPending}
                      />
                      <div className="flex gap-2 mt-3">
                        <Button
                          className="flex-1"
                          onClick={handleSendReply}
                          disabled={isPending || !replyText.trim()}
                        >
                          {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="mr-2 h-4 w-4" />
                          )}
                          Send svar
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Status change */}
                  <div className="pt-3 border-t">
                    <Label className="mb-2 block">Endre status</Label>
                    <Select
                      value={ticket.status}
                      onValueChange={(value) =>
                        onStatusChange(ticket.id, value as TicketData["status"])
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Åpen</SelectItem>
                        <SelectItem value="IN_PROGRESS">Under behandling</SelectItem>
                        <SelectItem value="RESOLVED">Løst</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {ticket.status === "OPEN" && (
              <Button
                size="sm"
                onClick={() => onTakeTicket(ticket.id)}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Ta sak
              </Button>
            )}

            {ticket.status === "RESOLVED" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReopenTicket(ticket.id)}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Gjenåpne
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SupportClient({ tickets, stats }: SupportClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (id: string, status: TicketData["status"]) => {
    startTransition(async () => {
      await updateSupportTicketStatus(id, status);
    });
  };

  const handleTakeTicket = (id: string) => {
    startTransition(async () => {
      await takeTicket(id);
    });
  };

  const handleReopenTicket = (id: string) => {
    startTransition(async () => {
      await reopenTicket(id);
    });
  };

  const handleSendReply = (id: string, message: string) => {
    startTransition(async () => {
      await addSupportResponse(id, message);
    });
  };

  const open = tickets.filter((t) => t.status === "OPEN");
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS");
  const resolved = tickets.filter((t) => t.status === "RESOLVED");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Åpne saker</p>
                <p className="text-2xl font-bold">{stats.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Under behandling</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Høy prioritet</p>
                <p className="text-2xl font-bold text-destructive">{stats.highPriority}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Løste saker</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Supporthenvendelser</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open">
            <TabsList className="mb-4">
              <TabsTrigger value="open">Åpne ({open.length})</TabsTrigger>
              <TabsTrigger value="in_progress">
                Under behandling ({inProgress.length})
              </TabsTrigger>
              <TabsTrigger value="resolved">Løst ({resolved.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="space-y-4">
              {open.length > 0 ? (
                open.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onStatusChange={handleStatusChange}
                    onTakeTicket={handleTakeTicket}
                    onReopenTicket={handleReopenTicket}
                    onSendReply={handleSendReply}
                    isPending={isPending}
                  />
                ))
              ) : (
                <EmptyState
                  icon={CheckCircle}
                  title="Ingen åpne saker"
                  description="Alle supporthenvendelser er håndtert"
                />
              )}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-4">
              {inProgress.length > 0 ? (
                inProgress.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onStatusChange={handleStatusChange}
                    onTakeTicket={handleTakeTicket}
                    onReopenTicket={handleReopenTicket}
                    onSendReply={handleSendReply}
                    isPending={isPending}
                  />
                ))
              ) : (
                <EmptyState
                  icon={Clock}
                  title="Ingen saker under behandling"
                  description="Ta en åpen sak for å starte behandling"
                />
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {resolved.length > 0 ? (
                resolved.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onStatusChange={handleStatusChange}
                    onTakeTicket={handleTakeTicket}
                    onReopenTicket={handleReopenTicket}
                    onSendReply={handleSendReply}
                    isPending={isPending}
                  />
                ))
              ) : (
                <EmptyState
                  icon={MessageSquare}
                  title="Ingen løste saker"
                  description="Løste saker vil vises her"
                />
              )}
            </TabsContent>
          </Tabs>

          <TipList
            title="Support-tips"
            className="mt-6"
            tips={[
              "Prioriter høy-prioritet saker først",
              "Svar alltid innen 24 timer på åpne henvendelser",
              "Ved betalingsproblemer, sjekk transaksjonsstatus først",
              "Dokumenter løsningen for fremtidig referanse",
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
