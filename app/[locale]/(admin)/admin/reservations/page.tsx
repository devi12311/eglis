import { createAdminReservation, deleteReservation, updateReservationStatus } from "@/actions/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { getAdminLocations, getAdminReservations, getAdminServices, shortTime } from "@/lib/admin/data";
import { formatAll } from "@/lib/data";
import { normalizeLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const [reservations, locations, services] = await Promise.all([
    getAdminReservations(locale),
    getAdminLocations(locale),
    getAdminServices(locale)
  ]);

  return (
    <AdminShell locale={locale} title="Reservations">
      <div className="grid gap-6">
        <h1 className="font-display text-4xl font-black uppercase sm:text-5xl">Reservations</h1>

        <form action={createAdminReservation} className="grid gap-4 border-2 border-dashed border-on-background bg-caravan-cream p-5">
          <input name="locale" type="hidden" value={locale} />
          <h2 className="font-display text-2xl font-black uppercase sm:text-3xl">New reservation</h2>
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-burnt-earth">Walk-in / phone booking. Admin can book any open time.</p>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
              Location
              <select className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" name="location" required>
                {locations.map((location) => (
                  <option key={location.slug} value={location.slug}>{location.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
              Service
              <select className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" name="service" required>
                {services.map((service) => (
                  <option key={service.slug} value={service.slug}>{service.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
              Date
              <input className="border-2 border-on-background bg-surface p-3 font-body text-base" name="date" required type="date" />
            </label>
            <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
              Time
              <input className="border-2 border-on-background bg-surface p-3 font-body text-base" name="time" required type="time" />
            </label>
            <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
              Name
              <input className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" name="name" required />
            </label>
            <label className="grid gap-2 font-mono text-xs uppercase tracking-[0.12em]">
              Phone
              <input className="border-2 border-on-background bg-surface p-3 font-body text-base normal-case tracking-normal" name="phone" required type="tel" />
            </label>
          </div>
          <div>
            <Button type="submit">Add reservation</Button>
          </div>
        </form>
        <div className="hidden overflow-x-auto border-2 border-on-background md:block">
          <table className="w-full min-w-[760px] border-collapse bg-surface text-left">
            <thead className="bg-caravan-cream font-mono text-xs uppercase tracking-[0.12em]">
              <tr>
                <th className="border-b-2 border-on-background p-4">Ref</th>
                <th className="border-b-2 border-on-background p-4">Client</th>
                <th className="border-b-2 border-on-background p-4">Service</th>
                <th className="border-b-2 border-on-background p-4">Location</th>
                <th className="border-b-2 border-on-background p-4">Time</th>
                <th className="border-b-2 border-on-background p-4">Status</th>
                <th className="border-b-2 border-on-background p-4">Price</th>
                <th className="border-b-2 border-on-background p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="border-b border-outline-variant p-4 font-mono">{reservation.public_ref}</td>
                  <td className="border-b border-outline-variant p-4">
                    <p className="font-bold">{reservation.customer_name}</p>
                    <p className="font-mono text-xs">{reservation.phone}</p>
                  </td>
                  <td className="border-b border-outline-variant p-4">{reservation.services?.name ?? "Unknown"}</td>
                  <td className="border-b border-outline-variant p-4">{reservation.locations?.name ?? "Unknown"}</td>
                  <td className="border-b border-outline-variant p-4">
                    {reservation.res_date} {shortTime(reservation.start_time)}-{shortTime(reservation.end_time)}
                  </td>
                  <td className="border-b border-outline-variant p-4 font-mono text-xs uppercase">{reservation.status.replace("_", " ")}</td>
                  <td className="border-b border-outline-variant p-4">{formatAll(reservation.price_all)}</td>
                  <td className="border-b border-outline-variant p-4">
                    <form action={updateReservationStatus} className="flex flex-wrap gap-2">
                      <input name="locale" type="hidden" value={locale} />
                      <input name="id" type="hidden" value={reservation.id} />
                      <select
                        className="border-2 border-on-background bg-surface p-3 font-body text-sm"
                        defaultValue={reservation.status}
                        name="status"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="done">Done</option>
                        <option value="no_show">No show</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <Button type="submit" variant="outline">Save</Button>
                      <button
                        className="inline-flex min-h-12 items-center justify-center border-2 border-burnt-earth px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.08em] text-burnt-earth transition hover:bg-burnt-earth hover:text-white"
                        formAction={deleteReservation}
                        type="submit"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {reservations.length === 0 ? (
                <tr>
                  <td className="p-5 text-on-background/70" colSpan={8}>No reservations found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 md:hidden">
          {reservations.length === 0 ? (
            <p className="border-2 border-on-background bg-surface p-5 text-on-background/70">No reservations found.</p>
          ) : (
            reservations.map((reservation) => (
              <article className="border-2 border-on-background bg-surface p-4" key={reservation.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl font-black uppercase">{reservation.customer_name}</p>
                    <a className="font-mono text-sm text-burnt-earth" href={`tel:${reservation.phone}`}>{reservation.phone}</a>
                  </div>
                  <span className="border border-on-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em]">{reservation.status.replace("_", " ")}</span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 font-mono text-xs uppercase tracking-[0.1em]">
                  <div>
                    <dt className="text-on-background/60">Ref</dt>
                    <dd className="mt-1 normal-case">{reservation.public_ref}</dd>
                  </div>
                  <div>
                    <dt className="text-on-background/60">Price</dt>
                    <dd className="mt-1">{formatAll(reservation.price_all)}</dd>
                  </div>
                  <div>
                    <dt className="text-on-background/60">Service</dt>
                    <dd className="mt-1 normal-case">{reservation.services?.name ?? "Unknown"}</dd>
                  </div>
                  <div>
                    <dt className="text-on-background/60">Location</dt>
                    <dd className="mt-1 normal-case">{reservation.locations?.name ?? "Unknown"}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-on-background/60">Time</dt>
                    <dd className="mt-1 normal-case">{reservation.res_date} {shortTime(reservation.start_time)}-{shortTime(reservation.end_time)}</dd>
                  </div>
                </dl>
                <form action={updateReservationStatus} className="mt-4 grid gap-3">
                  <input name="locale" type="hidden" value={locale} />
                  <input name="id" type="hidden" value={reservation.id} />
                  <select
                    className="border-2 border-on-background bg-surface p-3 font-body text-base"
                    defaultValue={reservation.status}
                    name="status"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="done">Done</option>
                    <option value="no_show">No show</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <Button fullWidth type="submit" variant="outline">Save</Button>
                    <button
                      className="flex min-h-12 w-full items-center justify-center border-2 border-burnt-earth px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.08em] text-burnt-earth transition hover:bg-burnt-earth hover:text-white"
                      formAction={deleteReservation}
                      type="submit"
                    >
                      Delete
                    </button>
                  </div>
                </form>
              </article>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  );
}
