"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, hasSupabaseEnv } from "@/lib/admin/data";
import { createReservation } from "@/lib/booking/reservations";
import { normalizeLocale } from "@/lib/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { adminReservationSchema, availabilityBlockSchema, normalizePhone, serviceSchema } from "@/lib/validation";

const statusSchema = z.enum(["confirmed", "cancelled", "done", "no_show"]);

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function formLocale(formData: FormData) {
  return normalizeLocale(formString(formData, "locale"));
}

function revalidateAdmin(locale: string, path: string) {
  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}/admin/${path}`);
}

function parseSeasonMonths(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const months = normalized
    .split(",")
    .map((month) => Number(month.trim()))
    .filter((month) => Number.isInteger(month) && month >= 1 && month <= 12);

  return months.length > 0 ? months : null;
}

export async function signInAdmin(formData: FormData) {
  const locale = formLocale(formData);
  const email = formString(formData, "email");
  const password = formString(formData, "password");

  if (!hasSupabaseEnv()) {
    redirect(`/${locale}/admin/login?error=config`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/${locale}/admin/login?error=credentials`);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/admin/login?error=session`);
  }

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    redirect(`/${locale}/admin/login?error=not-allowed`);
  }

  redirect(`/${locale}/admin`);
}

export async function signOutAdmin(formData: FormData) {
  const locale = formLocale(formData);
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(`/${locale}/admin/login`);
}

export async function updateReservationStatus(formData: FormData) {
  const locale = formLocale(formData);
  const id = formString(formData, "id");
  const status = statusSchema.parse(formString(formData, "status"));
  const { supabase } = await requireAdmin(locale);

  const updates =
    status === "cancelled"
      ? { status, cancelled_at: new Date().toISOString() }
      : { status, cancelled_at: null as string | null };

  const { error } = await supabase.from("reservations").update(updates).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdmin(locale, "reservations");
}

export async function createAvailabilityBlock(formData: FormData) {
  const locale = formLocale(formData);
  const rawBlock = {
    location: formString(formData, "location"),
    date: formString(formData, "date"),
    fullDay: formData.get("fullDay") === "on",
    startTime: formString(formData, "startTime") || undefined,
    endTime: formString(formData, "endTime") || undefined,
    reason: formString(formData, "reason") || undefined
  };
  const block = availabilityBlockSchema.parse(rawBlock);

  if (!block.fullDay && (!block.startTime || !block.endTime || block.startTime >= block.endTime)) {
    throw new Error("Partial-day blocks require a valid start and end time.");
  }

  const { supabase } = await requireAdmin(locale);

  const { data: location, error: locationError } = await supabase.from("locations").select("id").eq("slug", block.location).single();

  if (locationError || !location) {
    throw new Error(locationError?.message ?? "Location not found.");
  }

  const { error } = await supabase.from("availability_blocks").insert({
    location_id: location.id,
    block_date: block.date,
    full_day: block.fullDay,
    start_time: block.fullDay ? null : block.startTime,
    end_time: block.fullDay ? null : block.endTime,
    reason: block.reason ?? null
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdmin(locale, "availability");
}

export async function deleteAvailabilityBlock(formData: FormData) {
  const locale = formLocale(formData);
  const id = formString(formData, "id");
  const { supabase } = await requireAdmin(locale);
  const { error } = await supabase.from("availability_blocks").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdmin(locale, "availability");
}

export async function updateLocationSettings(formData: FormData) {
  const locale = formLocale(formData);
  const id = formString(formData, "id");
  const { supabase } = await requireAdmin(locale);

  const { error } = await supabase
    .from("locations")
    .update({
      name: formString(formData, "name"),
      address: formString(formData, "address"),
      landmark: formString(formData, "landmark"),
      phone: formString(formData, "phone"),
      timezone: formString(formData, "timezone") || "Europe/Tirane",
      opening_time: formString(formData, "openingTime"),
      closing_time: formString(formData, "closingTime"),
      slot_minutes: Number(formString(formData, "slotMinutes") || 30),
      online_booking: formData.get("onlineBooking") === "on",
      active: formData.get("active") === "on",
      season_months: parseSeasonMonths(formString(formData, "seasonMonths")),
      sort_order: Number(formString(formData, "sortOrder") || 0)
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdmin(locale, "settings");
}

export async function updateService(formData: FormData) {
  const locale = formLocale(formData);
  const id = formString(formData, "id");
  const { supabase } = await requireAdmin(locale);

  const { error } = await supabase
    .from("services")
    .update({
      name: formString(formData, "name"),
      description: formString(formData, "description"),
      price_all: Number(formString(formData, "priceAll") || 0),
      duration_min: Number(formString(formData, "durationMin") || 30),
      bookable_online: formData.get("bookableOnline") === "on",
      active: formData.get("active") === "on",
      sort_order: Number(formString(formData, "sortOrder") || 0)
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdmin(locale, "services");
}

export async function createService(formData: FormData) {
  const locale = formLocale(formData);
  const { supabase } = await requireAdmin(locale);

  const input = serviceSchema.parse({
    slug: formString(formData, "slug").toLowerCase(),
    name: formString(formData, "name"),
    description: formString(formData, "description"),
    priceAll: Number(formString(formData, "priceAll") || 0),
    durationMin: Number(formString(formData, "durationMin") || 30),
    bookableOnline: formData.get("bookableOnline") === "on",
    active: formData.get("active") === "on",
    sortOrder: Number(formString(formData, "sortOrder") || 0)
  });

  const { error } = await supabase.from("services").insert({
    slug: input.slug,
    name: input.name,
    description: input.description,
    price_all: input.priceAll,
    duration_min: input.durationMin,
    bookable_online: input.bookableOnline,
    active: input.active,
    sort_order: input.sortOrder
  });

  if (error) {
    throw new Error(error.code === "23505" ? "A service with that slug already exists." : error.message);
  }

  revalidateAdmin(locale, "services");
}

export async function deleteService(formData: FormData) {
  const locale = formLocale(formData);
  const id = formString(formData, "id");
  const { supabase } = await requireAdmin(locale);

  const { count, error: countError } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("service_id", id);

  if (countError) {
    throw new Error(countError.message);
  }

  // Soft delete when bookings reference the service; hard delete only when unused.
  if ((count ?? 0) > 0) {
    const { error } = await supabase.from("services").update({ active: false }).eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      throw new Error(error.message);
    }
  }

  revalidateAdmin(locale, "services");
}

export async function createAdminReservation(formData: FormData) {
  const locale = formLocale(formData);
  await requireAdmin(locale);

  const input = adminReservationSchema.parse({
    service: formString(formData, "service"),
    location: formString(formData, "location"),
    date: formString(formData, "date"),
    time: formString(formData, "time"),
    name: formString(formData, "name"),
    phone: formString(formData, "phone")
  });

  const result = await createReservation({
    locationSlug: input.location,
    serviceSlug: input.service,
    customerName: input.name,
    phone: normalizePhone(input.phone),
    date: input.date,
    startTime: input.time,
    locale,
    bypassChecks: true
  });

  if (!result.ok) {
    throw new Error(
      result.error === "slot_taken" ? "That slot is already booked." : "Could not create the reservation. Check the service and location."
    );
  }

  revalidateAdmin(locale, "reservations");
}

export async function deleteReservation(formData: FormData) {
  const locale = formLocale(formData);
  const id = formString(formData, "id");
  const { supabase } = await requireAdmin(locale);

  const { error } = await supabase.from("reservations").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdmin(locale, "reservations");
}

export async function updateAvailabilityBlock(formData: FormData) {
  const locale = formLocale(formData);
  const id = formString(formData, "id");
  const rawBlock = {
    location: formString(formData, "location"),
    date: formString(formData, "date"),
    fullDay: formData.get("fullDay") === "on",
    startTime: formString(formData, "startTime") || undefined,
    endTime: formString(formData, "endTime") || undefined,
    reason: formString(formData, "reason") || undefined
  };
  const block = availabilityBlockSchema.parse(rawBlock);

  if (!block.fullDay && (!block.startTime || !block.endTime || block.startTime >= block.endTime)) {
    throw new Error("Partial-day blocks require a valid start and end time.");
  }

  const { supabase } = await requireAdmin(locale);

  const { data: location, error: locationError } = await supabase.from("locations").select("id").eq("slug", block.location).single();

  if (locationError || !location) {
    throw new Error(locationError?.message ?? "Location not found.");
  }

  const { error } = await supabase
    .from("availability_blocks")
    .update({
      location_id: location.id,
      block_date: block.date,
      full_day: block.fullDay,
      start_time: block.fullDay ? null : block.startTime,
      end_time: block.fullDay ? null : block.endTime,
      reason: block.reason ?? null
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateAdmin(locale, "availability");
}
