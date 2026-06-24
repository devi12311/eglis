export type Location = {
  slug: "saranda" | "elbasan";
  name: string;
  address: string;
  landmark: string;
  phone: string;
  timezone: string;
  openingTime: string;
  closingTime: string;
  slotMinutes: number;
  onlineBooking: boolean;
  seasonMonths: number[] | null;
};

export type Service = {
  slug: "fresh-cut" | "full-reset" | "summer-pass" | "beach-to-night" | "crew";
  name: string;
  description: string;
  priceAll: number;
  durationMin: number;
  bookableOnline: boolean;
};

export const locations: Location[] = [
  {
    slug: "saranda",
    name: "Saranda Caravan",
    address: "[ADD Saranda address]",
    landmark: "[ADD Saranda landmark]",
    phone: "+355 00 000 0000",
    timezone: "Europe/Tirane",
    openingTime: "10:00",
    closingTime: "24:00",
    slotMinutes: 30,
    onlineBooking: true,
    seasonMonths: [6, 7, 8, 9]
  },
  {
    slug: "elbasan",
    name: "Elbasan Chair",
    address: "[ADD Elbasan address]",
    landmark: "[ADD Elbasan landmark]",
    phone: "+355 00 000 0001",
    timezone: "Europe/Tirane",
    openingTime: "10:00",
    closingTime: "24:00",
    slotMinutes: 30,
    onlineBooking: false,
    seasonMonths: null
  }
];

export const services: Service[] = [
  {
    slug: "fresh-cut",
    name: "Fresh Cut",
    description: "Clean fade, shape, and finish for the daily sharp look.",
    priceAll: 1000,
    durationMin: 30,
    bookableOnline: true
  },
  {
    slug: "full-reset",
    name: "Full Reset",
    description: "Cut, beard detail, hot towel finish, and reset before the night starts.",
    priceAll: 1500,
    durationMin: 30,
    bookableOnline: true
  },
  {
    slug: "summer-pass",
    name: "Summer Pass",
    description: "Seasonal package for regular trims through beach months.",
    priceAll: 0,
    durationMin: 30,
    bookableOnline: false
  },
  {
    slug: "beach-to-night",
    name: "Beach to Night",
    description: "Group-ready polish before dinner, music, or a late walk by the sea.",
    priceAll: 0,
    durationMin: 30,
    bookableOnline: false
  },
  {
    slug: "crew",
    name: "Crew",
    description: "Call ahead for friends, events, and coordinated cuts.",
    priceAll: 0,
    durationMin: 30,
    bookableOnline: false
  }
];

export const confirmedReservations = [
  {
    publicRef: "ECC-8942",
    customerName: "Demo Client",
    phone: "+355 00 000 0000",
    serviceSlug: "fresh-cut",
    locationSlug: "saranda",
    resDate: "2026-07-12",
    startTime: "18:30",
    status: "confirmed"
  }
];

export function formatAll(value: number): string {
  return value > 0 ? `${value.toLocaleString("en-US")} ALL` : "Call";
}

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export function getLocation(slug: string): Location | undefined {
  return locations.find((location) => location.slug === slug);
}
