"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Lock,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Check,
  Home,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateProfile, addAddress, updateAddress, deleteAddress } from "@/app/actions/profile";
import { changePassword } from "@/app/actions/auth";

interface Address {
  id: string;
  label: string;
  street: string;
  postalCode: string;
  city: string;
  floor?: string | null;
  entryCode?: string | null;
  instructions?: string | null;
}

interface SettingsClientProps {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatarUrl?: string;
  };
  addresses: Address[];
}

export function SettingsClient({ user, addresses }: SettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Profile state
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Address state
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) {
        setProfileError(result.error);
      } else {
        setProfileSuccess(true);
        router.refresh();
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await changePassword(user.id, undefined, formData);
      if (result?.error) {
        setPasswordError(result.error);
      } else {
        setPasswordSuccess(true);
        setTimeout(() => {
          setPasswordDialogOpen(false);
          setPasswordSuccess(false);
        }, 1500);
      }
    });
  };

  const handleAddressSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddressError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = editingAddress
        ? await updateAddress(editingAddress.id, formData)
        : await addAddress(formData);

      if (result.error) {
        setAddressError(result.error);
      } else {
        setAddressDialogOpen(false);
        setEditingAddress(null);
        router.refresh();
      }
    });
  };

  const handleDeleteAddress = () => {
    if (!deleteAddressId) return;

    startTransition(async () => {
      await deleteAddress(deleteAddressId);
      setDeleteAddressId(null);
      router.refresh();
    });
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressError(null);
    setAddressDialogOpen(true);
  };

  const openEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressError(null);
    setAddressDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profil
          </CardTitle>
          <CardDescription>
            Oppdater din personlige informasjon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">Fornavn</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={user.firstName}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Etternavn</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={user.lastName}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={user.phone}
                placeholder="12345678"
                className="mt-1"
              />
            </div>

            {profileError && (
              <p className="text-sm text-destructive">{profileError}</p>
            )}

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : profileSuccess ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : null}
                {profileSuccess ? "Lagret!" : "Lagre endringer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Addresses Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresser
            </CardTitle>
            <CardDescription>
              Administrer dine lagrede adresser
            </CardDescription>
          </div>
          <Button onClick={openAddAddress} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Legg til
          </Button>
        </CardHeader>
        <CardContent>
          {addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-muted p-2">
                      {address.label.toLowerCase().includes("jobb") ||
                      address.label.toLowerCase().includes("arbeid") ? (
                        <Building className="h-4 w-4" />
                      ) : (
                        <Home className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{address.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.street}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.postalCode} {address.city}
                      </p>
                      {address.floor && (
                        <p className="text-xs text-muted-foreground">
                          Etasje: {address.floor}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditAddress(address)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteAddressId(address.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-muted-foreground">
              Du har ingen lagrede adresser ennå
            </p>
          )}
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Sikkerhet
          </CardTitle>
          <CardDescription>
            Administrer passord og sikkerhet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setPasswordDialogOpen(true)}>
            Endre passord
          </Button>
        </CardContent>
      </Card>

      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Endre passord</DialogTitle>
            <DialogDescription>
              Skriv inn nåværende og nytt passord
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Nåværende passord</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Nytt passord</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={8}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Minst 8 tegn
              </p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Bekreft nytt passord</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1"
              />
            </div>

            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-green-600">Passordet er endret!</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordDialogOpen(false)}
                disabled={isPending}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Endre passord
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Address Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Rediger adresse" : "Legg til adresse"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? "Oppdater adresseinformasjonen"
                : "Legg til en ny adresse for enklere booking"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <div>
              <Label htmlFor="label">Navn på adresse</Label>
              <Input
                id="label"
                name="label"
                placeholder="F.eks. Hjemme, Jobb, Mamma"
                defaultValue={editingAddress?.label || ""}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="street">Gateadresse</Label>
              <Input
                id="street"
                name="street"
                placeholder="Storgata 1"
                defaultValue={editingAddress?.street || ""}
                required
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">Postnummer</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  placeholder="0123"
                  defaultValue={editingAddress?.postalCode || ""}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="city">Sted</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Oslo"
                  defaultValue={editingAddress?.city || ""}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="floor">Etasje (valgfritt)</Label>
                <Input
                  id="floor"
                  name="floor"
                  placeholder="3. etasje"
                  defaultValue={editingAddress?.floor || ""}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="entryCode">Portkode (valgfritt)</Label>
                <Input
                  id="entryCode"
                  name="entryCode"
                  placeholder="1234"
                  defaultValue={editingAddress?.entryCode || ""}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="instructions">Instruksjoner (valgfritt)</Label>
              <Textarea
                id="instructions"
                name="instructions"
                placeholder="F.eks. Ring på døra, gå opp til 2. etasje"
                defaultValue={editingAddress?.instructions || ""}
                className="mt-1"
              />
            </div>

            {addressError && (
              <p className="text-sm text-destructive">{addressError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddressDialogOpen(false)}
                disabled={isPending}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingAddress ? "Lagre" : "Legg til"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Address Confirmation */}
      <AlertDialog
        open={!!deleteAddressId}
        onOpenChange={(open) => !open && setDeleteAddressId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett adresse?</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil slette denne adressen? Handlingen kan
              ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAddress}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
