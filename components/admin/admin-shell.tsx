import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAdmin } from "@/actions/admin";

type AdminShellProps = {
  children: ReactNode;
  locale: string;
  title: string;
};

export function AdminShell({ children, locale, title }: AdminShellProps) {
  const links = [
    ["Dashboard", `/${locale}/admin`],
    ["Reservations", `/${locale}/admin/reservations`],
    ["Availability", `/${locale}/admin/availability`],
    ["Settings", `/${locale}/admin/settings`],
    ["Services", `/${locale}/admin/services`]
  ];

  return (
    <main className="min-h-screen bg-surface text-on-background">
      <header className="border-b-2 border-on-background bg-caravan-cream">
        <div className="section-shell flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <Link className="font-headline-lg-mobile text-headline-lg-mobile uppercase tracking-tight" href={`/${locale}/admin`}>
            {title}
          </Link>
          <nav className="flex flex-wrap gap-2 font-label-caps text-label-caps uppercase">
            {links.map(([label, href]) => (
              <Link className="flex min-h-11 items-center border border-on-background px-3 py-2 hover:bg-on-background hover:text-caravan-cream" href={href} key={href}>
                {label}
              </Link>
            ))}
            <form action={signOutAdmin}>
              <input name="locale" type="hidden" value={locale} />
              <button className="flex min-h-11 items-center border border-on-background px-3 py-2 hover:bg-on-background hover:text-caravan-cream" type="submit">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="section-shell py-8 sm:py-10">{children}</div>
    </main>
  );
}
