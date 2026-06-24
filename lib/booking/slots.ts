import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export function toMinutes(time: string): number {
  const [hour = "0", minute = "0"] = time.slice(0, 5).split(":");
  return Number(hour) * 60 + Number(minute);
}

export function fromMinutes(total: number): string {
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

type LocationConfig = {
  id: string;
  timezone: string;
  opening_time: string;
  closing_time: string;
  slot_minutes: number;
  online_booking: boolean;
  active: boolean;
  season_months: number[] | null;
};

type ServiceConfig = {
  bookable_online: boolean;
  active: boolean;
};

type SlotOptions = {
  // Admin overrides: book offline locations, off-season dates, and inside the lead-time window.
  ignoreOnlineBooking?: boolean;
  ignoreSeason?: boolean;
  ignoreLeadTime?: boolean;
};

const LEAD_TIME_MINUTES = 15;

function nowInTimezone(timezone: string): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const lookup = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  const date = `${lookup("year")}-${lookup("month")}-${lookup("day")}`;
  const hour = lookup("hour") === "24" ? "00" : lookup("hour");
  const minutes = Number(hour) * 60 + Number(lookup("minute"));
  return { date, minutes };
}

/**
 * Computes the bookable start times for a location/service/date directly in the app,
 * using numeric-minute math (handles a 24:00 closing time, unlike the DB function).
 * Reads confirmed reservations and availability blocks via the service-role client.
 */
export async function getAvailableSlots(
  locationSlug: string,
  serviceSlug: string,
  date: string,
  options: SlotOptions = {}
): Promise<string[]> {
  const supabase = createSupabaseAdminClient();

  const [{ data: location }, { data: service }] = await Promise.all([
    supabase
      .from("locations")
      .select("id,timezone,opening_time,closing_time,slot_minutes,online_booking,active,season_months")
      .eq("slug", locationSlug)
      .maybeSingle<LocationConfig>(),
    supabase.from("services").select("bookable_online,active").eq("slug", serviceSlug).maybeSingle<ServiceConfig>()
  ]);

  if (!location || !service || !location.active || !service.active) {
    return [];
  }

  if (!options.ignoreOnlineBooking && (!location.online_booking || !service.bookable_online)) {
    return [];
  }

  const month = Number(date.slice(5, 7));
  if (!options.ignoreSeason && location.season_months && !location.season_months.includes(month)) {
    return [];
  }

  const slotMinutes = location.slot_minutes;
  const open = toMinutes(location.opening_time);
  const close = toMinutes(location.closing_time);
  const lastStart = close - slotMinutes;

  const [{ data: reservations }, { data: blocks }] = await Promise.all([
    supabase
      .from("reservations")
      .select("start_time")
      .eq("location_id", location.id)
      .eq("res_date", date)
      .eq("status", "confirmed"),
    supabase
      .from("availability_blocks")
      .select("full_day,start_time,end_time")
      .eq("location_id", location.id)
      .eq("block_date", date)
  ]);

  const taken = new Set((reservations ?? []).map((row) => toMinutes(row.start_time as string)));
  const blockRanges = (blocks ?? []).map((block) => ({
    fullDay: block.full_day as boolean,
    start: block.start_time ? toMinutes(block.start_time as string) : null,
    end: block.end_time ? toMinutes(block.end_time as string) : null
  }));

  const today = nowInTimezone(location.timezone);
  const slots: string[] = [];

  for (let minute = open; minute <= lastStart; minute += slotMinutes) {
    const slotEnd = minute + slotMinutes;

    if (taken.has(minute)) {
      continue;
    }

    const blocked = blockRanges.some((block) => {
      if (block.fullDay) {
        return true;
      }
      if (block.start === null || block.end === null) {
        return false;
      }
      return minute < block.end && slotEnd > block.start;
    });
    if (blocked) {
      continue;
    }

    if (!options.ignoreLeadTime && date === today.date && minute < today.minutes + LEAD_TIME_MINUTES) {
      continue;
    }

    slots.push(fromMinutes(minute));
  }

  return slots;
}

export function isInSeason(month: number, seasonMonths: number[] | null): boolean {
  if (!seasonMonths) {
    return true;
  }
  return seasonMonths.includes(month);
}
