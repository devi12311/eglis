import { createService, deleteService, updateService } from "@/actions/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { getAdminServices } from "@/lib/admin/data";
import { formatAll } from "@/lib/data";
import { normalizeLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const services = await getAdminServices(locale);

  return (
    <AdminShell locale={locale} title="Services">
      <div className="grid gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-burnt-earth">Menu</p>
          <h1 className="mt-3 font-display text-4xl font-black uppercase sm:text-5xl">Services and prices</h1>
        </div>

        <form action={createService} className="grid gap-4 border-2 border-dashed border-on-background bg-caravan-cream p-5">
          <input name="locale" type="hidden" value={locale} />
          <h2 className="font-display text-3xl font-black uppercase">New service</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
              Slug
              <input className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" name="slug" placeholder="beard-trim" required />
            </label>
            <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
              Name
              <input className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" name="name" required />
            </label>
            <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
              Price ALL
              <input className="border-2 border-on-background bg-surface p-3 font-body text-base" defaultValue={0} min={0} name="priceAll" required type="number" />
            </label>
            <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
              Duration minutes
              <input className="border-2 border-on-background bg-surface p-3 font-body text-base" defaultValue={30} min={5} name="durationMin" required type="number" />
            </label>
            <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
              Sort order
              <input className="border-2 border-on-background bg-surface p-3 font-body text-base" defaultValue={0} name="sortOrder" type="number" />
            </label>
          </div>
          <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
            Description
            <textarea className="min-h-24 border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" name="description" required />
          </label>
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.12em]">
              <input defaultChecked name="bookableOnline" type="checkbox" />
              Bookable online
            </label>
            <label className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.12em]">
              <input defaultChecked name="active" type="checkbox" />
              Active
            </label>
          </div>
          <div>
            <Button type="submit">Add service</Button>
          </div>
        </form>

        <div className="grid gap-4">
          {services.map((service) => (
            <form action={updateService} className="grid gap-4 border-2 border-on-background bg-caravan-cream p-5" key={service.slug}>
              <input name="locale" type="hidden" value={locale} />
              <input name="id" type="hidden" value={service.id} />
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-burnt-earth">{service.slug}</p>
                  <p className="font-display text-3xl font-black uppercase">{service.name}</p>
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.12em]">{formatAll(service.price_all)} / {service.duration_min} min</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                  Name
                  <input className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" defaultValue={service.name} name="name" required />
                </label>
                <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                  Price ALL
                  <input className="border-2 border-on-background bg-surface p-3 font-body text-base" defaultValue={service.price_all} min={0} name="priceAll" required type="number" />
                </label>
                <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                  Duration minutes
                  <input className="border-2 border-on-background bg-surface p-3 font-body text-base" defaultValue={service.duration_min} min={5} name="durationMin" required type="number" />
                </label>
                <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                  Sort order
                  <input className="border-2 border-on-background bg-surface p-3 font-body text-base" defaultValue={service.sort_order} name="sortOrder" type="number" />
                </label>
              </div>
              <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                Description
                <textarea
                  className="min-h-24 border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal"
                  defaultValue={service.description}
                  name="description"
                  required
                />
              </label>
              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.12em]">
                  <input defaultChecked={service.bookable_online} name="bookableOnline" type="checkbox" />
                  Bookable online
                </label>
                <label className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.12em]">
                  <input defaultChecked={service.active} name="active" type="checkbox" />
                  Active
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" variant="outline">Save service</Button>
                <button
                  className="inline-flex min-h-12 items-center justify-center border-2 border-burnt-earth px-5 py-3 font-display text-sm font-bold uppercase tracking-[0.08em] text-burnt-earth transition hover:bg-burnt-earth hover:text-white"
                  formAction={deleteService}
                  type="submit"
                >
                  Delete
                </button>
              </div>
            </form>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
