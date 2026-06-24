import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatAll, type Service } from "@/lib/data";

type ServiceCardProps = {
  service: Service;
  locale: string;
};

export function ServiceCard({ service, locale }: ServiceCardProps) {
  return (
    <article className="group flex flex-col justify-between gap-stack-md border-b border-on-background/20 py-stack-lg md:flex-row md:items-center">
      <div className="md:max-w-[55%]">
        <h3 className="font-headline-lg-mobile text-headline-lg-mobile uppercase md:font-headline-lg md:text-headline-lg">
          {service.name}
        </h3>
        <p className="mt-stack-sm font-body-md text-body-md text-on-surface-variant">{service.description}</p>
        <span className="mt-stack-sm inline-flex items-center gap-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
          <Icon name="schedule" className="text-[16px]" />
          {service.durationMin} min
        </span>
      </div>
      <div className="flex items-center justify-between gap-stack-md md:flex-col md:items-end">
        <p className="font-display-xl-mobile text-display-xl-mobile">{formatAll(service.priceAll)}</p>
        {service.bookableOnline ? (
          <Button href={`/${locale}/book`}>Book now</Button>
        ) : (
          <Button href="tel:+355684413280" variant="outline" icon="phone">
            Call / Inquire
          </Button>
        )}
      </div>
    </article>
  );
}
