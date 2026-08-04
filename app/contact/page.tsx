import type { Metadata } from "next";

import { EnquiryForm } from "@/components/contact/enquiry-form";
import { Plate } from "@/components/ui/plate";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Commissions, collaborations, editorial deadlines and unsolicited opinions about typefaces.",
};

export default function ContactPage() {
  const details = [
    {
      label: "Email",
      value: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
    },
    {
      label: "Instagram",
      value: siteConfig.instagram.handle,
      href: siteConfig.instagram.url,
    },
    {
      label: "Representation",
      value: siteConfig.representation || "—",
      href: null,
    },
  ];

  return (
    <div className="mx-auto grid max-w-frame gap-14 px-6 py-20 md:grid-cols-2 md:px-gutter">
      <div>
        <h1 className="type-heading text-ink">Say hello.</h1>
        <p className="type-lede mt-5 max-w-md text-ink-muted">
          Commissions, collaborations, editorial deadlines and unsolicited
          opinions about typefaces — all welcome. Josh replies to everything,
          eventually.
        </p>

        <dl className="mt-12 space-y-6">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="type-label text-ink-muted">{detail.label}</dt>
              <dd className="mt-1.5 font-body text-[15px] font-medium text-ink">
                {detail.href ? (
                  <a
                    href={detail.href}
                    {...(detail.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    className="transition-colors hover:text-accent"
                  >
                    {detail.value}
                  </a>
                ) : (
                  detail.value
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-14 max-w-xs">
          <Plate
            image={{ ratio: "1/1", alt: "A drawing, for the sake of it" }}
            sizes="(max-width: 768px) 60vw, 20vw"
          />
        </div>
      </div>

      <EnquiryForm />
    </div>
  );
}
