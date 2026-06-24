import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages";
import { locales } from "@/lib/i18n/config";
import { Icon } from "@/components/ui/icon";
import { BottomNav } from "@/components/site/bottom-nav";

type SiteShellProps = {
  children: ReactNode;
  locale: Locale;
  messages: Messages;
};

export function SiteShell({ children, locale, messages }: SiteShellProps) {
  const nav = [
    { label: messages.nav.home, href: `/${locale}`, icon: "home" },
    { label: messages.nav.services, href: `/${locale}/services`, icon: "grid_view" },
    { label: messages.nav.book, href: `/${locale}/book`, icon: "content_cut" },
    { label: messages.nav.locations, href: `/${locale}/locations`, icon: "map" }
  ];

  return (
    <div className="min-h-screen bg-surface-bright pb-20 pt-16 text-on-background md:pb-0">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b-2 border-on-background bg-background px-margin-mobile md:px-margin-desktop">
        <Link
          aria-label={messages.nav.home}
          className="flex items-center justify-center p-2 text-on-background transition-colors hover:text-burnt-earth md:hidden"
          href={`/${locale}`}
        >
          <Icon name="menu" />
        </Link>
        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 font-label-caps text-label-caps uppercase md:flex"
        >
          {nav.map((item) => (
            <Link className="hover:text-burnt-earth" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          className="font-headline-lg-mobile text-headline-lg-mobile uppercase tracking-tight"
          href={`/${locale}`}
        >
          {messages.brand}
        </Link>
        <div className="flex items-center gap-2">
          <div className="hidden gap-2 font-label-caps text-label-caps uppercase md:flex">
            {locales.map((item) => (
              <Link
                className={item === locale ? "border-b-2 border-burnt-earth" : "text-on-background/60 hover:text-on-background"}
                href={`/${item}`}
                key={item}
              >
                {item}
              </Link>
            ))}
          </div>
          <Link
            aria-label={messages.nav.locations}
            className="flex items-center justify-center p-2 text-on-background transition-colors hover:text-burnt-earth md:hidden"
            href={`/${locale}/locations`}
          >
            <Icon name="location_on" />
          </Link>
        </div>
      </header>

      {children}

      <footer className="mb-20 flex w-full flex-col items-center gap-stack-md border-t-2 border-on-background bg-on-background px-margin-mobile py-section-gap text-center text-background md:mb-0">
        <p className="mb-stack-md font-headline-lg-mobile text-headline-lg-mobile uppercase">{messages.brand}</p>
        <div className="flex flex-wrap justify-center gap-stack-md font-label-caps text-label-caps uppercase">
          <a className="underline hover:text-burnt-earth" href="tel:+355684413280">
            Call now
          </a>
          <a className="underline hover:text-burnt-earth" href={`/${locale}/locations`}>
            Directions
          </a>
          <a className="underline hover:text-burnt-earth" href="https://instagram.com" rel="noreferrer" target="_blank">
            Instagram
          </a>
        </div>
        <p className="mt-stack-lg font-label-caps text-label-caps uppercase opacity-50">
          © {new Date().getFullYear()} {messages.brand}. Come salty. Leave sharp.
        </p>
      </footer>

      <Link
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 border-2 border-on-background bg-on-background px-6 py-4 font-button text-button uppercase text-caravan-cream shadow-hard-sm transition-all hover:bg-inverse-surface active:translate-x-1 active:translate-y-1 active:shadow-none md:hidden"
        href={`/${locale}/book`}
      >
        <Icon name="content_cut" className="text-xl" />
        {messages.nav.book}
      </Link>

      <BottomNav items={nav} />
    </div>
  );
}
