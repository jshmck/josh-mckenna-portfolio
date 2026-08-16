import { clients } from "@/lib/about";

/** brightness-0 forces every logo to solid black regardless of its source
 *  colours (a plain grayscale filter still leaves midtones grey) — flat,
 *  no hover-colour reveal, per Josh. Clients without a logo file fall back
 *  to plain text at matching height. `justify-between` was tried to spread
 *  each row across the full width, but it stretched short trailing rows
 *  (2 logos) to opposite corners, which read worse than the ragged-right
 *  gap it was meant to fix — the `clients` order in lib/about.ts (icons
 *  alternating with wordmarks) does the actual work of keeping rows close
 *  to full without that side effect. */
export function ClientLogos() {
  return (
    <ul className="flex flex-wrap items-center gap-x-10 gap-y-6">
      {clients.map((client) =>
        client.logo ? (
          <li
            key={client.name}
            className={`flex items-center ${
              client.size === "xl"
                ? "h-14"
                : client.size === "lg" || client.size === "icon"
                  ? "h-10"
                  : "h-7"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, no responsive sizing needed */}
            <img
              src={client.logo}
              alt={client.name}
              className="h-full w-auto brightness-0"
            />
          </li>
        ) : (
          <li key={client.name} className="flex h-7 items-center">
            <span className="font-body text-[15px] text-ink-muted">
              {client.name}
            </span>
          </li>
        ),
      )}
    </ul>
  );
}
