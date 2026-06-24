import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "outline" | "earth";
  type?: "button" | "submit";
  fullWidth?: boolean;
  icon?: string;
};

const variants = {
  primary: "border-on-background bg-on-background text-caravan-cream hover:bg-inverse-surface",
  outline: "border-on-background bg-transparent text-on-background hover:bg-caravan-cream",
  earth: "border-burnt-earth bg-burnt-earth text-caravan-cream hover:bg-on-background hover:border-on-background"
};

export function Button({ children, href, variant = "primary", type = "button", fullWidth = false, icon }: ButtonProps) {
  const className = `${fullWidth ? "flex w-full" : "inline-flex"} items-center justify-center gap-2 border-2 px-8 py-4 font-button text-button uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-burnt-earth focus:ring-offset-2 ${variants[variant]}`;

  const content = (
    <>
      {children}
      {icon ? <Icon name={icon} className="text-[18px]" /> : null}
    </>
  );

  if (href) {
    return (
      <Link className={className} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button className={className} type={type}>
      {content}
    </button>
  );
}
