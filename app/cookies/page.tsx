import { Card, CardContent } from "@/components/ui/card";

export default function CookiesPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-4xl font-bold">Informasjonskapsler (Cookies)</h1>

                <Card className="mb-6">
                    <CardContent className="pt-6 space-y-4 text-muted-foreground">
                        <p>
                            HjemService bruker informasjonskapsler (cookies) for å forbedre brukeropplevelsen og sikre at plattformen fungerer optimalt.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground mt-6">Hva er informasjonskapsler?</h3>
                        <p>
                            Informasjonskapsler er små tekstfiler som lagres på din enhet når du besøker nettsider. De brukes til å huske dine preferanser og forbedre funksjonaliteten.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground mt-6">Hvilke cookies bruker vi?</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Nødvendige cookies:</strong> Kreves for at plattformen skal fungere, inkludert innlogging og sikkerhet</li>
                            <li><strong>Funksjonelle cookies:</strong> Husker dine valg og preferanser</li>
                            <li><strong>Ytelsescookies:</strong> Hjelper oss å forstå hvordan plattformen brukes</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-foreground mt-6">Administrere cookies</h3>
                        <p>
                            Du kan når som helst slette eller blokkere cookies gjennom nettleserens innstillinger. Merk at dette kan påvirke funksjonaliteten på plattformen.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
