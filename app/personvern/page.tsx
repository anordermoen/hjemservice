import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PersonvernPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-4xl font-bold">Personvernerklæring</h1>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>1. Innledning</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            HjemService tar ditt personvern på alvor. Denne erklæringen beskriver hvordan vi samler inn, bruker og beskytter dine personopplysninger.
                        </p>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>2. Hvilke opplysninger samler vi inn?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Vi samler inn følgende informasjon:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Navn, e-postadresse og telefonnummer</li>
                            <li>Adresseinformasjon for tjenesteleveranser</li>
                            <li>Betalingsinformasjon (behandles av tredjeparter)</li>
                            <li>Bestillings- og tilbudshistorikk</li>
                            <li>Kommunikasjon mellom deg og leverandører</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>3. Hvordan bruker vi opplysningene?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Vi bruker dine opplysninger til å:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Formidle kontakt mellom deg og leverandører</li>
                            <li>Behandle bestillinger og betalinger</li>
                            <li>Sende viktige oppdateringer om dine bestillinger</li>
                            <li>Forbedre våre tjenester</li>
                            <li>Overholde juridiske forpliktelser</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>4. Deling av opplysninger</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            Vi deler kun dine opplysninger med leverandører du velger å kontakte eller bestille fra. Vi selger aldri dine personopplysninger til tredjeparter.
                        </p>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>5. Dine rettigheter</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Du har rett til å:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Få innsyn i dine personopplysninger</li>
                            <li>Rette uriktige opplysninger</li>
                            <li>Slette din konto og opplysninger</li>
                            <li>Trekke tilbake samtykke</li>
                            <li>Klage til Datatilsynet</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>6. Kontakt oss</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>
                            For spørsmål om personvern, kontakt oss på: <a href="mailto:personvern@hjemservice.no" className="text-primary hover:underline">personvern@hjemservice.no</a>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
