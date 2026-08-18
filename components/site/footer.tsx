import { siteConfig } from "@/lib/site";

/**
 * Footer — now just the copyright line. The client list, talks/features
 * list, and contact details that used to live here moved into the Info
 * and Contact pages' own content (see app/about/page.tsx and
 * app/contact/page.tsx) — Josh wanted them as real page content, not
 * footer chrome. Lives in the root layout so it's on every page — the
 * AI-training notice needs to be visible wherever a visitor lands, not
 * just on Info, which most people arriving via search or a shared link
 * would never scroll to.
 */
export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-frame px-6 py-10 md:px-gutter">
        {/* Two explicit paragraphs, not one long run-on string — this
            sentence is too long to fit type-label's mono/uppercase
            treatment on one line at any readable size, so it drops to
            font-body at a small size instead. Splitting here guarantees
            the line break lands right after "All rights reserved."
            instead of wherever the browser happens to wrap. */}
        <p className="font-body text-[11px] text-ink-muted">
          Copyright © {new Date().getFullYear()} {siteConfig.name}. All rights
          reserved.
        </p>
        <p className="font-body mt-1 text-[11px] text-ink-muted">
          No content on this site may be used to train, fine-tune or
          otherwise develop any artificial intelligence or machine learning
          model without prior written permission.
        </p>
      </div>
    </footer>
  );
}
