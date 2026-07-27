import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { serviceHref, type Service } from "@/data/services";
import { navIcons } from "@/components/layout/navIcons";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  featured?: boolean;
  className?: string;
}

export function ServiceCard({ service, featured = false, className }: ServiceCardProps) {
  const Icon = navIcons[service.icon];

  return (
    <Link
      href={serviceHref(service.slug)}
      className={cn(
        "group relative isolate flex flex-col overflow-hidden rounded-2xl bg-navy-900 shadow-(--shadow-card) transition-shadow duration-300 hover:shadow-(--shadow-card-lg)",
        featured ? "min-h-[340px] sm:min-h-[400px]" : "min-h-[300px] sm:min-h-[340px]",
        className,
      )}
    >
      {/* Photography layer — real CMS photo when set, placeholder otherwise */}
      <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
        {service.photo ? (
          <Image
            src={service.photo.url}
            alt={service.photo.alt}
            fill
            sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"}
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder label={service.imageAlt} icon={Icon} showCaption={false} />
        )}
      </div>

      {/* Legibility overlay — deepens on hover */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/55 to-navy-950/15 transition-colors duration-300 group-hover:from-navy-950 group-hover:via-navy-950/70"
      />

      {/* Red accent line — slides in on hover */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-red-500 transition-transform duration-300 group-hover:scale-x-100"
      />

      <div className="relative mt-auto flex flex-col gap-3 p-6 sm:p-7">
        <span className="flex size-10 items-center justify-center rounded-lg border border-white/15 bg-white/10 backdrop-blur-sm">
          <Icon aria-hidden="true" className="size-5 text-red-500" />
        </span>
        <h3
          className={cn(
            "font-extrabold tracking-tight text-white",
            featured ? "text-2xl sm:text-[27px]" : "text-xl",
          )}
        >
          {service.title}
        </h3>
        <p className="max-w-md text-[15px] leading-relaxed text-grey-300">
          {service.shortDescription}
        </p>
        <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-white">
          Learn more
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 text-red-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
