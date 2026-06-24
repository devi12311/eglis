"use server";

import { revalidatePath } from "next/cache";
import { cancelReservation } from "@/lib/booking/reservations";
import { normalizeLocale } from "@/lib/i18n/config";

export async function cancelReservationAction(formData: FormData): Promise<void> {
  const ref = String(formData.get("ref") || "");
  const token = String(formData.get("token") || "");
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));

  if (!ref || !token) {
    throw new Error("Cancellation needs a reservation reference and token.");
  }

  await cancelReservation(ref, token);
  revalidatePath(`/${locale}/r/${ref}`);
}
