import type { Metadata } from "next";

import { ContactContent } from "@/components/contact/contact-content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Commissions, collaborations, editorial deadlines that are already late — all welcome.",
};

export default function ContactPage() {
  return (
    <div className="py-20">
      {/* No visible title, matching Work/Info -- the nav already shows
          Contact highlighted. A screen-reader-only h1 keeps the page's
          heading structure intact. */}
      <h1 className="sr-only">Contact</h1>
      <ContactContent />
    </div>
  );
}
