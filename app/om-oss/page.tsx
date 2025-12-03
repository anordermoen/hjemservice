import Link from "next/link";

export default function OmOssPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-4xl font-bold">Om HjemService</h1>

                <div className="prose prose-lg max-w-none">
                    <p className="text-lg text-muted-foreground mb-6">
                        HjemService er Norges ledende plattform for å finne og bestille hjemmetjenester. Vi gjør det enkelt å få hjelp til alt fra frisør og renhold til håndverkertjenester - rett hjem til deg.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Vår visjon</h2>
                    <p className="text-muted-foreground mb-6">
                        Vi ønsker å gjøre hverdagen enklere for folk ved å samle kvalifiserte leverandører av hjemmetjenester på én plattform. Samtidig hjelper vi små bedrifter og selvstendige næringsdrivende med å nå ut til nye kunder.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Hvordan fungerer det?</h2>
                    <div className="grid gap-6 md:grid-cols-2 my-6">
                        <div className="border rounded-lg p-6">
                            <h3 className="font-semibold text-lg mb-2">For kunder</h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>✓ Søk etter tjenester i ditt område</li>
                                <li>✓ Sammenlign priser og anmeldelser</li>
                                <li>✓ Book direkte eller be om tilbud</li>
                                <li>✓ Betal trygt med Vipps eller kort</li>
                            </ul>
                        </div>
                        <div className="border rounded-lg p-6">
                            <h3 className="font-semibold text-lg mb-2">For leverandører</h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>✓ Få tilgang til nye kunder</li>
                                <li>✓ Administrer bookinger enkelt</li>
                                <li>✓ Bygg opp din profil og anmeldelser</li>
                                <li>✓ Fokuser på det du er best på</li>
                            </ul>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Kvalitet og trygghet</h2>
                    <p className="text-muted-foreground mb-6">
                        Vi verifiserer alle leverandører og krever relevant dokumentasjon som politiattest og forsikring der det er nødvendig. Vårt anmeldelsessystem sikrer at du kan stole på kvaliteten.
                    </p>

                    <div className="mt-8 p-6 bg-muted rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">Bli en del av HjemService</h3>
                        <p className="text-muted-foreground mb-4">
                            Er du leverandør av hjemmetjenester? Bli med i vårt nettverk og nå ut til tusenvis av potensielle kunder.
                        </p>
                        <Link
                            href="/bli-leverandor"
                            className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Bli leverandør
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
