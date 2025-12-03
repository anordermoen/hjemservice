"use client";

import { useState, useTransition } from "react";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Plus,
  Send,
  Loader2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { createSupportTicket } from "@/app/actions/support";
import { useRouter } from "next/navigation";

type TicketCategory = "BOOKING" | "PAYMENT" | "PROVIDER" | "TECHNICAL" | "OTHER";
type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

interface TicketSummary {
  id: string;
  subject: string;
  message: string;
  category: TicketCategory;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  hasNewResponse: boolean;
}

interface CustomerSupportClientProps {
  tickets: TicketSummary[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
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
  return formatDate(date);
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

function getStatusBadge(status: TicketStatus) {
  switch (status) {
    case "OPEN":
      return <Badge variant="warning">Venter på svar</Badge>;
    case "IN_PROGRESS":
      return <Badge variant="default">Under behandling</Badge>;
    case "RESOLVED":
      return <Badge variant="secondary">Løst</Badge>;
  }
}

function NewTicketDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<TicketCategory>("OTHER");

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      setError("Fyll ut alle feltene");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await createSupportTicket({
        subject: subject.trim(),
        message: message.trim(),
        category,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setSubject("");
        setMessage("");
        setCategory("OTHER");
        onSuccess();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ny henvendelse
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ny supporthenvendelse</DialogTitle>
          <DialogDescription>
            Beskriv problemet ditt så hjelper vi deg så fort vi kan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as TicketCategory)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BOOKING">Bestilling</SelectItem>
                <SelectItem value="PAYMENT">Betaling</SelectItem>
                <SelectItem value="PROVIDER">Leverandør</SelectItem>
                <SelectItem value="TECHNICAL">Teknisk problem</SelectItem>
                <SelectItem value="OTHER">Annet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Emne</Label>
            <Input
              id="subject"
              placeholder="Kort beskrivelse av problemet"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Beskrivelse</Label>
            <Textarea
              id="message"
              placeholder="Beskriv problemet i detalj..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sender...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send henvendelse
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TicketCard({ ticket }: { ticket: TicketSummary }) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => router.push(`/mine-sider/hjelp/${ticket.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-medium">{ticket.subject}</h3>
              {ticket.hasNewResponse && ticket.status !== "RESOLVED" && (
                <Badge variant="destructive" className="text-xs">
                  Nytt svar
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {ticket.message}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {getStatusBadge(ticket.status)}
              <Badge variant="outline">{getCategoryLabel(ticket.category)}</Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(ticket.createdAt)}
              </span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

export function CustomerSupportClient({ tickets }: CustomerSupportClientProps) {
  const router = useRouter();

  const handleTicketCreated = () => {
    router.refresh();
  };

  const activeTickets = tickets.filter((t) => t.status !== "RESOLVED");
  const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Hjelp og support</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Har du spørsmål eller problemer? Vi hjelper deg gjerne.
              </p>
            </div>
            <NewTicketDialog onSuccess={handleTicketCreated} />
          </div>
        </CardHeader>
      </Card>

      {/* Quick help */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vanlige spørsmål</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3 rounded-lg border">
              <h4 className="font-medium text-sm mb-1">Hvordan avbestiller jeg?</h4>
              <p className="text-xs text-muted-foreground">
                Gå til Mine bestillinger → Velg bestilling → Avbestill. Gratis inntil 24 timer før.
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <h4 className="font-medium text-sm mb-1">Når får jeg refusjon?</h4>
              <p className="text-xs text-muted-foreground">
                Refusjoner behandles innen 3-5 virkedager og sendes til original betalingsmetode.
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <h4 className="font-medium text-sm mb-1">Leverandøren møtte ikke</h4>
              <p className="text-xs text-muted-foreground">
                Kontakt oss via ny henvendelse så ordner vi full refusjon.
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <h4 className="font-medium text-sm mb-1">Endre betalingsmetode</h4>
              <p className="text-xs text-muted-foreground">
                Du velger betalingsmetode ved hver bestilling. Vi lagrer ikke kortinfo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active tickets */}
      {activeTickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Aktive henvendelser ({activeTickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resolved tickets */}
      {resolvedTickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Løste henvendelser ({resolvedTickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resolvedTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {tickets.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={MessageSquare}
              title="Ingen henvendelser"
              description="Du har ikke sendt noen supporthenvendelser ennå"
              action={<NewTicketDialog onSuccess={handleTicketCreated} />}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
