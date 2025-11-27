"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProviderApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  experience: string;
  bio: string;
  appliedAt: string;
  status: "pending" | "approved" | "rejected";
  documents: string[];
  areas: string[];
}

const applications: ProviderApplication[] = [
  {
    id: "a1",
    name: "Erik Berg",
    email: "erik.berg@example.com",
    phone: "912 34 567",
    category: "Håndverker",
    experience: "8 år",
    bio: "Erfaren håndverker med spesialisering i montering og småjobber. Har jobbet som snekker i 8 år og driver nå for meg selv.",
    appliedAt: "2024-12-04",
    status: "pending",
    documents: ["Politiattest", "Forsikringsbevis"],
    areas: ["Oslo", "Bærum", "Asker"],
  },
  {
    id: "a2",
    name: "Anna Larsen",
    email: "anna.larsen@example.com",
    phone: "923 45 678",
    category: "Renhold",
    experience: "5 år",
    bio: "Profesjonell renholder med erfaring fra både private hjem og bedrifter. Grundig og pålitelig.",
    appliedAt: "2024-12-03",
    status: "pending",
    documents: ["Politiattest"],
    areas: ["Oslo", "Nordstrand"],
  },
  {
    id: "a3",
    name: "Thomas Vik",
    email: "thomas.vik@example.com",
    phone: "934 56 789",
    category: "Elektriker",
    experience: "12 år",
    bio: "Autorisert elektriker med lang erfaring. Utfører alt fra småjobber til større installasjoner.",
    appliedAt: "2024-12-02",
    status: "pending",
    documents: ["Politiattest", "Autorisasjonsbevis", "Forsikringsbevis"],
    areas: ["Oslo", "Bærum", "Drammen"],
  },
  {
    id: "a4",
    name: "Mari Olsen",
    email: "mari.olsen@example.com",
    phone: "945 67 890",
    category: "Frisør",
    experience: "6 år",
    bio: "Frisør med fokus på hjemmebesøk til eldre og de med redusert mobilitet.",
    appliedAt: "2024-12-01",
    status: "approved",
    documents: ["Politiattest", "Fagbrev"],
    areas: ["Oslo"],
  },
  {
    id: "a5",
    name: "Per Nilsen",
    email: "per.nilsen@example.com",
    phone: "956 78 901",
    category: "Rørlegger",
    experience: "3 år",
    bio: "Nyutdannet rørlegger som ønsker å bygge kundebase.",
    appliedAt: "2024-11-28",
    status: "rejected",
    documents: ["Politiattest"],
    areas: ["Oslo"],
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ApplicationCard({
  application,
  onApprove,
  onReject,
}: {
  application: ProviderApplication;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {application.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{application.name}</h3>
                <Badge
                  variant={
                    application.status === "pending"
                      ? "warning"
                      : application.status === "approved"
                      ? "success"
                      : "destructive"
                  }
                >
                  {application.status === "pending"
                    ? "Venter"
                    : application.status === "approved"
                    ? "Godkjent"
                    : "Avslått"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {application.category} • {application.experience} erfaring
              </p>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {application.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {application.phone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {application.areas.join(", ")}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Søkte {formatDate(application.appliedAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Se detaljer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Søknadsdetaljer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium">Om søkeren</h4>
                    <p className="text-sm text-muted-foreground">
                      {application.bio}
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">Dokumenter</h4>
                    <div className="space-y-2">
                      {application.documents.map((doc) => (
                        <div
                          key={doc}
                          className="flex items-center gap-2 text-sm"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {doc}
                          <Badge variant="secondary">Lastet opp</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">Områder</h4>
                    <div className="flex flex-wrap gap-2">
                      {application.areas.map((area) => (
                        <Badge key={area} variant="outline">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {application.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(application.id)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Avslå
                </Button>
                <Button size="sm" onClick={() => onApprove(application.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Godkjenn
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApprovalsPage() {
  const [apps, setApps] = useState(applications);

  const handleApprove = (id: string) => {
    setApps(
      apps.map((app) =>
        app.id === id ? { ...app, status: "approved" as const } : app
      )
    );
  };

  const handleReject = (id: string) => {
    setApps(
      apps.map((app) =>
        app.id === id ? { ...app, status: "rejected" as const } : app
      )
    );
  };

  const pending = apps.filter((a) => a.status === "pending");
  const approved = apps.filter((a) => a.status === "approved");
  const rejected = apps.filter((a) => a.status === "rejected");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leverandørgodkjenning</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Ventende ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">
              Godkjente ({approved.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">Avslåtte ({rejected.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pending.length > 0 ? (
              pending.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                Ingen ventende søknader
              </p>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approved.length > 0 ? (
              approved.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                Ingen godkjente søknader
              </p>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejected.length > 0 ? (
              rejected.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                Ingen avslåtte søknader
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
