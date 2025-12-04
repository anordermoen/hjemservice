import Link from "next/link";
import { MapPin, Clock, Users, Heart, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const openPositions = [
    {
        id: 1,
        title: "Senior Frontend-utvikler",
        department: "Teknologi",
        location: "Oslo",
        type: "Heltid",
    },
    {
        id: 2,
        title: "Kundeservicemedarbeider",
        department: "Support",
        location: "Oslo / Hybrid",
        type: "Heltid",
    },
    {
        id: 3,
        title: "Product Manager",
        department: "Produkt",
        location: "Oslo",
        type: "Heltid",
    },
    {
        id: 4,
        title: "Marketing Specialist",
        department: "Markedsføring",
        location: "Oslo / Hybrid",
        type: "Heltid",
    },
    {
        id: 5,
        title: "Sales Manager - B2B",
        department: "Salg",
        location: "Oslo",
        type: "Heltid",
    },
];

const benefits = [
    {
        icon: Heart,
        title: "Helse og velvære",
        description: "God helseforsikring, treningsabonnement og fokus på work-life balance.",
    },
    {
        icon: Zap,
        title: "Fleksibilitet",
        description: "Hybrid arbeid, fleksitid og mulighet for hjemmekontor.",
    },
    {
        icon: TrendingUp,
        title: "Utvikling",
        description: "Budsjett for kurs og konferanser, mentorprogram og karriereveiledning.",
    },
    {
        icon: Users,
        title: "Sosialt",
        description: "Teamaktiviteter, årlige samlinger og et inkluderende arbeidsmiljø.",
    },
];

export default function KarrierePage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-4xl">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="mb-4 text-4xl font-bold">Bli med på laget</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Vi bygger fremtidens plattform for hjemmetjenester i Norge. Bli en del av et ambisiøst team som gjør hverdagen enklere for tusenvis av mennesker.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-12">
                    <div className="text-center p-4 border rounded-lg">
                        <p className="text-3xl font-bold text-primary">45+</p>
                        <p className="text-sm text-muted-foreground">Ansatte</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                        <p className="text-3xl font-bold text-primary">10k+</p>
                        <p className="text-sm text-muted-foreground">Leverandører</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                        <p className="text-3xl font-bold text-primary">2022</p>
                        <p className="text-sm text-muted-foreground">Grunnlagt</p>
                    </div>
                </div>

                {/* Benefits */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-center">Hvorfor jobbe hos oss?</h2>
                    <div className="grid gap-6 sm:grid-cols-2">
                        {benefits.map((benefit) => (
                            <div key={benefit.title} className="flex gap-4 p-4 border rounded-lg">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <benefit.icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{benefit.title}</h3>
                                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Open Positions */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Ledige stillinger</h2>
                    <div className="space-y-4">
                        {openPositions.map((position) => (
                            <div key={position.id} className="border rounded-lg p-6 hover:border-primary/50 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">{position.title}</h3>
                                        <p className="text-sm text-muted-foreground">{position.department}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {position.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {position.type}
                                            </span>
                                        </div>
                                    </div>
                                    <Button asChild>
                                        <Link href={`mailto:jobb@hjemservice.no?subject=Søknad: ${position.title}`}>
                                            Søk nå
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Spontaneous Application */}
                <section className="bg-muted rounded-lg p-6 text-center">
                    <h2 className="text-xl font-semibold mb-2">Finner du ikke drømmejobben?</h2>
                    <p className="text-muted-foreground mb-4">
                        Send oss en åpen søknad så tar vi kontakt når en passende stilling dukker opp.
                    </p>
                    <Button asChild variant="outline">
                        <Link href="mailto:jobb@hjemservice.no?subject=Åpen søknad">
                            Send åpen søknad
                        </Link>
                    </Button>
                </section>
            </div>
        </div>
    );
}
