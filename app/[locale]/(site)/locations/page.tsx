import { SiteShell } from "@/components/site/site-shell";
import { LocationCard } from "@/components/site/location-card";
import { getPublicLocations } from "@/lib/public/data";
import { normalizeLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export const dynamic = "force-dynamic";

export default async function LocationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const messages = getMessages(locale);
  const locations = await getPublicLocations();

  return (
    <SiteShell locale={locale} messages={messages}>
      <main className="mx-auto max-w-container-max px-margin-mobile py-stack-lg md:px-margin-desktop md:py-section-gap">
        <p className="font-label-caps text-label-caps uppercase text-burnt-earth">Locations</p>
        <h1 className="mt-stack-sm font-display-xl-mobile text-display-xl-mobile uppercase tracking-tighter md:font-display-xl md:text-display-xl">
          Two chairs, one online book.
        </h1>
        <div className="mt-stack-lg grid grid-cols-1 gap-stack-md md:grid-cols-2 md:gap-gutter">
          {locations.map((location) => (
            <LocationCard key={location.slug} locale={locale} location={location} />
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
