import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "quiet";

const VARIANT: Record<Variant, string> = {
  /* The blue pill — reserved for the commission path. */
  primary: "bg-brand text-canvas hover:scale-[1.04]",
  /* Outline, for anything that isn't asking for money. Same rule as the
     Work page's filter chips: black outline at rest, blue on hover. */
  quiet: "border border-ink text-ink hover:border-brand",
};

const BASE =
  "type-label inline-flex items-center justify-center rounded-full px-6 py-3 transition-all duration-200";

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
