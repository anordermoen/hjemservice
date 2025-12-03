import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VilkarPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-4xl font-bold">Vilkår og betingelser</h1>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>1. Generelle vilkår</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            Ved å bruke HjemService aksepterer du disse vilkårene. Plattformen formidler kontakt mellom kunder og leverandører av hjemmetjenester.
                        </p>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>2. Brukerkontoer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            Du er ansvarlig for å holde din konto sikker og for all aktivitet som skjer under din konto.
                        </p>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>3. Bestillinger og betalinger</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            Alle priser er oppgitt i NOK inkludert mva. Betaling skjer gjennom Vipps eller kort.
                        </p>
                        <p>
                            Ved direktebestilling er du forpliktet til å betale for tjenesten. Ved tilbudsforespørsler er du ikke forpliktet før du aksepterer et tilbud.
                        </p>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>4. Avbestilling</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            Avbestilling må skje senest 24 timer før avtalt tid for full refusjon. Ved senere avbestilling kan det påløpe gebyr.
                        </p>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>5. Leverandøransvar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            Leverandører er selvstendige næringsdrivende. HjemService er kun en formidlingsplattform og er ikke ansvarlig for kvaliteten på utførte tjenester.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>6. Endringer i vilkår</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            Vi forbeholder oss retten til å endre disse vilkårene. Endringer vil bli kommunisert via e-post eller på plattformen.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
