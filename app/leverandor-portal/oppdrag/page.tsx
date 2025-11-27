"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Phone,
  User,
  MessageSquare,
  KeyRound,
  Building,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/common/EmptyState";
import { TipList } from "@/components/common/InfoBox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getBookingsByProviderId, isWithin24Hours, calculateCancellationFee } from "@/lib/data/bookings";
import { formatPrice, formatDate, formatTime } from "@/lib/utils";
import { Booking } from "@/types";

// In a real app, this would come from auth
const currentProviderId = "p1";

function BookingCard({
  booking,
  type,
  onCancel,
  onRefundFee,
}: {
  booking: Booking;
  type: "pending" | "upcoming" | "completed" | "cancelled";
  onCancel?: (booking: Booking) => void;
  onRefundFee?: (booking: Booking) => void;
}) {
  const within24Hours = type === "upcoming" && isWithin24Hours(booking);
  const serviceNames = booking.services.map((s) => s.name).join(", ");
  const totalDuration = booking.services.reduce((sum, s) => sum + s.duration, 0);
  const hasCancellationFee =
    booking.cancellation?.wasWithin24Hours &&
    booking.cancellation.cancellationFee > 0 &&
    !booking.cancellation.feeRefunded;

  const customerInitials = booking.recipientName
    ? booking.recipientName.split(" ").map(n => n[0]).join("").slice(0, 2)
    : "KU";

  return (
    <div className="rounded-lg border p-4">
      {/* Header with service and status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium">{serviceNames}</h3>
          {type === "pending" && (
            <Badge className="bg-amber-100 text-amber-800">Venter på svar</Badge>
          )}
          {type === "upcoming" && (
            <Badge className="bg-green-100 text-green-800">Bekreftet</Badge>
          )}
          {type === "completed" && <Badge variant="secondary">Fullført</Badge>}
          {type === "cancelled" && (
            <Badge variant="destructive">
              Avbestilt av {booking.cancellation?.cancelledBy === "customer" ? "kunde" : "deg"}
            </Badge>
          )}
        </div>
        <div className="text-right">
          <p className="font-semibold text-primary">{formatPrice(booking.providerPayout)}</p>
          <p className="text-xs text-muted-foreground">av {formatPrice(booking.totalPrice)}</p>
        </div>
      </div>

      {/* Customer info */}
      <div className="flex items-start gap-3 mb-3 p-3 bg-muted/30 rounded-lg">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{customerInitials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{booking.recipientName || "Kunde"}</span>
          </div>
          {booking.recipientPhone && (
            <a
              href={`tel:${booking.recipientPhone}`}
              className="flex items-center gap-1 text-sm text-primary hover:underline mt-1"
            >
              <Phone className="h-3.5 w-3.5" />
              {booking.recipientPhone}
            </a>
          )}
        </div>
        {(type === "upcoming" || type === "pending") && booking.recipientPhone && (
          <a href={`tel:${booking.recipientPhone}`}>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-1" />
              Ring
            </Button>
          </a>
        )}
      </div>

      {/* Time and location */}
      <div className="grid gap-2 sm:grid-cols-2 mb-3">
        <div className="flex items-start gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">{formatDate(booking.scheduledAt)}</p>
            <p className="text-muted-foreground">
              kl. {formatTime(booking.scheduledAt)} ({totalDuration} min)
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">{booking.address.street}</p>
            <p className="text-muted-foreground">
              {booking.address.postalCode} {booking.address.city}
            </p>
          </div>
        </div>
      </div>

      {/* Additional address details */}
      {(booking.address.floor || booking.address.entryCode || booking.address.instructions) && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg space-y-2 text-sm">
          {booking.address.floor && (
            <p className="flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-600" />
              <span>Etasje: {booking.address.floor}</span>
            </p>
          )}
          {booking.address.entryCode && (
            <p className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-blue-600" />
              <span>Portkode: <strong>{booking.address.entryCode}</strong></span>
            </p>
          )}
          {booking.address.instructions && (
            <p className="flex items-start gap-2">
              <StickyNote className="h-4 w-4 text-blue-600 mt-0.5" />
              <span>{booking.address.instructions}</span>
            </p>
          )}
        </div>
      )}

      {/* Customer notes */}
      {booking.notes && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="flex items-start gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-amber-600 mt-0.5" />
            <span><strong>Merknad fra kunde:</strong> {booking.notes}</span>
          </p>
        </div>
      )}

      {within24Hours && (
        <div className="mb-3 flex items-center gap-1 text-sm text-amber-600 bg-amber-50 p-2 rounded">
          <AlertTriangle className="h-4 w-4" />
          <span>Under 24 timer til oppdrag</span>
        </div>
      )}

      {hasCancellationFee && (
        <div className="mb-3 p-3 rounded bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-800 font-medium">
            Avbestillingsgebyr: {formatPrice(booking.cancellation!.cancellationFee)}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            Du kan velge å refundere dette til kunden for god kundeservice
          </p>
        </div>
      )}

      {booking.cancellation?.feeRefunded && (
        <p className="mb-3 text-sm text-green-600 bg-green-50 p-2 rounded">
          ✓ Gebyr refundert til kunde
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap pt-3 border-t">
        {type === "pending" && (
          <>
            <Button size="sm" variant="outline" className="text-destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Avslå
            </Button>
            <Button size="sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              Godta oppdrag
            </Button>
          </>
        )}
        {type === "upcoming" && (
          <>
            <Button size="sm" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send melding
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => onCancel?.(booking)}
            >
              Avbestill
            </Button>
          </>
        )}
        {type === "completed" && (
          <Button size="sm" variant="outline">
            Vis kvittering
          </Button>
        )}
        {type === "cancelled" && hasCancellationFee && (
          <Button size="sm" variant="outline" onClick={() => onRefundFee?.(booking)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refunder gebyr til kunde
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ProviderBookingsPage() {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const allBookings = getBookingsByProviderId(currentProviderId);
  const now = new Date();

  const pending = allBookings.filter((b) => b.status === "pending");
  const upcoming = allBookings.filter(
    (b) => b.status === "confirmed" && b.scheduledAt > now
  );
  const completed = allBookings.filter((b) => b.status === "completed");
  const cancelled = allBookings.filter((b) => b.status === "cancelled");

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleRefundClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setRefundDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    // In a real app, this would call an API
    console.log("Cancelling booking:", selectedBooking?.id, "Reason:", cancelReason);
    setCancelDialogOpen(false);
    setSelectedBooking(null);
    setCancelReason("");
  };

  const handleConfirmRefund = () => {
    // In a real app, this would call an API
    console.log("Refunding fee for booking:", selectedBooking?.id);
    setRefundDialogOpen(false);
    setSelectedBooking(null);
  };

  const cancellationFee = selectedBooking ? calculateCancellationFee(selectedBooking) : 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Oppdrag</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-4 w-full justify-start overflow-x-auto">
              <TabsTrigger value="pending">Ventende ({pending.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Kommende ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="completed">Fullførte ({completed.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Avbestilte ({cancelled.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pending.length > 0 ? (
                pending.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} type="pending" />
                ))
              ) : (
                <EmptyState
                  icon={Clock}
                  title="Ingen ventende forespørsler"
                  description="Nye bookingforespørsler fra kunder vil dukke opp her"
                />
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              {upcoming.length > 0 ? (
                upcoming.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    type="upcoming"
                    onCancel={handleCancelClick}
                  />
                ))
              ) : (
                <EmptyState
                  icon={CheckCircle}
                  title="Ingen kommende oppdrag"
                  description="Bekreftede oppdrag vil vises her"
                />
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completed.length > 0 ? (
                completed.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} type="completed" />
                ))
              ) : (
                <EmptyState title="Ingen fullførte oppdrag ennå" />
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {cancelled.length > 0 ? (
                cancelled.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    type="cancelled"
                    onRefundFee={handleRefundClick}
                  />
                ))
              ) : (
                <EmptyState title="Ingen avbestilte oppdrag" />
              )}
            </TabsContent>
          </Tabs>

          <TipList
            title="Avbestillingsregler"
            className="mt-6"
            tips={[
              "Kunder kan avbestille gratis mer enn 24 timer før",
              "Ved avbestilling innen 24 timer betaler kunden 50% gebyr",
              "Du kan velge å refundere gebyret til kunden",
              "Du kan avbestille oppdrag hvis nødvendig, men dette påvirker din rating",
            ]}
          />
        </CardContent>
      </Card>

      {/* Cancel booking dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avbestill oppdrag</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil avbestille dette oppdraget? Dette kan påvirke din rating og pålitelighetspoeng.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="py-4">
              <div className="rounded-lg bg-muted p-3 mb-4">
                <p className="font-medium">
                  {selectedBooking.services.map((s) => s.name).join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedBooking.scheduledAt)} kl.{" "}
                  {selectedBooking.scheduledAt.toLocaleTimeString("nb-NO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancel-reason">Årsak til avbestilling</Label>
                <Textarea
                  id="cancel-reason"
                  placeholder="Beskriv hvorfor du må avbestille..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Avbryt
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              Bekreft avbestilling
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund fee dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refunder avbestillingsgebyr</DialogTitle>
            <DialogDescription>
              Du kan velge å refundere avbestillingsgebyret til kunden. Dette er valgfritt og kan bidra til god kundeservice.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking?.cancellation && (
            <div className="py-4">
              <div className="rounded-lg bg-muted p-3">
                <div className="flex justify-between items-center">
                  <span>Avbestillingsgebyr</span>
                  <span className="font-semibold">
                    {formatPrice(selectedBooking.cancellation.cancellationFee)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Dette beløpet vil bli tilbakeført til kundens betalingsmetode.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Avbryt
            </Button>
            <Button onClick={handleConfirmRefund}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Refunder gebyr
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
