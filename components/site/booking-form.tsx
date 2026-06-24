"use client";

import { useMemo, useState } from "react";
import { createReservationAction } from "@/actions/booking";
import { Icon } from "@/components/ui/icon";
import { formatAll, type Location, type Service } from "@/lib/data";

type BookingFormProps = {
  locale: string;
  locationSlug: string;
  location: Pick<Location, "name" | "address" | "phone">;
  services: Service[];
  dates: string[];
  slotsByDate: Record<string, string[]>;
  initialService?: string;
  initialDate?: string;
};

function dateRibbon(date: string, index: number): { weekday: string; day: string } {
  const parsed = new Date(`${date}T00:00:00`);
  const weekday = index === 0 ? "TODAY" : parsed.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  return { weekday, day: String(parsed.getDate()) };
}

const sectionLabel = (step: string, label: string) => (
  <div className="md:col-span-4 md:col-start-2">
    <h2 className="mb-stack-sm font-subheading text-subheading uppercase">
      {step}. {label}
    </h2>
    <div className="mb-stack-lg h-1 w-12 bg-burnt-earth" />
  </div>
);

export function BookingForm({
  locale,
  locationSlug,
  location,
  services,
  dates,
  slotsByDate,
  initialService,
  initialDate
}: BookingFormProps) {
  const [serviceSlug, setServiceSlug] = useState<string>(
    services.find((service) => service.slug === initialService)?.slug ?? services[0]?.slug ?? ""
  );
  const [date, setDate] = useState<string>(dates.includes(initialDate ?? "") ? (initialDate as string) : dates[0] ?? "");

  const slots = useMemo(() => slotsByDate[date] ?? [], [slotsByDate, date]);
  const [time, setTime] = useState<string>(slots[0] ?? "");

  const onSelectDate = (next: string) => {
    setDate(next);
    setTime((slotsByDate[next] ?? [])[0] ?? "");
  };

  const canConfirm = Boolean(serviceSlug && date && time);

  return (
    <form action={createReservationAction} className="flex flex-col gap-section-gap">
      <input name="locale" type="hidden" value={locale} />
      <input name="location" type="hidden" value={locationSlug} />
      <input name="service" type="hidden" value={serviceSlug} />
      <input name="date" type="hidden" value={date} />
      <input name="time" type="hidden" value={time} />

      {/* Service selection */}
      <section className="md:grid md:grid-cols-12">
        {sectionLabel("1", "Select service")}
        <div className="flex flex-col gap-stack-md md:col-span-8 md:col-start-2">
          {services.map((service) => {
            const active = service.slug === serviceSlug;
            return (
              <button
                className={`group relative border-2 p-stack-lg text-left transition-colors ${
                  active
                    ? "border-on-background bg-on-background text-caravan-cream"
                    : "border-on-background/30 bg-surface hover:border-on-background"
                }`}
                key={service.slug}
                onClick={() => setServiceSlug(service.slug)}
                type="button"
              >
                <div className="mb-stack-sm flex items-start justify-between">
                  <h3 className="font-headline-lg-mobile text-headline-lg-mobile uppercase">{service.name}</h3>
                  <span
                    className={`mt-1 px-3 py-1 font-label-caps text-label-caps ${
                      active ? "bg-caravan-cream text-on-background" : "bg-surface-dim text-on-background"
                    }`}
                  >
                    {formatAll(service.priceAll)}
                  </span>
                </div>
                <div className="mt-stack-md flex items-end justify-between">
                  <p
                    className={`max-w-[70%] font-body-md text-body-md ${
                      active ? "text-caravan-cream/80" : "text-on-surface-variant"
                    }`}
                  >
                    {service.description}
                  </p>
                  <span className="flex items-center gap-1 font-label-caps text-label-caps uppercase">
                    <Icon name="schedule" className="text-[16px]" /> {service.durationMin} min
                  </span>
                </div>
                {active ? (
                  <span className="absolute right-stack-lg top-stack-lg">
                    <Icon name="check_circle" filled className="text-burnt-earth" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {/* Location confirmation */}
      <section className="border-y-2 border-on-background/20 py-stack-lg md:grid md:grid-cols-12">
        <div className="flex items-center md:col-span-4 md:col-start-2">
          <h2 className="font-subheading text-subheading uppercase">2. Location</h2>
        </div>
        <div className="mt-stack-md flex items-center justify-between md:col-span-6 md:col-start-2 md:mt-0">
          <div className="flex items-center gap-stack-md">
            <Icon name="location_on" className="text-3xl text-burnt-earth" />
            <div>
              <p className="font-headline-lg-mobile text-headline-lg-mobile uppercase">{location.name}</p>
              <p className="font-body-md text-body-md text-on-surface-variant">{location.address}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Date & time */}
      <section className="md:grid md:grid-cols-12">
        {sectionLabel("3", "Date & time")}
        <div className="flex flex-col gap-stack-md md:col-span-8 md:col-start-2">
          <div className="hide-scrollbar flex gap-stack-sm overflow-x-auto pb-2">
            {dates.map((value, index) => {
              const active = value === date;
              const { weekday, day } = dateRibbon(value, index);
              return (
                <button
                  className={`flex h-[90px] min-w-[80px] flex-col items-center justify-center border-2 transition-colors ${
                    active
                      ? "border-deep-walnut bg-deep-walnut text-caravan-cream"
                      : "border-on-background/30 text-on-surface-variant hover:border-on-background"
                  }`}
                  key={value}
                  onClick={() => onSelectDate(value)}
                  type="button"
                >
                  <span className="font-label-caps text-label-caps opacity-70">{weekday}</span>
                  <span className="mt-1 font-headline-lg-mobile text-headline-lg-mobile">{day}</span>
                </button>
              );
            })}
          </div>

          {slots.length > 0 ? (
            <div aria-label="Available time slots" className="grid grid-cols-3 gap-stack-sm md:grid-cols-4" role="radiogroup">
              {slots.map((slot) => {
                const active = slot === time;
                return (
                  <button
                    aria-checked={active}
                    className={`border-2 py-3 text-center font-label-caps text-label-caps uppercase transition-colors ${
                      active
                        ? "border-burnt-earth bg-burnt-earth text-caravan-cream"
                        : "border-on-background/30 hover:border-on-background"
                    }`}
                    key={slot}
                    onClick={() => setTime(slot)}
                    role="radio"
                    type="button"
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-start justify-between gap-stack-md border-l-4 border-burnt-earth bg-surface-dim/30 p-stack-lg md:flex-row md:items-center">
              <div>
                <p className="flex items-center gap-2 font-subheading text-subheading">
                  <Icon name="block" className="text-burnt-earth" /> Fully booked for this day.
                </p>
                <p className="mt-1 font-body-md text-body-md text-on-surface-variant">Need to squeeze in? Call Egli directly.</p>
              </div>
              <a
                className="flex w-full items-center justify-center gap-2 bg-on-background px-6 py-3 font-button text-button uppercase text-caravan-cream shadow-hard-earth transition-colors hover:bg-inverse-surface md:w-auto"
                href={`tel:${location.phone}`}
              >
                <Icon name="phone" className="text-[18px]" /> Tap to call
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Your details */}
      <section className="md:grid md:grid-cols-12">
        {sectionLabel("4", "Your details")}
        <div className="grid gap-stack-md md:col-span-8 md:col-start-2 md:grid-cols-2">
          <label className="grid gap-2 font-label-caps text-label-caps uppercase">
            Name
            <input
              className="border-0 border-b-2 border-on-background bg-transparent px-0 py-3 font-body text-base normal-case tracking-normal focus:border-burnt-earth focus:outline-none"
              name="name"
              required
            />
          </label>
          <label className="grid gap-2 font-label-caps text-label-caps uppercase">
            Phone
            <input
              className="border-0 border-b-2 border-on-background bg-transparent px-0 py-3 font-body text-base normal-case tracking-normal focus:border-burnt-earth focus:outline-none"
              name="phone"
              required
              type="tel"
            />
          </label>
        </div>
      </section>

      {/* Confirm */}
      <div className="flex justify-center md:col-span-12">
        <button
          className="flex w-full min-w-[300px] items-center justify-center gap-2 border-2 border-burnt-earth bg-transparent px-8 py-4 font-button text-button uppercase text-burnt-earth transition-colors hover:bg-burnt-earth hover:text-caravan-cream disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canConfirm}
          type="submit"
        >
          Confirm reservation <Icon name="arrow_forward" className="text-[18px]" />
        </button>
      </div>
    </form>
  );
}
