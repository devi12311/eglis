import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { Location } from "@/lib/data";

type LocationCardProps = {
  location: Location;
  locale: string;
};

export function LocationCard({ location, locale }: LocationCardProps) {
  const subtitle = [location.landmark, location.address].filter(Boolean).join(" • ");

  if (location.onlineBooking) {
    return (
      <Link
        className="group flex min-h-[240px] flex-col justify-between border-2 border-on-background bg-caravan-cream p-stack-md transition-colors hover:bg-surface-container-high"
        href={`/${locale}/book`}
      >
        <div>
          <h3 className="mb-stack-sm font-subheading text-subheading uppercase text-on-background">{location.name}</h3>
          <p className="mb-stack-md font-label-caps text-label-caps uppercase text-on-surface-variant">{subtitle}</p>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-stack-sm">
            <span className="h-3 w-3 rounded-full bg-on-background" />
            <span className="font-label-caps text-label-caps font-bold text-on-background">Status: Book Now</span>
          </div>
          <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-2" />
        </div>
      </Link>
    );
  }

  return (
    <div className="flex min-h-[240px] flex-col justify-between border-2 border-on-surface-variant bg-surface-container-low p-stack-md opacity-60">
      <div>
        <h3 className="mb-stack-sm font-subheading text-subheading uppercase text-on-surface-variant">{location.name}</h3>
        <p className="mb-stack-md font-label-caps text-label-caps uppercase text-on-surface-variant">{subtitle}</p>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-stack-sm">
          <span className="h-3 w-3 rounded-full border-2 border-on-surface-variant" />
          <span className="font-label-caps text-label-caps text-on-surface-variant">Online reservations unavailable</span>
        </div>
      </div>
    </div>
  );
}
