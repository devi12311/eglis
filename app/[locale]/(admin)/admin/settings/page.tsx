import { updateLocationSettings } from "@/actions/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { getAdminLocations, seasonMonthsInput, shortTime } from "@/lib/admin/data";
import { normalizeLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const locations = await getAdminLocations(locale);

  return (
    <AdminShell locale={locale} title="Settings">
      <div className="grid gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-burnt-earth">Season and hours</p>
          <h1 className="mt-3 font-display text-4xl font-black uppercase sm:text-5xl">Shop settings</h1>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {locations.map((location) => (
            <form action={updateLocationSettings} className="grid gap-4 border-2 border-on-background bg-caravan-cream p-5" key={location.slug}>
              <input name="locale" type="hidden" value={locale} />
              <input name="id" type="hidden" value={location.id} />
              <h2 className="font-display text-3xl font-black uppercase">{location.name}</h2>
              <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                Name
                <input className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" defaultValue={location.name} name="name" required />
              </label>
              <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                Address
                <input className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" defaultValue={location.address} name="address" required />
              </label>
              <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                Landmark
                <input className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" defaultValue={location.landmark} name="landmark" required />
              </label>
              <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                Phone
                <input className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" defaultValue={location.phone} name="phone" required />
              </label>
              <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                Opening
                <input className="border-2 border-on-background bg-surface p-3 font-body text-base" defaultValue={shortTime(location.opening_time)} name="openingTime" required type="time" />
              </label>
              <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                Closing
                <input className="border-2 border-on-background bg-surface p-3 font-body text-base" defaultValue={shortTime(location.closing_time)} name="closingTime" pattern="^([01]\d|2[0-4]):[0-5]\d$" required />
              </label>
              <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                Slot minutes
                <input className="border-2 border-on-background bg-surface p-3 font-body text-base" defaultValue={location.slot_minutes} min={5} name="slotMinutes" required type="number" />
              </label>
              <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                Timezone
                <input className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" defaultValue={location.timezone} name="timezone" required />
              </label>
              <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                Season months
                <input
                  className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal"
                  defaultValue={seasonMonthsInput(location.season_months)}
                  name="seasonMonths"
                  placeholder="6,7,8,9"
                />
              </label>
              <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
                Sort order
                <input className="border-2 border-on-background bg-surface p-3 font-body text-base" defaultValue={location.sort_order} name="sortOrder" type="number" />
              </label>
              <label className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.12em]">
                <input defaultChecked={location.online_booking} name="onlineBooking" type="checkbox" />
                Online booking
              </label>
              <label className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.12em]">
                <input defaultChecked={location.active} name="active" type="checkbox" />
                Active
              </label>
              <Button type="submit">Save {location.slug}</Button>
            </form>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
