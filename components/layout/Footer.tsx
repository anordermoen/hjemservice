import Link from "next/link";
import { Separator } from "@/components/ui/separator";

interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
}

interface FooterProps {
  categories: Category[];
}

export function Footer({ categories }: FooterProps) {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">HjemService</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/om-oss" className="hover:text-foreground transition-colors">
                  Om oss
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-foreground transition-colors">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Tjenester</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link href={`/tjenester/${category.slug}`} className="hover:text-foreground transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">For leverandører</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/bli-leverandor" className="hover:text-foreground transition-colors">
                  Bli leverandør
                </Link>
              </li>
              <li>
                <Link href="/leverandor-portal" className="hover:text-foreground transition-colors">
                  Leverandørportal
                </Link>
              </li>
              <li>
                <Link href="/hjelp/leverandor" className="hover:text-foreground transition-colors">
                  Hjelp for leverandører
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Juridisk</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/personvern" className="hover:text-foreground transition-colors">
                  Personvernerklæring
                </Link>
              </li>
              <li>
                <Link href="/vilkar" className="hover:text-foreground transition-colors">
                  Brukervilkår
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-foreground transition-colors">
                  Informasjonskapsler
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <span className="text-xs font-bold text-primary-foreground">H</span>
            </div>
            <span className="font-semibold">HjemService</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} HjemService AS. Alle rettigheter reservert.
          </p>
        </div>
      </div>
    </footer>
  );
}
