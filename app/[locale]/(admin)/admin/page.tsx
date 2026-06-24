import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminDashboard } from "@/lib/admin/data";
import { normalizeLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const dashboard = await getAdminDashboard(locale);

  return (
    <AdminShell locale={locale} title="Eglis Admin">
      <div className="grid gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-burnt-earth">Today</p>
          <h1 className="mt-3 font-display text-4xl font-black uppercase sm:text-5xl">Schedule dashboard</h1>
        </div>
        <section className="grid gap-5 md:grid-cols-3">
          <article className="border-2 border-on-background bg-caravan-cream p-5">
            <p className="font-mono text-xs uppercase tracking-[0.12em]">Confirmed today</p>
            <p className="mt-4 font-display text-5xl font-black">{dashboard.confirmedToday}</p>
          </article>
          <article className="border-2 border-on-background bg-caravan-cream p-5">
            <p className="font-mono text-xs uppercase tracking-[0.12em]">Done today</p>
            <p className="mt-4 font-display text-5xl font-black">{dashboard.doneToday}</p>
          </article>
          <article className="border-2 border-on-background bg-caravan-cream p-5">
            <p className="font-mono text-xs uppercase tracking-[0.12em]">Online locations</p>
            <p className="mt-4 font-display text-5xl font-black">{dashboard.onlineLocations}/{dashboard.activeLocations}</p>
          </article>
        </section>
        <section className="border-2 border-on-background bg-surface-container p-5">
          <p className="font-mono text-xs uppercase tracking-[0.12em]">Bookable services</p>
          <p className="mt-3 text-lg leading-8 text-on-background/70">
            {dashboard.bookableServices} active services are enabled for online booking. Today is {dashboard.today}.
          </p>
        </section>
      </div>
    </AdminShell>
  );
}
