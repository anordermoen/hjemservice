import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Bestilling kansellert | HjemService",
  description: "Din bestilling er kansellert.",
};

export default function CancellationConfirmedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-md">
        {/* Success message */}
        <div className="mb-8 text-center" role="status" aria-live="polite">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100" aria-hidden="true">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Bestillingen er kansellert</h1>
          <p className="text-muted-foreground">
            Du vil motta en bekreftelse på e-post.
          </p>
        </div>

        {/* Info card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-medium mb-2">Refusjon</h2>
            <p className="text-sm text-muted-foreground">
              Eventuell refusjon vil bli tilbakeført til din betalingsmetode innen 3-5 virkedager.
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button className="w-full" size="lg" asChild>
            <Link href="/mine-sider/bestillinger">
              Se mine bestillinger
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>

          <Button variant="outline" className="w-full" size="lg" asChild>
            <Link href="/tjenester">Finn nye tjenester</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
