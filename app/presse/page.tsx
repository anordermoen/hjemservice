import Link from "next/link";
import { Mail, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const pressReleases = [
    {
        id: 1,
        title: "HjemService lanserer ny app for enklere booking",
        date: "2024-11-15",
        summary: "Den nye appen gjør det enda enklere for kunder å finne og booke kvalifiserte leverandører av hjemmetjenester.",
    },
    {
        id: 2,
        title: "HjemService passerer 10 000 leverandører",
        date: "2024-09-20",
        summary: "Plattformen feirer en viktig milepæl med over 10 000 verifiserte leverandører på landsbasis.",
    },
    {
        id: 3,
        title: "Ny partneravtale med forsikringsselskap",
        date: "2024-06-10",
        summary: "HjemService inngår samarbeid for å tilby utvidet forsikringsdekning til alle kunder.",
    },
];

const mediaAssets = [
    { name: "Logo pakke (PNG, SVG)", type: "ZIP", size: "2.4 MB" },
    { name: "Pressemappe 2024", type: "PDF", size: "5.1 MB" },
    { name: "Produktbilder", type: "ZIP", size: "12.8 MB" },
];

export default function PressePage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-4 text-4xl font-bold">Presse</h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Her finner du pressemeldinger, medieressurser og kontaktinformasjon for presse.
                </p>

                {/* Contact Section */}
                <div className="bg-primary/5 border rounded-lg p-6 mb-12">
                    <h2 className="text-xl font-semibold mb-4">Pressekontakt</h2>
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                        <div className="flex-1">
                            <p className="font-medium">Maria Andersen</p>
                            <p className="text-muted-foreground">Kommunikasjonssjef</p>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="mailto:presse@hjemservice.no">
                                <Mail className="mr-2 h-4 w-4" />
                                presse@hjemservice.no
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Press Releases */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Pressemeldinger</h2>
                    <div className="space-y-4">
                        {pressReleases.map((release) => (
                            <article key={release.id} className="border rounded-lg p-6 hover:border-primary/50 transition-colors">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Calendar className="h-4 w-4" />
                                    <time dateTime={release.date}>
                                        {new Date(release.date).toLocaleDateString("nb-NO", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </time>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{release.title}</h3>
                                <p className="text-muted-foreground">{release.summary}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Media Assets */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Medieressurser</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {mediaAssets.map((asset) => (
                            <div key={asset.name} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium">{asset.name}</p>
                                        <p className="text-sm text-muted-foreground">{asset.type} • {asset.size}</p>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* About Section */}
                <section className="bg-muted rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Om HjemService</h2>
                    <p className="text-muted-foreground mb-4">
                        HjemService er Norges ledende plattform for hjemmetjenester. Vi kobler kunder med verifiserte leverandører innen frisør, renhold, håndverk, og mer. Plattformen ble grunnlagt i 2022 og har i dag over 10 000 aktive leverandører og betjener kunder over hele Norge.
                    </p>
                    <Link href="/om-oss" className="text-primary hover:underline">
                        Les mer om oss →
                    </Link>
                </section>
            </div>
        </div>
    );
}
