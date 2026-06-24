import { BookingForm } from "@/components/site/booking-form";
import { SiteShell } from "@/components/site/site-shell";
import { getAvailableSlots } from "@/lib/booking/slots";
import { getPublicLocation, getPublicServices } from "@/lib/public/data";
import { normalizeLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export const dynamic = "force-dynamic";

const BOOKING_LOCATION = "saranda";

const errorMessages: Record<string, string> = {
  invalid: "Check the reservation details and try again.",
  unavailable: "That time is no longer open. Pick another slot.",
  slot_taken: "That slot was just taken. Pick another time."
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function upcomingDates(seasonMonths: number[] | null, count: number): string[] {
  const dates: string[] = [];
  const cursor = new Date();
  for (let i = 0; i < 366 && dates.length < count; i += 1) {
    const month = cursor.getMonth() + 1;
    if (!seasonMonths || seasonMonths.includes(month)) {
      dates.push(`${cursor.getFullYear()}-${pad(month)}-${pad(cursor.getDate())}`);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export default async function BookPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string; date?: string; error?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { service: serviceParam, date: dateParam, error } = await searchParams;
  const locale = normalizeLocale(rawLocale);
  const messages = getMessages(locale);

  const [services, location] = await Promise.all([getPublicServices(), getPublicLocation(BOOKING_LOCATION)]);
  const bookable = services.filter((service) => service.bookableOnline);

  const dates = upcomingDates(location?.seasonMonths ?? null, 14);
  const representative = bookable[0];

  // Slot times depend on the location/date (not the service), so compute once per date.
  const slotLists = representative
    ? await Promise.all(dates.map((date) => getAvailableSlots(BOOKING_LOCATION, representative.slug, date)))
    : [];
  const slotsByDate: Record<string, string[]> = {};
  dates.forEach((date, index) => {
    slotsByDate[date] = slotLists[index] ?? [];
  });

  const errorMessage = error ? errorMessages[error] ?? errorMessages.invalid : null;

  return (
    <SiteShell locale={locale} messages={messages}>
      <main className="mx-auto flex max-w-container-max flex-col gap-section-gap px-margin-mobile py-stack-lg md:px-margin-desktop md:py-section-gap">
        {/* Heading */}
        <section className="md:grid md:grid-cols-12">
          <div className="md:col-span-8 md:col-start-2">
            <p className="font-label-caps text-label-caps uppercase text-burnt-earth">Reserve your chair</p>
            <h1 className="mt-stack-sm font-display-xl-mobile text-display-xl-mobile uppercase tracking-tighter md:font-display-xl md:text-display-xl">
              {messages.booking.title}
            </h1>
            <p className="mt-stack-sm max-w-2xl font-body-lg text-body-lg text-on-surface-variant">{messages.booking.intro}</p>
            {errorMessage ? (
              <p className="mt-stack-md border-l-4 border-burnt-earth bg-caravan-cream p-stack-md font-body-md text-body-md font-bold text-burnt-earth">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </section>

        {!representative || !location?.onlineBooking ? (
          <section className="md:grid md:grid-cols-12">
            <p className="border-l-4 border-burnt-earth bg-caravan-cream p-stack-md font-body-md text-body-md md:col-span-8 md:col-start-2">
              Online booking is closed right now. Call Eglis to reserve.
            </p>
          </section>
        ) : (
          <BookingForm
            dates={dates}
            initialDate={dateParam}
            initialService={serviceParam}
            locale={locale}
            location={{ name: location.name, address: location.address, phone: location.phone }}
            locationSlug={BOOKING_LOCATION}
            services={bookable}
            slotsByDate={slotsByDate}
          />
        )}
      </main>
    </SiteShell>
  );
}
