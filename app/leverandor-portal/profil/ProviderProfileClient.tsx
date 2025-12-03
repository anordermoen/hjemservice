"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface ProviderData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  businessName: string | null;
  bio: string | null;
  areasServed: string[];
  services: Service[];
}

interface ProviderProfileClientProps {
  provider: ProviderData;
}

export function ProviderProfileClient({ provider }: ProviderProfileClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: provider.firstName,
    lastName: provider.lastName,
    email: provider.email,
    phone: provider.phone,
    businessName: provider.businessName || "",
    bio: provider.bio || "",
  });

  const [services, setServices] = useState(provider.services);
  const [areas, setAreas] = useState(provider.areasServed);
  const [newArea, setNewArea] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement save functionality with server action
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    router.refresh();
  };

  const addArea = () => {
    if (newArea && !areas.includes(newArea)) {
      setAreas([...areas, newArea]);
      setNewArea("");
    }
  };

  const removeArea = (area: string) => {
    setAreas(areas.filter((a) => a !== area));
  };

  const initials = `${provider.firstName?.[0] || ""}${provider.lastName?.[0] || ""}`;

  return (
    <div className="space-y-6">
      {/* Profile info */}
      <Card>
        <CardHeader>
          <CardTitle>Profilinformasjon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={provider.avatarUrl || undefined}
                  alt={`${provider.firstName} ${provider.lastName}`}
                />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-primary-foreground">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h3 className="font-medium">Profilbilde</h3>
              <p className="text-sm text-muted-foreground">
                Last opp et profesjonelt bilde
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">Fornavn</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="lastName">Etternavn</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="businessName">Firmanavn (valgfritt)</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Om meg</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={4}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Beskriv din erfaring og hva som gjør deg unik
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tjenester og priser</CardTitle>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Legg til tjeneste
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <h4 className="font-medium">{service.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Ca. {service.duration} min
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={service.price}
                    className="w-24"
                    onChange={(e) => {
                      const newServices = services.map((s) =>
                        s.id === service.id
                          ? { ...s, price: parseInt(e.target.value) || 0 }
                          : s
                      );
                      setServices(newServices);
                    }}
                  />
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <p className="py-4 text-center text-muted-foreground">
                Ingen tjenester lagt til ennå
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Areas served */}
      <Card>
        <CardHeader>
          <CardTitle>Områder jeg dekker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {areas.map((area) => (
              <Badge
                key={area}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeArea(area)}
              >
                {area} ×
              </Badge>
            ))}
            {areas.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Ingen områder lagt til
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Legg til område"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addArea();
                }
              }}
            />
            <Button onClick={addArea}>Legg til</Button>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Lagrer...
            </>
          ) : (
            "Lagre endringer"
          )}
        </Button>
      </div>
    </div>
  );
}
