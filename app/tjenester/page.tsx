import { ServiceCard } from "@/components/common/ServiceCard";
import { getCategories } from "@/lib/db/categories";

export const metadata = {
  title: "Alle tjenester | HjemService",
  description: "Finn frisør, renhold, håndverker, elektriker, rørlegger og hagearbeid som kommer hjem til deg.",
};

export default async function ServicesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Alle tjenester</h1>
        <p className="text-muted-foreground">
          Velg en kategori for å finne fagfolk i ditt område
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <ServiceCard key={category.slug} category={category} />
        ))}
      </div>
    </div>
  );
}
