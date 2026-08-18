import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "quiet";

const VARIANT: Record<Variant, string> = {
  /* The blue pill — reserved for the commission path. */
  primary: "bg-brand text-canvas hover:scale-105",
  /* Outline, for anything that isn't asking for money. Same rule as the
     Work page's filter chips: black outline/muted text at rest, both blue
     on hover, and — for the one submit-button use (shop waitlist) — an
     active state mirroring a chip's selected fill, same as the contact
     form's HOWDY button. */
  quiet:
    "border border-ink text-ink-muted hover:scale-105 hover:border-brand hover:text-brand active:border-brand active:bg-brand active:text-canvas",
};

/** duration-500 + the overshoot curve matches BackToTop's bounce recipe,
 *  now the shared hover language for every filled/outlined pill on the
 *  site (chips, HOWDY, Notify Me, this). */
const BASE =
  "type-label inline-flex items-center justify-center rounded-full px-6 py-3 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]";

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

export function ButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
}: ButtonLinkProps) {
  return (
    <Link href={href} className={`${BASE} ${VARIANT[variant]} ${className}`}>
      {children}
    </Link>
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${BASE} ${VARIANT[variant]} disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
