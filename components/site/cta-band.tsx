import { ButtonLink } from "@/components/ui/button";

type CtaBandProps = {
  heading: string;
  action: string;
  href?: string;
};

/** The closing "ask" band. Appears on the homepage and About. */
export function CtaBand({ heading, action, href = "/contact" }: CtaBandProps) {
  return (
    <section>
      <div className="mx-auto flex max-w-frame flex-col items-center gap-8 px-6 py-24 text-center md:px-gutter">
        <h2 className="type-heading max-w-2xl text-ink">{heading}</h2>
        <ButtonLink href={href}>{action}</ButtonLink>
      </div>
    </section>
  );
}
