"use client";

import { useState, useTransition } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ReviewDialogProps {
  bookingId: string;
  providerName: string;
  serviceName: string;
  onSubmit: (bookingId: string, rating: number, comment: string) => Promise<{ error?: string; success?: boolean }>;
  trigger?: React.ReactNode;
}

export function ReviewDialog({
  bookingId,
  providerName,
  serviceName,
  onSubmit,
  trigger,
}: ReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (rating === 0) {
      setError("Velg en vurdering fra 1 til 5 stjerner");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await onSubmit(bookingId, rating, comment);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setRating(0);
        setComment("");
      }
    });
  };

  const displayRating = hoveredRating || rating;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button size="sm">Gi vurdering</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gi vurdering</DialogTitle>
          <DialogDescription>
            Del din erfaring med {providerName} for {serviceName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Din vurdering</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  disabled={isPending}
                  aria-label={`${star} stjerner`}
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      star <= displayRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <p className="text-sm text-muted-foreground">
                {displayRating === 1 && "Svært dårlig"}
                {displayRating === 2 && "Dårlig"}
                {displayRating === 3 && "OK"}
                {displayRating === 4 && "Bra"}
                {displayRating === 5 && "Utmerket"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Kommentar (valgfritt)</Label>
            <Textarea
              id="comment"
              placeholder="Beskriv din opplevelse..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
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
              "Send vurdering"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
