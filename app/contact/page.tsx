import type { Metadata } from "next";

import { ContactContent } from "@/components/contact/contact-content";
import { PageEndCard } from "@/components/ui/page-end-card";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Commissions, collaborations, editorial deadlines that are already late — all welcome.",
};

export default function ContactPage() {
  return (
    <PageEndCard>
      {/* pt-10 below md, not the full pt-20 -- stacked on top of the fixed
          nav's own reserved space, pt-20 read as a big empty band above the
          intro paragraph on a short mobile viewport. Unchanged from md up. */}
      <div className="pb-20 pt-10 md:pt-20">
        {/* No visible title, matching Work/Info -- the nav already shows
            Contact highlighted. A screen-reader-only h1 keeps the page's
            heading structure intact. */}
        <h1 className="sr-only">Contact</h1>
        <ContactContent />
      </div>
    </PageEndCard>
  );
}
