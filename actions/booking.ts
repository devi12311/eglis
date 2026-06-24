"use server";

import { redirect } from "next/navigation";
import { createReservation } from "@/lib/booking/reservations";
import { normalizeLocale } from "@/lib/i18n/config";
import { normalizePhone, reservationSchema } from "@/lib/validation";

export async function createReservationAction(formData: FormData): Promise<void> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = reservationSchema.safeParse(raw);

  if (!parsed.success) {
    const locale = normalizeLocale(String(formData.get("locale") ?? ""));
    redirect(`/${locale}/book?error=invalid`);
  }

  const { service, location, date, time, name, phone, locale } = parsed.data;

  const result = await createReservation({
    locationSlug: location,
    serviceSlug: service,
    customerName: name,
    phone: normalizePhone(phone),
    date,
    startTime: time,
    locale
  });

  if (!result.ok) {
    redirect(`/${locale}/book?error=${result.error}&service=${encodeURIComponent(service)}&date=${date}`);
  }

  redirect(`/${locale}/r/${result.publicRef}?t=${result.cancelToken}`);
}
