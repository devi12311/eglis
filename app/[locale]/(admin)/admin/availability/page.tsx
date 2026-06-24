import { createAvailabilityBlock, deleteAvailabilityBlock, updateAvailabilityBlock } from "@/actions/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { getAdminAvailability, shortTime } from "@/lib/admin/data";
import { normalizeLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export default async function AdminAvailabilityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const { locations, blocks } = await getAdminAvailability(locale);

  return (
    <AdminShell locale={locale} title="Availability">
      <div className="grid gap-8">
        <div className="grid gap-6 md:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-burnt-earth">Blocks</p>
          <h1 className="mt-3 font-display text-4xl font-black uppercase sm:text-5xl">Block time or days off</h1>
          <p className="mt-5 text-lg leading-8 text-on-background/70">Existing confirmed reservations stay preserved. New bookings are prevented by date and range.</p>
        </div>
        <form action={createAvailabilityBlock} className="grid gap-5 border-2 border-on-background bg-caravan-cream p-5">
          <input name="locale" type="hidden" value={locale} />
          <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
            Location
            <select className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" name="location">
              {locations.map((location) => (
                <option key={location.slug} value={location.slug}>{location.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
            Date
            <input className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" name="date" required type="date" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
              Start
              <input className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" name="startTime" type="time" />
            </label>
            <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
              End
              <input className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" name="endTime" type="time" />
            </label>
          </div>
          <label className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.12em]">
            <input name="fullDay" type="checkbox" />
            Full day
          </label>
          <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
            Reason
            <input className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" maxLength={160} name="reason" />
          </label>
          <Button type="submit">Save block</Button>
        </form>
        </div>

        <section className="grid gap-4">
          <h2 className="font-display text-3xl font-black uppercase">Current blocks</h2>
          {blocks.length === 0 ? (
            <p className="border-2 border-on-background bg-surface p-5 text-on-background/70">No availability blocks yet.</p>
          ) : (
            <div className="grid gap-4">
              {blocks.map((block) => (
                <form action={updateAvailabilityBlock} className="grid gap-4 border-2 border-on-background bg-surface p-5" key={block.id}>
                  <input name="locale" type="hidden" value={locale} />
                  <input name="id" type="hidden" value={block.id} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                      Location
                      <select className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" defaultValue={block.locations?.slug ?? locations[0]?.slug} name="location">
                        {locations.map((location) => (
                          <option key={location.slug} value={location.slug}>{location.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                      Date
                      <input className="border-2 border-on-background bg-surface p-3 font-body text-base" defaultValue={block.block_date} name="date" required type="date" />
                    </label>
                    <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                      Start
                      <input className="border-2 border-on-background bg-surface p-3 font-body text-base" defaultValue={shortTime(block.start_time)} name="startTime" type="time" />
                    </label>
                    <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                      End
                      <input className="border-2 border-on-background bg-surface p-3 font-body text-base" defaultValue={shortTime(block.end_time)} name="endTime" type="time" />
                    </label>
                  </div>
                  <label className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.12em]">
                    <input defaultChecked={block.full_day} name="fullDay" type="checkbox" />
                    Full day
                  </label>
                  <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                    Reason
                    <input className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" defaultValue={block.reason ?? ""} maxLength={160} name="reason" />
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" variant="outline">Save block</Button>
                    <button
                      className="inline-flex min-h-12 items-center justify-center border-2 border-burnt-earth px-5 py-3 font-display text-sm font-bold uppercase tracking-[0.08em] text-burnt-earth transition hover:bg-burnt-earth hover:text-white"
                      formAction={deleteAvailabilityBlock}
                      type="submit"
                    >
                      Delete
                    </button>
                  </div>
                </form>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
