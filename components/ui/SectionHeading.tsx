import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  theme?: "light" | "dark";
  className?: string;
  /** Narrow the paragraph on its own — e.g. a readable measure under a
      full-width heading. */
  descriptionClassName?: string;
  /** Heading level — defaults to h2. */
  as?: "h1" | "h2" | "h3";
  /** id applied to the heading element, for section aria-labelledby. */
  titleId?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  theme = "light",
  className,
  descriptionClassName,
  as: Heading = "h2",
  titleId,
}: SectionHeadingProps) {
  const dark = theme === "dark";

  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-4 flex items-center gap-3 eyebrow",
            align === "center" && "justify-center",
            dark ? "text-red-500" : "text-red-600",
          )}
        >
          <span aria-hidden="true" className="h-px w-8 bg-red-500" />
          {eyebrow}
          {align === "center" && (
            <span aria-hidden="true" className="h-px w-8 bg-red-500" />
          )}
        </p>
      )}
      <Heading
        id={titleId}
        className={cn(
          "text-[32px] leading-[1.12] font-extrabold tracking-tight text-balance sm:text-4xl lg:text-[44px] lg:leading-[1.08]",
          dark ? "text-white" : "text-navy-900",
        )}
      >
        {title}
      </Heading>
      {description && (
        <p
          className={cn(
            "mt-5 text-[18px] leading-relaxed",
            dark ? "text-grey-300" : "text-grey-500",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
