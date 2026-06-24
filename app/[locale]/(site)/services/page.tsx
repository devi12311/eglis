import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/site/service-card";
import { SiteShell } from "@/components/site/site-shell";
import { getPublicServices } from "@/lib/public/data";
import { normalizeLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export const dynamic = "force-dynamic";

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const messages = getMessages(locale);
  const services = await getPublicServices();
  const bookable = services.filter((service) => service.bookableOnline);
  const packages = services.filter((service) => !service.bookableOnline);

  return (
    <SiteShell locale={locale} messages={messages}>
      <main className="mx-auto max-w-container-max px-margin-mobile py-stack-lg md:px-margin-desktop md:py-section-gap">
        <section>
          <p className="font-label-caps text-label-caps uppercase text-burnt-earth">Services</p>
          <h1 className="mt-stack-sm font-display-xl-mobile text-display-xl-mobile uppercase tracking-tighter md:font-display-xl md:text-display-xl">
            Cuts you can book now.
          </h1>
          <div className="mt-stack-lg flex flex-col">
            {bookable.map((service) => (
              <ServiceCard key={service.slug} locale={locale} service={service} />
            ))}
          </div>
        </section>

        <section className="mt-section-gap">
          <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">Packages stay call / inquire</p>
          <h2 className="mt-stack-sm font-headline-lg-mobile text-headline-lg-mobile uppercase tracking-tight md:font-headline-lg md:text-headline-lg">
            Signature packages.
          </h2>
          <div className="mt-stack-lg flex flex-col">
            {packages.map((service) => (
              <ServiceCard key={service.slug} locale={locale} service={service} />
            ))}
          </div>
        </section>

        <section className="mt-section-gap border-y-2 border-on-background py-section-gap text-center">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile uppercase tracking-tight md:font-headline-lg md:text-headline-lg">
            Booking the whole crew?
          </h2>
          <p className="mx-auto mt-stack-md max-w-xl font-body-md text-body-md text-on-surface-variant md:font-body-lg md:text-body-lg">
            Bring the group. Tap to call and we’ll line up back-to-back chairs.
          </p>
          <div className="mt-stack-lg flex justify-center">
            <Button href="tel:+355684413280" variant="earth" icon="phone">
              Call / Inquire
            </Button>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
