import { cancelReservationAction } from "@/actions/cancel";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SiteShell } from "@/components/site/site-shell";
import { getReservationByRef } from "@/lib/booking/reservations";
import { formatAll } from "@/lib/data";
import { normalizeLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export const dynamic = "force-dynamic";

function shortTime(value: string): string {
  return value.slice(0, 5);
}

export default async function ReservationPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; ref: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { locale: rawLocale, ref } = await params;
  const { t } = await searchParams;
  const locale = normalizeLocale(rawLocale);
  const messages = getMessages(locale);
  const reservation = await getReservationByRef(ref);

  const tokenMatches = Boolean(reservation && t && reservation.cancelToken === t);

  return (
    <SiteShell locale={locale} messages={messages}>
      <main className="mx-auto flex w-full max-w-container-max flex-col items-center px-margin-mobile py-section-gap text-center md:px-margin-desktop">
        {/* Success icon */}
        <div className="mb-stack-md">
          <Icon name="check_circle" filled className="text-[80px] text-on-background" />
        </div>
        <h1 className="mb-stack-sm font-display-xl-mobile text-display-xl-mobile uppercase tracking-tighter md:font-display-xl md:text-display-xl">
          You’re all set.
        </h1>
        <p className="mb-stack-lg inline-block border border-deep-walnut/10 bg-caravan-cream px-4 py-2 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          Screenshot this.
        </p>

        {/* Receipt card */}
        <div className="relative flex w-full max-w-md flex-col gap-stack-md border-2 border-on-background bg-caravan-cream p-6 text-left shadow-hard md:p-8">
          <div className="flex items-end justify-between border-b-2 border-on-background/20 pb-4">
            <div>
              <span className="mb-1 block font-label-caps text-label-caps text-on-surface-variant">Ref</span>
              <span className="font-subheading text-subheading uppercase text-on-background">{ref}</span>
            </div>
            <div className="text-right">
              <span className="mb-1 block font-label-caps text-label-caps text-on-surface-variant">Client</span>
              <span className="font-label-caps text-label-caps text-on-background">
                {reservation?.customerName ?? "—"}
              </span>
            </div>
          </div>

          {!reservation ? (
            <p className="border-l-4 border-burnt-earth bg-surface p-stack-md font-body-md text-body-md">
              No reservation found for this reference.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-y-6 py-2">
                <div>
                  <span className="mb-1 block font-label-caps text-label-caps text-on-surface-variant">Location</span>
                  <span className="font-body-md text-body-md uppercase text-on-background">{reservation.locationName ?? "—"}</span>
                </div>
                <div>
                  <span className="mb-1 block font-label-caps text-label-caps text-on-surface-variant">Service</span>
                  <span className="font-body-md text-body-md uppercase text-on-background">{reservation.serviceName ?? "—"}</span>
                </div>
                <div>
                  <span className="mb-1 block font-label-caps text-label-caps text-on-surface-variant">Date</span>
                  <span className="font-body-md text-body-md uppercase text-on-background">{reservation.date}</span>
                </div>
                <div>
                  <span className="mb-1 block font-label-caps text-label-caps text-on-surface-variant">Time</span>
                  <span className="font-body-md text-body-md uppercase text-on-background">
                    {shortTime(reservation.startTime)}–{shortTime(reservation.endTime)}
                  </span>
                </div>
                <div>
                  <span className="mb-1 block font-label-caps text-label-caps text-on-surface-variant">Status</span>
                  <span className="font-body-md text-body-md uppercase text-on-background">
                    {reservation.status.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t-2 border-on-background/20 pt-4">
                <span className="font-label-caps text-label-caps text-on-surface-variant">Due at shop</span>
                <span className="font-subheading text-subheading text-on-background">{formatAll(reservation.priceAll)}</span>
              </div>
            </>
          )}

          {/* Perforation notches */}
          <div className="absolute -left-2 top-1/2 h-8 w-4 rounded-r-full border-y-2 border-r-2 border-on-background bg-surface-bright" />
          <div className="absolute -right-2 top-1/2 h-8 w-4 rounded-l-full border-y-2 border-l-2 border-on-background bg-surface-bright" />
        </div>

        <p className="mt-stack-md max-w-sm font-body-md text-body-md text-on-surface-variant">
          Payment is completed at the shop. No online payment needed.
        </p>

        {/* Actions */}
        {reservation ? (
          <div className="mt-stack-lg flex w-full max-w-md flex-col justify-center gap-4 sm:flex-row">
            {reservation.status === "cancelled" ? (
              <p className="w-full border-l-4 border-burnt-earth bg-surface p-stack-md font-body-md text-body-md">
                This reservation is cancelled.
              </p>
            ) : tokenMatches ? (
              <form action={cancelReservationAction} className="w-full">
                <input name="locale" type="hidden" value={locale} />
                <input name="ref" type="hidden" value={ref} />
                <input name="token" type="hidden" value={t} />
                <Button fullWidth type="submit" variant="outline">
                  Cancel reservation
                </Button>
              </form>
            ) : null}
            <a
              className="flex w-full items-center justify-center gap-2 border-2 border-on-background bg-on-background px-6 py-4 font-button text-button uppercase text-caravan-cream transition-colors hover:bg-inverse-surface sm:w-auto"
              href="tel:+355684413280"
            >
              <Icon name="phone" className="text-[18px]" /> Call for assistance
            </a>
          </div>
        ) : null}

        <div className="mt-section-gap w-full text-center">
          <a
            className="font-label-caps text-label-caps uppercase text-on-surface-variant underline underline-offset-4 transition-colors hover:text-burnt-earth"
            href={`/${locale}`}
          >
            Return to home
          </a>
        </div>
      </main>
    </SiteShell>
  );
}
