import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Location, Service } from "@/lib/data";

type LocationRow = {
  slug: string;
  name: string;
  address: string;
  landmark: string;
  phone: string;
  timezone: string;
  opening_time: string;
  closing_time: string;
  slot_minutes: number;
  online_booking: boolean;
  season_months: number[] | null;
};

type ServiceRow = {
  slug: string;
  name: string;
  description: string;
  price_all: number;
  duration_min: number;
  bookable_online: boolean;
};

function shortTime(value: string): string {
  return value.slice(0, 5);
}

function mapLocation(row: LocationRow): Location {
  return {
    slug: row.slug as Location["slug"],
    name: row.name,
    address: row.address,
    landmark: row.landmark,
    phone: row.phone,
    timezone: row.timezone,
    openingTime: shortTime(row.opening_time),
    closingTime: shortTime(row.closing_time),
    slotMinutes: row.slot_minutes,
    onlineBooking: row.online_booking,
    seasonMonths: row.season_months
  };
}

function mapService(row: ServiceRow): Service {
  return {
    slug: row.slug as Service["slug"],
    name: row.name,
    description: row.description,
    priceAll: row.price_all,
    durationMin: row.duration_min,
    bookableOnline: row.bookable_online
  };
}

export async function getPublicLocations(): Promise<Location[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("locations")
    .select("slug,name,address,landmark,phone,timezone,opening_time,closing_time,slot_minutes,online_booking,season_months")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as LocationRow[]).map(mapLocation);
}

export async function getPublicServices(): Promise<Service[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("services")
    .select("slug,name,description,price_all,duration_min,bookable_online")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as ServiceRow[]).map(mapService);
}

export async function getPublicLocation(slug: string): Promise<Location | undefined> {
  const locations = await getPublicLocations();
  return locations.find((location) => location.slug === slug);
}
