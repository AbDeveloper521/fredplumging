import Link from "next/link";
import { ArrowRight, Loader2, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "dark"
  | "ghost"
  | "phone";

type ButtonSize = "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Appends a right arrow that nudges on hover. */
  withArrow?: boolean;
  /** Prepends a phone icon (used with the phone variant). */
  withPhoneIcon?: boolean;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-red-600 text-white hover:bg-red-500 active:bg-red-600 shadow-[0_8px_20px_rgb(211_33_39/0.28)]",
  secondary:
    "bg-white text-navy-900 hover:bg-grey-100 border border-grey-300",
  outline:
    "border border-white/35 text-white hover:border-white/70 hover:bg-white/5",
  dark: "bg-navy-900 text-white hover:bg-navy-800",
  ghost: "text-navy-900 hover:bg-grey-100",
  phone:
    "bg-white/10 text-white border border-white/25 backdrop-blur-sm hover:bg-white/15 hover:border-white/40",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-12 px-6 text-[15px]",
  lg: "h-14 px-8 text-base",
};

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    withArrow = false,
    withPhoneIcon = false,
    loading = false,
    className,
    children,
    ...rest
  } = props;

  const classes = cn(
    "group/btn inline-flex items-center justify-center gap-2.5 rounded-xl font-semibold transition-all duration-200",
    "hover:-translate-y-px active:translate-y-0",
    "disabled:pointer-events-none disabled:opacity-60",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  const content = (
    <>
      {loading && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
      {!loading && withPhoneIcon && (
        <Phone aria-hidden="true" className="size-[18px]" />
      )}
      <span>{children}</span>
      {withArrow && !loading && (
        <ArrowRight
          aria-hidden="true"
          className="size-[18px] transition-transform duration-200 group-hover/btn:translate-x-0.5"
        />
      )}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    const { href, ...anchorRest } = rest as Omit<ButtonAsLink, keyof ButtonBaseProps>;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {content}
      </Link>
    );
  }

  const buttonRest = rest as Omit<ButtonAsButton, keyof ButtonBaseProps>;
  return (
    <button
      className={classes}
      disabled={loading || buttonRest.disabled}
      {...buttonRest}
    >
      {content}
    </button>
  );
}
