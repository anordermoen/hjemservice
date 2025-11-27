"use client";

import { useState } from "react";
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
  ExternalLink,
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

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  category: "booking" | "payment" | "provider" | "technical" | "other";
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    phone: string;
    type: "customer" | "provider";
  };
  assignedTo?: string;
  responses: {
    id: string;
    message: string;
    from: "user" | "support";
    createdAt: string;
  }[];
}

const supportTickets: SupportTicket[] = [
  {
    id: "t1",
    subject: "Kan ikke fullføre betaling",
    message: "Jeg prøver å bestille en frisørtime, men betalingen går ikke gjennom. Har prøvd både Vipps og kort. Feilmelding: 'Betaling avbrutt'.",
    category: "payment",
    status: "open",
    priority: "high",
    createdAt: "2024-12-05T10:30:00",
    updatedAt: "2024-12-05T10:30:00",
    user: {
      name: "Jonas Nilsen",
      email: "jonas.nilsen@example.com",
      phone: "+47 912 34 567",
      type: "customer",
    },
    responses: [],
  },
  {
    id: "t2",
    subject: "Leverandør møtte ikke opp",
    message: "Hadde avtale kl 14:00 i dag for renhold, men leverandøren kom ikke. Har prøvd å ringe uten svar. Ønsker refusjon.",
    category: "booking",
    status: "in_progress",
    priority: "high",
    createdAt: "2024-12-04T16:45:00",
    updatedAt: "2024-12-05T09:15:00",
    user: {
      name: "Marte Olsen",
      email: "marte.olsen@example.com",
      phone: "+47 923 45 678",
      type: "customer",
    },
    assignedTo: "admin",
    responses: [
      {
        id: "r1",
        message: "Hei Marte, beklager at dette skjedde. Vi har kontaktet leverandøren og vil følge opp saken. Vi kommer tilbake med oppdatering innen kort tid.",
        from: "support",
        createdAt: "2024-12-05T09:15:00",
      },
    ],
  },
  {
    id: "t3",
    subject: "Spørsmål om å endre tjenester",
    message: "Hvordan legger jeg til nye tjenester i profilen min? Ønsker å tilby både klipp og farge, men finner ikke hvor jeg kan gjøre dette.",
    category: "provider",
    status: "open",
    priority: "medium",
    createdAt: "2024-12-05T08:20:00",
    updatedAt: "2024-12-05T08:20:00",
    user: {
      name: "Maria Hansen",
      email: "maria.hansen@example.com",
      phone: "+47 934 56 789",
      type: "provider",
    },
    responses: [],
  },
  {
    id: "t4",
    subject: "Appen krasjer ved åpning",
    message: "Etter siste oppdatering krasjer appen hver gang jeg prøver å åpne bestillingsoversikten. iPhone 13, iOS 17.1.",
    category: "technical",
    status: "in_progress",
    priority: "medium",
    createdAt: "2024-12-03T14:00:00",
    updatedAt: "2024-12-04T11:30:00",
    user: {
      name: "Erik Strand",
      email: "erik.strand@example.com",
      phone: "+47 945 67 890",
      type: "customer",
    },
    assignedTo: "tech",
    responses: [
      {
        id: "r2",
        message: "Hei Erik, takk for at du meldte fra. Vi har identifisert feilen og jobber med en fix. Kan du prøve å slette appen og laste den ned på nytt i mellomtiden?",
        from: "support",
        createdAt: "2024-12-04T11:30:00",
      },
      {
        id: "r3",
        message: "Jeg har prøvd det, men problemet fortsetter.",
        from: "user",
        createdAt: "2024-12-04T13:45:00",
      },
    ],
  },
  {
    id: "t5",
    subject: "Utbetalingen min mangler",
    message: "Jeg fullførte 3 oppdrag forrige uke, men har ikke mottatt utbetaling ennå. Vanligvis tar det 2-3 dager.",
    category: "payment",
    status: "resolved",
    priority: "high",
    createdAt: "2024-12-01T09:00:00",
    updatedAt: "2024-12-02T14:20:00",
    user: {
      name: "Thomas Vik",
      email: "thomas.vik@example.com",
      phone: "+47 956 78 901",
      type: "provider",
    },
    assignedTo: "admin",
    responses: [
      {
        id: "r4",
        message: "Hei Thomas, vi undersøker saken og kommer tilbake til deg snarest.",
        from: "support",
        createdAt: "2024-12-01T10:30:00",
      },
      {
        id: "r5",
        message: "Vi fant feilen - det var en forsinkelse i banksystemet. Utbetalingen er nå sendt og du bør motta den innen i dag.",
        from: "support",
        createdAt: "2024-12-02T14:20:00",
      },
    ],
  },
  {
    id: "t6",
    subject: "Trenger faktura for bedrift",
    message: "Vi trenger faktura for bestillingene gjort i november til firma 'Konsulent AS'. Org.nr: 123 456 789.",
    category: "other",
    status: "resolved",
    priority: "low",
    createdAt: "2024-11-30T11:00:00",
    updatedAt: "2024-12-01T09:00:00",
    user: {
      name: "Anne Berge",
      email: "anne.berge@konsulent.no",
      phone: "+47 967 89 012",
      type: "customer",
    },
    responses: [
      {
        id: "r6",
        message: "Hei Anne, fakturaen er sendt til e-postadressen din. Gi beskjed om du trenger noe mer!",
        from: "support",
        createdAt: "2024-12-01T09:00:00",
      },
    ],
  },
];

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} min siden`;
  if (diffHours < 24) return `${diffHours} timer siden`;
  if (diffDays < 7) return `${diffDays} dager siden`;
  return formatDateTime(dateStr);
}

function getCategoryLabel(category: SupportTicket["category"]): string {
  const labels = {
    booking: "Bestilling",
    payment: "Betaling",
    provider: "Leverandør",
    technical: "Teknisk",
    other: "Annet",
  };
  return labels[category];
}

function TicketCard({
  ticket,
  onStatusChange,
}: {
  ticket: SupportTicket;
  onStatusChange: (id: string, status: SupportTicket["status"]) => void;
}) {
  const [replyText, setReplyText] = useState("");
  const initials = ticket.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

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
                    ticket.priority === "high"
                      ? "destructive"
                      : ticket.priority === "medium"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {ticket.priority === "high"
                    ? "Høy"
                    : ticket.priority === "medium"
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
                  {ticket.user.name}
                  <Badge variant="outline" className="ml-1 text-xs">
                    {ticket.user.type === "customer" ? "Kunde" : "Leverandør"}
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
            <Dialog>
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
                        <span className="font-medium">{ticket.user.name}</span>
                        <Badge variant="outline">
                          {ticket.user.type === "customer" ? "Kunde" : "Leverandør"}
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
                        <a
                          href={`tel:${ticket.user.phone}`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {ticket.user.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Ticket meta */}
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={
                        ticket.priority === "high"
                          ? "destructive"
                          : ticket.priority === "medium"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {ticket.priority === "high"
                        ? "Høy prioritet"
                        : ticket.priority === "medium"
                        ? "Medium prioritet"
                        : "Lav prioritet"}
                    </Badge>
                    <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
                    <Badge
                      variant={
                        ticket.status === "open"
                          ? "warning"
                          : ticket.status === "in_progress"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {ticket.status === "open"
                        ? "Åpen"
                        : ticket.status === "in_progress"
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
                    <p className="text-sm bg-muted/30 p-3 rounded-lg">
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
                              response.from === "support"
                                ? "bg-primary/10 ml-4"
                                : "bg-muted/30 mr-4"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">
                                {response.from === "support" ? "Support" : ticket.user.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(response.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm">{response.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply form */}
                  {ticket.status !== "resolved" && (
                    <div className="pt-3 border-t">
                      <Label htmlFor="reply" className="mb-2 block">
                        Svar til {ticket.user.name}
                      </Label>
                      <Textarea
                        id="reply"
                        placeholder="Skriv ditt svar her..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2 mt-3">
                        <Button className="flex-1">
                          <Send className="mr-2 h-4 w-4" />
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
                        onStatusChange(ticket.id, value as SupportTicket["status"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Åpen</SelectItem>
                        <SelectItem value="in_progress">Under behandling</SelectItem>
                        <SelectItem value="resolved">Løst</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {ticket.status === "open" && (
              <Button
                size="sm"
                onClick={() => onStatusChange(ticket.id, "in_progress")}
              >
                Ta sak
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState(supportTickets);

  const handleStatusChange = (id: string, status: SupportTicket["status"]) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === id ? { ...ticket, status, updatedAt: new Date().toISOString() } : ticket
      )
    );
  };

  const open = tickets.filter((t) => t.status === "open");
  const inProgress = tickets.filter((t) => t.status === "in_progress");
  const resolved = tickets.filter((t) => t.status === "resolved");

  // Stats
  const highPriorityOpen = open.filter((t) => t.priority === "high").length;
  const avgResponseTime = "2.5 timer"; // Mock

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Åpne saker</p>
                <p className="text-2xl font-bold">{open.length}</p>
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
                <p className="text-2xl font-bold">{inProgress.length}</p>
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
                <p className="text-2xl font-bold text-destructive">{highPriorityOpen}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Snitt responstid</p>
                <p className="text-2xl font-bold">{avgResponseTime}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
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
              <TabsTrigger value="open">
                Åpne ({open.length})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                Under behandling ({inProgress.length})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Løst ({resolved.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="space-y-4">
              {open.length > 0 ? (
                open.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onStatusChange={handleStatusChange}
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
