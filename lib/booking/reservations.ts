import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fromMinutes, getAvailableSlots, toMinutes } from "@/lib/booking/slots";

export type CreateReservationInput = {
  locationSlug: string;
  serviceSlug: string;
  customerName: string;
  phone: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  locale: string;
  // Admin override: skip availability/season/lead-time checks. The DB unique index
  // still prevents two confirmed bookings in the same slot.
  bypassChecks?: boolean;
};

export type CreateReservationResult =
  | { ok: true; publicRef: string; cancelToken: string }
  | { ok: false; error: "invalid" | "unavailable" | "slot_taken" };

const SLOT_UNIQUE_INDEX = "reservations_active_slot_unique";

function generateRef(): string {
  return `ECC-${Math.floor(1000 + Math.random() * 9000)}`;
}

function relationName(value: { name: string } | { name: string }[] | null): string | null {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? value[0]?.name ?? null : value.name;
}

export async function createReservation(input: CreateReservationInput): Promise<CreateReservationResult> {
  const supabase = createSupabaseAdminClient();

  const [{ data: location }, { data: service }] = await Promise.all([
    supabase.from("locations").select("id,slot_minutes,active").eq("slug", input.locationSlug).maybeSingle(),
    supabase.from("services").select("id,price_all,active").eq("slug", input.serviceSlug).maybeSingle()
  ]);

  if (!location || !service || !location.active || !service.active) {
    return { ok: false, error: "invalid" };
  }

  if (!input.bypassChecks) {
    const slots = await getAvailableSlots(input.locationSlug, input.serviceSlug, input.date);
    if (!slots.includes(input.startTime)) {
      return { ok: false, error: "unavailable" };
    }
  }

  const endTime = fromMinutes(toMinutes(input.startTime) + (location.slot_minutes as number));

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const publicRef = generateRef();
    const { data, error } = await supabase
      .from("reservations")
      .insert({
        public_ref: publicRef,
        location_id: location.id,
        service_id: service.id,
        customer_name: input.customerName,
        phone: input.phone,
        res_date: input.date,
        start_time: input.startTime,
        end_time: endTime,
        price_all: service.price_all,
        status: "confirmed",
        locale: input.locale
      })
      .select("public_ref,cancel_token")
      .single();

    if (!error && data) {
      return { ok: true, publicRef: data.public_ref as string, cancelToken: data.cancel_token as string };
    }

    if (error?.code === "23505") {
      const detail = `${error.message} ${error.details ?? ""}`;
      if (detail.includes(SLOT_UNIQUE_INDEX)) {
        return { ok: false, error: "slot_taken" };
      }
      // public_ref collision — retry with a fresh ref.
      continue;
    }

    throw new Error(error?.message ?? "Failed to create reservation.");
  }

  return { ok: false, error: "slot_taken" };
}

export type ReservationTicket = {
  publicRef: string;
  cancelToken: string;
  customerName: string;
  date: string;
  startTime: string;
  endTime: string;
  priceAll: number;
  status: string;
  serviceName: string | null;
  locationName: string | null;
};

export async function getReservationByRef(ref: string): Promise<ReservationTicket | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("reservations")
    .select("public_ref,cancel_token,customer_name,res_date,start_time,end_time,price_all,status,locations(name),services(name)")
    .eq("public_ref", ref)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    publicRef: data.public_ref as string,
    cancelToken: data.cancel_token as string,
    customerName: data.customer_name as string,
    date: data.res_date as string,
    startTime: data.start_time as string,
    endTime: data.end_time as string,
    priceAll: data.price_all as number,
    status: data.status as string,
    serviceName: relationName(data.services as never),
    locationName: relationName(data.locations as never)
  };
}

export async function cancelReservation(ref: string, token: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reservations")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("public_ref", ref)
    .eq("cancel_token", token)
    .neq("status", "cancelled")
    .select("public_ref");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).length > 0;
}
