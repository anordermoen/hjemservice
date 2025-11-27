"use client";

import { useState } from "react";
import { Users, Plus, MoreHorizontal, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  address: string;
}

// Mock family members
const initialFamilyMembers: FamilyMember[] = [
  {
    id: "1",
    name: "Kari Nordmann",
    phone: "987 65 432",
    relationship: "Mor",
    address: "Parkveien 10, 0350 Oslo",
  },
  {
    id: "2",
    name: "Per Nordmann",
    phone: "976 54 321",
    relationship: "Far",
    address: "Parkveien 10, 0350 Oslo",
  },
];

export default function FamilyPage() {
  const [familyMembers, setFamilyMembers] = useState(initialFamilyMembers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    relationship: "",
    street: "",
    postalCode: "",
    city: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      relationship: formData.relationship,
      address: `${formData.street}, ${formData.postalCode} ${formData.city}`,
    };
    setFamilyMembers([...familyMembers, newMember]);
    setFormData({
      name: "",
      phone: "",
      relationship: "",
      street: "",
      postalCode: "",
      city: "",
    });
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setFamilyMembers(familyMembers.filter((m) => m.id !== id));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Familie
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Legg til
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Legg til familiemedlem</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Navn</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Fullt navn"
                  required
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
                  placeholder="Mobilnummer"
                  required
                />
              </div>
              <div>
                <Label htmlFor="relationship">Relasjon</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) =>
                    setFormData({ ...formData, relationship: e.target.value })
                  }
                  placeholder="F.eks. Mor, Far, Bestemor"
                  required
                />
              </div>
              <div>
                <Label htmlFor="street">Gateadresse</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  placeholder="Gate og husnummer"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Postnummer</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    placeholder="0000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">Sted</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="By/sted"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Avbryt
                </Button>
                <Button type="submit">Legg til</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-sm text-muted-foreground">
          Legg til familiemedlemmer for å enkelt bestille tjenester på deres
          vegne.
        </p>

        {familyMembers.length > 0 ? (
          <div className="space-y-4">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-start justify-between rounded-lg border p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{member.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      ({member.relationship})
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {member.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {member.address}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Rediger</DropdownMenuItem>
                    <DropdownMenuItem>Book tjeneste</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(member.id)}
                    >
                      Slett
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-medium">Ingen familiemedlemmer lagt til</h3>
            <p className="text-sm text-muted-foreground">
              Legg til familiemedlemmer for å bestille tjenester på deres vegne
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
