import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TipList } from "@/components/common/InfoBox";
import { getAllProvidersForApproval } from "@/lib/db/admin";
import { ApprovalClient } from "./ApprovalClient";

export const metadata = {
  title: "Leverandørgodkjenning | Admin | HjemService",
  description: "Godkjenn eller avslå leverandørsøknader.",
};

export default async function ApprovalsPage() {
  const providers = await getAllProvidersForApproval();

  // Transform to the shape expected by ApprovalClient
  const providerData = providers.map((p) => ({
    id: p.id,
    userId: p.userId,
    businessName: p.businessName,
    bio: p.bio,
    areasServed: p.areasServed,
    yearsExperience: p.yearsExperience,
    nationality: p.nationality,
    education: p.education,
    verified: p.verified,
    insurance: p.insurance,
    policeCheck: p.policeCheck,
    createdAt: p.createdAt,
    approvedAt: p.approvedAt,
    user: {
      id: p.user.id,
      email: p.user.email,
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      phone: p.user.phone,
      avatarUrl: p.user.avatarUrl,
    },
    categories: p.categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
    languages: p.languages.map((l) => ({
      id: l.id,
      name: l.name,
      code: l.code,
      proficiency: l.proficiency,
    })),
    certificates: p.certificates.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      year: c.year,
      verified: c.verified,
    })),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leverandørgodkjenning</CardTitle>
      </CardHeader>
      <CardContent>
        <ApprovalClient providers={providerData} />

        <TipList
          title="Godkjenningsretningslinjer"
          className="mt-6"
          tips={[
            "Verifiser at politiattest er gyldig og oppdatert",
            "Sjekk at nødvendige sertifikater/autorisasjoner er på plass",
            "Vurder språkkunnskaper for kommunikasjon med kunder",
            "Kontroller at dekningsområder stemmer overens med plattformens behov",
          ]}
        />
      </CardContent>
    </Card>
  );
}
