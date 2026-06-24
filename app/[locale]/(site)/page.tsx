import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SaltyDivider } from "@/components/ui/salty-divider";
import { SiteShell } from "@/components/site/site-shell";
import { LocationCard } from "@/components/site/location-card";
import { getPublicLocations, getPublicServices } from "@/lib/public/data";
import { normalizeLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export const dynamic = "force-dynamic";

const quickInfo = [
  { icon: "schedule", label: "Open 10:00–24:00" },
  { icon: "payments", label: "Pay at the shop" },
  { icon: "directions_walk", label: "Walk-ins welcome" },
  { icon: "timer", label: "30-minute services" }
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const messages = getMessages(locale);
  const [locations] = await Promise.all([getPublicLocations(), getPublicServices()]);

  return (
    <SiteShell locale={locale} messages={messages}>
      <main>
        {/* Hero */}
        <section className="flex flex-col items-center px-margin-mobile py-stack-lg md:grid md:grid-cols-12 md:gap-gutter md:px-margin-desktop md:py-margin-desktop">
          <div className="z-10 flex flex-col gap-stack-md md:col-span-6 md:pr-12">
            <p className="font-label-caps text-label-caps uppercase text-burnt-earth">{messages.home.eyebrow}</p>
            <h1 className="font-display-xl-mobile text-display-xl-mobile uppercase leading-[0.9] tracking-tighter md:font-display-xl md:text-display-xl">
              {messages.home.title}
            </h1>
            <p className="max-w-md font-body-md text-body-md text-on-surface-variant md:font-body-lg md:text-body-lg">
              {messages.home.intro}
            </p>
            <div className="mt-stack-sm flex flex-col gap-stack-sm sm:flex-row">
              <Button href={`/${locale}/book`}>{messages.home.cta}</Button>
              <Button href={`/${locale}/services`} variant="outline">
                View services
              </Button>
            </div>
          </div>
          <div className="relative mt-stack-lg w-full md:col-span-6 md:mt-0">
            <div className="relative aspect-[4/5] w-full overflow-hidden border-2 border-on-background bg-caravan-cream">
              <Image
                src="/interior.png"
                alt="Inside the Eglis Cut Club barbershop"
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <div className="hidden md:block">
          <SaltyDivider />
        </div>

        {/* Quick info bar */}
        <section className="border-y-2 border-on-background bg-caravan-cream py-stack-lg md:border-none md:bg-transparent">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <ul className="grid grid-cols-2 gap-stack-md md:grid-cols-4">
              {quickInfo.map((item) => (
                <li className="flex flex-col items-center gap-stack-sm text-center" key={item.label}>
                  <Icon name={item.icon} className="text-2xl" />
                  <span className="font-label-caps text-label-caps uppercase text-on-background">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Location selection */}
        <section className="mx-auto max-w-container-max px-margin-mobile py-section-gap md:px-margin-desktop">
          <h2 className="mb-stack-lg font-headline-lg-mobile text-headline-lg-mobile uppercase tracking-tight md:font-headline-lg md:text-headline-lg">
            Select Location
          </h2>
          <div className="grid grid-cols-1 gap-stack-md md:grid-cols-2 md:gap-gutter">
            {locations.map((location) => (
              <LocationCard key={location.slug} locale={locale} location={location} />
            ))}
          </div>
        </section>

        <SaltyDivider />

        {/* The Caravan Story */}
        <section className="px-margin-mobile py-section-gap md:px-margin-desktop">
          <div className="mx-auto grid max-w-container-max grid-cols-1 items-center gap-gutter md:grid-cols-12">
            <div className="relative md:col-span-5 md:col-start-2">
              <div className="relative aspect-square w-full overflow-hidden border-2 border-on-background bg-deep-walnut">
                <Image
                  src="/caravan.png"
                  alt="The Eglis Cut Club caravan"
                  fill
                  sizes="(min-width: 768px) 42vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 -z-10 translate-x-3 translate-y-3 border-2 border-on-background bg-caravan-cream" />
            </div>
            <div className="mt-stack-lg flex flex-col gap-stack-md md:col-span-5 md:col-start-8 md:mt-0">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile uppercase tracking-tight md:font-headline-lg md:text-headline-lg">
                Not your usual barbershop.
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant md:font-body-lg md:text-body-lg">
                Eglis started cutting his friends during quarantine and never looked back. Funny when the conversation
                starts. Serious when the clippers turn on.
              </p>
            </div>
          </div>
        </section>

        {/* Meet Eglis */}
        <section className="bg-on-background px-margin-mobile py-section-gap text-caravan-cream md:px-margin-desktop">
          <div className="mx-auto flex max-w-container-max flex-col items-center gap-stack-lg text-center">
            <Icon name="forum" className="text-4xl" />
            <p className="max-w-2xl font-subheading text-subheading leading-relaxed md:font-headline-lg md:text-headline-lg">
              “Albanian, English, Italian—and somehow we’ll understand the rest.”
            </p>
            <div className="mt-stack-md font-label-caps text-label-caps uppercase tracking-widest opacity-60">
              Meet Eglis
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
