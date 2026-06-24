import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminLocation = {
  id: string;
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
  active: boolean;
  sort_order: number;
};

export type AdminService = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_all: number;
  duration_min: number;
  bookable_online: boolean;
  active: boolean;
  sort_order: number;
};

export type AdminReservation = {
  id: string;
  public_ref: string;
  customer_name: string;
  phone: string;
  res_date: string;
  start_time: string;
  end_time: string;
  price_all: number;
  status: "confirmed" | "cancelled" | "done" | "no_show";
  created_at: string;
  locations: { name: string; slug: string } | null;
  services: { name: string; slug: string } | null;
};

export type AdminAvailabilityBlock = {
  id: string;
  block_date: string;
  full_day: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
  locations: { name: string; slug: string } | null;
};

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function shortTime(value: string | null | undefined) {
  return value ? value.slice(0, 5) : "";
}

export function seasonMonthsInput(value: number[] | null) {
  return value?.join(",") ?? "";
}

function relationOne<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function requireAdmin(locale: string) {
  if (!hasSupabaseEnv()) {
    redirect(`/${locale}/admin/login?error=config`);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/${locale}/admin/login?error=session`);
  }

  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !admin) {
    redirect(`/${locale}/admin/login?error=not-allowed`);
  }

  return { supabase, user };
}

export async function getAdminDashboard(locale: string) {
  const { supabase } = await requireAdmin(locale);
  const today = new Date().toISOString().slice(0, 10);

  const [reservationsResult, locationsResult, servicesResult] = await Promise.all([
    supabase.from("reservations").select("id,status,res_date").eq("res_date", today),
    supabase.from("locations").select("id,online_booking,active"),
    supabase.from("services").select("id,bookable_online,active")
  ]);

  if (reservationsResult.error) {
    throw new Error(reservationsResult.error.message);
  }
  if (locationsResult.error) {
    throw new Error(locationsResult.error.message);
  }
  if (servicesResult.error) {
    throw new Error(servicesResult.error.message);
  }

  const reservations = reservationsResult.data ?? [];
  const locations = locationsResult.data ?? [];
  const services = servicesResult.data ?? [];

  return {
    today,
    confirmedToday: reservations.filter((reservation) => reservation.status === "confirmed").length,
    doneToday: reservations.filter((reservation) => reservation.status === "done").length,
    activeLocations: locations.filter((location) => location.active).length,
    onlineLocations: locations.filter((location) => location.online_booking).length,
    bookableServices: services.filter((service) => service.bookable_online && service.active).length
  };
}

export async function getAdminReservations(locale: string) {
  const { supabase } = await requireAdmin(locale);
  const { data, error } = await supabase
    .from("reservations")
    .select("id,public_ref,customer_name,phone,res_date,start_time,end_time,price_all,status,created_at,locations(name,slug),services(name,slug)")
    .order("res_date", { ascending: false })
    .order("start_time", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Array<Omit<AdminReservation, "locations" | "services"> & {
    locations: AdminReservation["locations"] | AdminReservation["locations"][];
    services: AdminReservation["services"] | AdminReservation["services"][];
  }>).map((reservation) => ({
    ...reservation,
    locations: relationOne(reservation.locations),
    services: relationOne(reservation.services)
  }));
}

export async function getAdminLocations(locale: string) {
  const { supabase } = await requireAdmin(locale);
  const { data, error } = await supabase.from("locations").select("*").order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AdminLocation[];
}

export async function getAdminServices(locale: string) {
  const { supabase } = await requireAdmin(locale);
  const { data, error } = await supabase.from("services").select("*").order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AdminService[];
}

export async function getAdminAvailability(locale: string) {
  const { supabase } = await requireAdmin(locale);
  const [locationsResult, blocksResult] = await Promise.all([
    supabase.from("locations").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("availability_blocks")
      .select("id,block_date,full_day,start_time,end_time,reason,created_at,locations(name,slug)")
      .order("block_date", { ascending: false })
      .limit(100)
  ]);

  if (locationsResult.error) {
    throw new Error(locationsResult.error.message);
  }
  if (blocksResult.error) {
    throw new Error(blocksResult.error.message);
  }

  const blocks = (blocksResult.data ?? []) as Array<Omit<AdminAvailabilityBlock, "locations"> & {
    locations: AdminAvailabilityBlock["locations"] | AdminAvailabilityBlock["locations"][];
  }>;

  return {
    locations: (locationsResult.data ?? []) as AdminLocation[],
    blocks: blocks.map((block) => ({
      ...block,
      locations: relationOne(block.locations)
    }))
  };
}
