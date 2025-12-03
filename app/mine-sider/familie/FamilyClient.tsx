"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, MoreHorizontal, MapPin, Phone, Loader2 } from "lucide-react";
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
import {
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
} from "@/app/actions/family";

interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  street: string;
  postalCode: string;
  city: string;
}

interface FamilyClientProps {
  initialMembers: FamilyMember[];
}

export function FamilyClient({ initialMembers }: FamilyClientProps) {
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    relationship: "",
    street: "",
    postalCode: "",
    city: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      relationship: "",
      street: "",
      postalCode: "",
      city: "",
    });
    setError("");
  };

  const handleAdd = () => {
    if (!formData.name || !formData.phone || !formData.relationship ||
        !formData.street || !formData.postalCode || !formData.city) {
      setError("Fyll ut alle feltene");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await addFamilyMember(formData);
      if (result.error) {
        setError(result.error);
      } else {
        resetForm();
        setIsAddDialogOpen(false);
        router.refresh();
      }
    });
  };

  const handleEdit = () => {
    if (!editingMember) return;

    if (!formData.name || !formData.phone || !formData.relationship ||
        !formData.street || !formData.postalCode || !formData.city) {
      setError("Fyll ut alle feltene");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await updateFamilyMember(editingMember.id, formData);
      if (result.error) {
        setError(result.error);
      } else {
        resetForm();
        setEditingMember(null);
        router.refresh();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Er du sikker på at du vil slette dette familiemedlemmet?")) return;

    startTransition(async () => {
      const result = await deleteFamilyMember(id);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const openEditDialog = (member: FamilyMember) => {
    setFormData({
      name: member.name,
      phone: member.phone,
      relationship: member.relationship,
      street: member.street,
      postalCode: member.postalCode,
      city: member.city,
    });
    setEditingMember(member);
  };

  const closeEditDialog = () => {
    resetForm();
    setEditingMember(null);
  };

  const MemberForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div>
        <Label htmlFor="name">Navn</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Fullt navn"
          disabled={isPending}
        />
      </div>
      <div>
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Mobilnummer"
          disabled={isPending}
        />
      </div>
      <div>
        <Label htmlFor="relationship">Relasjon</Label>
        <Input
          id="relationship"
          value={formData.relationship}
          onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
          placeholder="F.eks. Mor, Far, Bestemor"
          disabled={isPending}
        />
      </div>
      <div>
        <Label htmlFor="street">Gateadresse</Label>
        <Input
          id="street"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          placeholder="Gate og husnummer"
          disabled={isPending}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postalCode">Postnummer</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            placeholder="0000"
            disabled={isPending}
          />
        </div>
        <div>
          <Label htmlFor="city">Sted</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="By/sted"
            disabled={isPending}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(false);
            setEditingMember(null);
          }}
          disabled={isPending}
        >
          Avbryt
        </Button>
        <Button onClick={onSubmit} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Lagrer...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Legg til familiemedlem</DialogTitle>
          </DialogHeader>
          <MemberForm onSubmit={handleAdd} submitLabel="Legg til" />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Familie
          </CardTitle>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Legg til
          </Button>
        </CardHeader>
      <CardContent>
        <p className="mb-6 text-sm text-muted-foreground">
          Legg til familiemedlemmer for å enkelt bestille tjenester på deres vegne.
        </p>

        {initialMembers.length > 0 ? (
          <div className="space-y-4">
            {initialMembers.map((member) => (
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
                      {member.street}, {member.postalCode} {member.city}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isPending}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(member)}>
                      Rediger
                    </DropdownMenuItem>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rediger familiemedlem</DialogTitle>
          </DialogHeader>
          <MemberForm onSubmit={handleEdit} submitLabel="Lagre endringer" />
        </DialogContent>
      </Dialog>
    </>
  );
}
