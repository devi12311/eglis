import { z } from "zod";
import { locales } from "@/lib/i18n/config";

export const reservationSchema = z.object({
  service: z.string().min(1).max(60),
  location: z.string().min(1).max(60),
  date: z.string().min(10),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().min(2).max(80),
  phone: z.string().min(6).max(24),
  locale: z.enum(locales)
});

export const adminReservationSchema = z.object({
  service: z.string().min(1).max(60),
  location: z.string().min(1).max(60),
  date: z.string().min(10),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().min(2).max(80),
  phone: z.string().min(6).max(24)
});

export const serviceSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes."),
  name: z.string().min(2).max(80),
  description: z.string().min(2).max(400),
  priceAll: z.number().int().min(0),
  durationMin: z.number().int().min(5).max(480),
  bookableOnline: z.boolean(),
  active: z.boolean(),
  sortOrder: z.number().int()
});

export const availabilityBlockSchema = z.object({
  location: z.enum(["saranda", "elbasan"]),
  date: z.string().min(10),
  fullDay: z.boolean(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  reason: z.string().max(160).optional()
});

export function normalizePhone(phone: string): string {
  const compact = phone.replace(/[^\d+]/g, "");
  if (compact.startsWith("+")) {
    return compact;
  }
  if (compact.startsWith("355")) {
    return `+${compact}`;
  }
  return `+355${compact.replace(/^0+/, "")}`;
}
