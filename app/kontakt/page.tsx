import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function KontaktPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-4xl font-bold">Kontakt oss</h1>

                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Mail className="mx-auto h-8 w-8 text-primary mb-3" />
                            <h3 className="font-semibold mb-2">E-post</h3>
                            <a href="mailto:hei@hjemservice.no" className="text-sm text-muted-foreground hover:text-primary">
                                hei@hjemservice.no
                            </a>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Phone className="mx-auto h-8 w-8 text-primary mb-3" />
                            <h3 className="font-semibold mb-2">Telefon</h3>
                            <a href="tel:+4712345678" className="text-sm text-muted-foreground hover:text-primary">
                                +47 123 45 678
                            </a>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6 text-center">
                            <MapPin className="mx-auto h-8 w-8 text-primary mb-3" />
                            <h3 className="font-semibold mb-2">Adresse</h3>
                            <p className="text-sm text-muted-foreground">
                                Oslo, Norge
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Kundeservice</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            Vårt kundeserviceteam er tilgjengelig mandag til fredag, 09:00 - 17:00.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button asChild>
                                <Link href="/logg-inn">Logg inn for support</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <a href="mailto:hei@hjemservice.no">Send e-post</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
