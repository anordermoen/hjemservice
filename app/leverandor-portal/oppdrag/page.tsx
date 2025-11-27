"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, MapPin, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { formatPrice, formatDate } from "@/lib/utils";
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
  const hasCancellationFee =
    booking.cancellation?.wasWithin24Hours &&
    booking.cancellation.cancellationFee > 0 &&
    !booking.cancellation.feeRefunded;

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium">{serviceNames}</h3>
          {type === "pending" && (
            <Badge className="bg-amber-100 text-amber-800">Venter</Badge>
          )}
          {type === "upcoming" && (
            <Badge className="bg-green-100 text-green-800">Bekreftet</Badge>
          )}
          {type === "completed" && <Badge variant="secondary">Fullført</Badge>}
          {type === "cancelled" && (
            <Badge variant="destructive">
              Avbestilt av{" "}
              {booking.cancellation?.cancelledBy === "customer" ? "kunde" : "deg"}
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium mt-1">
          {booking.recipientName || "Kunde"}
        </p>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {formatDate(booking.scheduledAt)} kl.{" "}
            {booking.scheduledAt.toLocaleTimeString("nb-NO", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {booking.address.street}, {booking.address.postalCode} {booking.address.city}
          </p>
        </div>
        <p className="mt-2 font-semibold">{formatPrice(booking.totalPrice)}</p>

        {within24Hours && (
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            <span>Under 24 timer til oppdrag</span>
          </div>
        )}

        {hasCancellationFee && (
          <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">
              Avbestillingsgebyr: {formatPrice(booking.cancellation!.cancellationFee)}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Du kan velge å refundere dette til kunden
            </p>
          </div>
        )}

        {booking.cancellation?.feeRefunded && (
          <p className="mt-2 text-xs text-green-600">
            Gebyr refundert til kunde
          </p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {type === "pending" && (
          <>
            <Button size="sm" variant="outline">
              <XCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              Avslå
            </Button>
            <Button size="sm">
              <CheckCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              Godta
            </Button>
          </>
        )}
        {type === "upcoming" && (
          <>
            <Button size="sm" variant="outline">
              Kontakt
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
            Vis detaljer
          </Button>
        )}
        {type === "cancelled" && hasCancellationFee && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRefundFee?.(booking)}
          >
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Refunder gebyr
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
                <p className="py-8 text-center text-muted-foreground">
                  Ingen ventende forespørsler
                </p>
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
                <p className="py-8 text-center text-muted-foreground">
                  Ingen kommende oppdrag
                </p>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completed.length > 0 ? (
                completed.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} type="completed" />
                ))
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  Ingen fullførte oppdrag ennå
                </p>
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
                <p className="py-8 text-center text-muted-foreground">
                  Ingen avbestilte oppdrag
                </p>
              )}
            </TabsContent>
          </Tabs>

          {/* Cancellation policy info */}
          <div className="mt-6 rounded-lg bg-muted/40 p-4">
            <h3 className="font-medium mb-2">Avbestillingsregler</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Kunder kan avbestille gratis mer enn 24 timer før</li>
              <li>• Ved avbestilling innen 24 timer betaler kunden 50% gebyr</li>
              <li>• Du kan velge å refundere gebyret til kunden</li>
              <li>• Du kan avbestille oppdrag hvis nødvendig, men dette påvirker din rating</li>
            </ul>
          </div>
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
