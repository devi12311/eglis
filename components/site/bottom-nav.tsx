"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-20 items-center justify-around border-t-2 border-on-background bg-on-background px-4 pb-[env(safe-area-inset-bottom)] shadow-nav-top md:hidden">
      {items.map((item) => {
        const active = pathname === item.href || (item.href.split("/").length > 2 && pathname.startsWith(item.href));
        return (
          <Link
            className={`flex h-full w-full flex-col items-center justify-center transition-opacity ${
              active ? "bg-burnt-earth text-caravan-cream" : "text-caravan-cream/70 hover:text-caravan-cream"
            }`}
            href={item.href}
            key={item.href}
          >
            <Icon name={item.icon} filled={active} className="mb-1" />
            <span className="font-label-caps text-label-caps">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
